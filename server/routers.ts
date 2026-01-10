import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

// Helper to generate unique slug
function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}-${nanoid(8)}`;
}

// Admin procedure - requires admin or superadmin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'superadmin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Superadmin procedure
const superadminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'superadmin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Superadmin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // PROJECT ROUTES
  // ============================================
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProjectsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        // Check ownership unless admin
        if (project.userId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return project;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const project = await db.getProjectBySlug(input.slug);
        if (!project || !project.landingPageEnabled) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        // Increment views
        await db.incrementProjectViews(project.id);
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        prompt: z.string().optional(),
        appType: z.enum(["android", "ios", "pwa", "hybrid", "web", "desktop"]).default("hybrid"),
        templateId: z.number().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        features: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check app limit
        const userProjectCount = await db.getProjectCountByUserId(ctx.user.id);
        if (userProjectCount >= ctx.user.appLimit && ctx.user.subscriptionTier !== 'unlimited') {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: `App limit reached. You can create up to ${ctx.user.appLimit} apps with your current plan.` 
          });
        }

        const slug = generateSlug(input.name);
        
        // If using template, get template data
        let templateData = null;
        if (input.templateId) {
          templateData = await db.getTemplateById(input.templateId);
          if (templateData) {
            await db.incrementTemplateUsage(input.templateId);
          }
        }

        const projectId = await db.createProject({
          userId: ctx.user.id,
          name: input.name,
          slug,
          description: input.description || templateData?.description,
          prompt: input.prompt || templateData?.defaultPrompt,
          appType: input.appType,
          templateId: input.templateId,
          primaryColor: input.primaryColor || templateData?.primaryColor || "#6366f1",
          secondaryColor: input.secondaryColor || templateData?.secondaryColor || "#8b5cf6",
          features: input.features || templateData?.features || [],
          status: "pending",
          packageName: `com.clickngoai.${slug.replace(/-/g, '_')}`,
        });

        // Add to build queue
        await db.addToBuildQueue({
          projectId,
          userId: ctx.user.id,
          priority: ctx.user.subscriptionTier === 'unlimited' ? 10 : ctx.user.subscriptionTier === 'multiple' ? 5 : 0,
          status: "queued",
          estimatedTime: 120,
        });

        // Increment user app count
        await db.incrementUserAppCount(ctx.user.id);

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "project_created",
          entityType: "project",
          entityId: projectId,
          details: { name: input.name, appType: input.appType },
        });

        return { id: projectId, slug };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        features: z.array(z.string()).optional(),
        landingPageEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        if (project.userId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        const { id, ...updateData } = input;
        await db.updateProject(id, updateData);

        await db.logActivity({
          userId: ctx.user.id,
          action: "project_updated",
          entityType: "project",
          entityId: id,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id);
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        if (project.userId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        await db.deleteProject(input.id);

        await db.logActivity({
          userId: ctx.user.id,
          action: "project_deleted",
          entityType: "project",
          entityId: input.id,
        });

        return { success: true };
      }),

    trackDownload: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementProjectDownloads(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // TEMPLATE ROUTES
  // ============================================
  templates: router({
    list: publicProcedure.query(async () => {
      return db.getAllTemplates(true);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const template = await db.getTemplateById(input.id);
        if (!template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }
        return template;
      }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return db.getTemplatesByCategory(input.category);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum([
          "food_delivery", "ecommerce", "social_media", "booking", 
          "fitness", "task_manager", "chat", "lms", "crm", "news", "other"
        ]),
        icon: z.string().optional(),
        previewImage: z.string().optional(),
        features: z.array(z.string()).optional(),
        defaultPrompt: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        isPremium: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const slug = generateSlug(input.name);
        const templateId = await db.createTemplate({
          ...input,
          slug,
        });
        return { id: templateId, slug };
      }),
  }),

  // ============================================
  // BUILD QUEUE ROUTES
  // ============================================
  builds: router({
    getStatus: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        if (project.userId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        const buildItem = await db.getBuildQueueByProjectId(input.projectId);
        return {
          project,
          build: buildItem,
        };
      }),

    getQueue: adminProcedure.query(async () => {
      return db.getAllBuildQueue(50);
    }),

    processNext: adminProcedure.mutation(async () => {
      const nextBuild = await db.getNextQueuedBuild();
      if (!nextBuild) {
        return { message: "No builds in queue" };
      }

      // Start processing
      await db.updateBuildQueue(nextBuild.id, {
        status: "processing",
        startedAt: new Date(),
        currentStep: "Initializing build environment",
      });

      await db.updateProject(nextBuild.projectId, {
        status: "building",
        buildProgress: 10,
      });

      // Simulate build process (in real implementation, this would trigger actual build)
      const buildSteps = [
        { step: "Analyzing requirements", progress: 20 },
        { step: "Generating code structure", progress: 35 },
        { step: "Building UI components", progress: 50 },
        { step: "Compiling application", progress: 70 },
        { step: "Packaging for distribution", progress: 85 },
        { step: "Finalizing build", progress: 95 },
      ];

      // For demo, we'll complete immediately
      await db.updateBuildQueue(nextBuild.id, {
        status: "completed",
        progress: 100,
        currentStep: "Build completed",
        completedAt: new Date(),
      });

      await db.updateProject(nextBuild.projectId, {
        status: "completed",
        buildProgress: 100,
        completedAt: new Date(),
        apkUrl: `/api/downloads/${nextBuild.projectId}/app.apk`,
        ipaUrl: `/api/downloads/${nextBuild.projectId}/app.ipa`,
        pwaUrl: `/landing/app/${(await db.getProjectById(nextBuild.projectId))?.slug}`,
      });

      return { success: true, projectId: nextBuild.projectId };
    }),

    simulateBuild: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        if (project.userId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }

        // Update to completed status
        await db.updateProject(input.projectId, {
          status: "completed",
          buildProgress: 100,
          completedAt: new Date(),
          apkUrl: `/api/downloads/${input.projectId}/app.apk`,
          ipaUrl: `/api/downloads/${input.projectId}/app.ipa`,
          pwaUrl: `/landing/app/${project.slug}`,
          webUrl: `/landing/app/${project.slug}`,
        });

        const buildItem = await db.getBuildQueueByProjectId(input.projectId);
        if (buildItem) {
          await db.updateBuildQueue(buildItem.id, {
            status: "completed",
            progress: 100,
            currentStep: "Build completed",
            completedAt: new Date(),
          });
        }

        return { success: true };
      }),
  }),

  // ============================================
  // SUBSCRIPTION ROUTES
  // ============================================
  subscriptions: router({
    getPricing: publicProcedure.query(async () => {
      const plans = await db.getAllPricingPlans();
      if (plans.length === 0) {
        // Return default pricing if no plans in DB
        return [
          {
            tier: "free",
            nameEn: "Free Trial",
            priceInr: 0,
            priceUsd: 0,
            appLimit: 1,
            features: ["1 App", "Basic Templates", "Community Support"],
            isPopular: false,
          },
          {
            tier: "single",
            nameEn: "Single App",
            priceInr: 3999,
            priceUsd: 49,
            appLimit: 1,
            features: ["1 Premium App", "All Templates", "Priority Support", "Custom Branding"],
            isPopular: false,
          },
          {
            tier: "multiple",
            nameEn: "15 Apps Pack",
            priceInr: 24999,
            priceUsd: 79,
            appLimit: 15,
            features: ["15 Premium Apps", "All Templates", "Priority Support", "Custom Branding", "Analytics Dashboard"],
            isPopular: true,
          },
          {
            tier: "unlimited",
            nameEn: "Unlimited",
            priceInr: 34999,
            priceUsd: 199,
            appLimit: 9999,
            features: ["Unlimited Apps", "All Templates", "24/7 Support", "Custom Branding", "Analytics Dashboard", "API Access", "White Label"],
            isPopular: false,
          },
        ];
      }
      return plans;
    }),

    getMy: protectedProcedure.query(async ({ ctx }) => {
      return db.getSubscriptionByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        tier: z.enum(["single", "multiple", "unlimited"]),
        currency: z.enum(["INR", "USD"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get pricing
        const pricing = {
          single: { inr: 3999, usd: 49, limit: 1 },
          multiple: { inr: 24999, usd: 79, limit: 15 },
          unlimited: { inr: 34999, usd: 199, limit: 9999 },
        };

        const plan = pricing[input.tier];
        
        const subscriptionId = await db.createSubscription({
          userId: ctx.user.id,
          tier: input.tier,
          priceInr: plan.inr,
          priceUsd: plan.usd,
          currency: input.currency,
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        // Update user subscription
        await db.updateUser(ctx.user.id, {
          subscriptionTier: input.tier,
          appLimit: plan.limit,
        });

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription_created",
          entityType: "subscription",
          entityId: subscriptionId,
          details: { tier: input.tier, currency: input.currency },
        });

        return { id: subscriptionId };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.cancelSubscription(input.id);
        await db.updateUser(ctx.user.id, {
          subscriptionTier: "free",
          appLimit: 1,
        });

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription_cancelled",
          entityType: "subscription",
          entityId: input.id,
        });

        return { success: true };
      }),
  }),

  // ============================================
  // ADMIN ROUTES
  // ============================================
  admin: router({
    getStats: adminProcedure.query(async () => {
      const stats = await db.getSystemStats();
      const pendingBuilds = await db.getPendingBuildsCount();
      return { ...stats, pendingBuilds };
    }),

    getUsers: adminProcedure
      .input(z.object({ 
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return db.getAllUsers(input.limit, input.offset);
      }),

    updateUser: superadminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["user", "admin", "superadmin"]).optional(),
        subscriptionTier: z.enum(["free", "single", "multiple", "unlimited"]).optional(),
        appLimit: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateUser(id, updateData);
        return { success: true };
      }),

    getProjects: adminProcedure
      .input(z.object({ 
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return db.getAllProjects(input.limit, input.offset);
      }),

    getLogs: adminProcedure
      .input(z.object({ 
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        return db.getActivityLogs(input.limit, input.offset);
      }),

    getRecentProjects: adminProcedure.query(async () => {
      return db.getRecentProjects(10);
    }),

    getBuildQueue: adminProcedure.query(async () => {
      return db.getAllBuildQueue(50);
    }),
  }),

  // ============================================
  // AI GENERATION ROUTES
  // ============================================
  ai: router({
    generateAppIdea: protectedProcedure
      .input(z.object({ prompt: z.string().min(10) }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert app designer. Given a user's app idea, generate a detailed app specification including:
                - App name (creative and catchy)
                - Description (2-3 sentences)
                - Key features (5-7 features)
                - Suggested colors (primary and secondary hex codes)
                - Target audience
                Respond in JSON format.`
              },
              {
                role: "user",
                content: input.prompt
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "app_specification",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    features: { type: "array", items: { type: "string" } },
                    primaryColor: { type: "string" },
                    secondaryColor: { type: "string" },
                    targetAudience: { type: "string" },
                  },
                  required: ["name", "description", "features", "primaryColor", "secondaryColor", "targetAudience"],
                  additionalProperties: false,
                }
              }
            }
          });

          const content = response.choices[0]?.message?.content;
          if (content && typeof content === 'string') {
            return JSON.parse(content);
          }
          throw new Error("No response from AI");
        } catch (error) {
          console.error("AI generation error:", error);
          // Return fallback
          return {
            name: "My Awesome App",
            description: "A powerful application built with ClickNGoAI",
            features: ["User Authentication", "Dashboard", "Settings", "Notifications", "Profile Management"],
            primaryColor: "#6366f1",
            secondaryColor: "#8b5cf6",
            targetAudience: "General users",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
