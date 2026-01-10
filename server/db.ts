import { eq, desc, asc, and, sql, like, or, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  projects, InsertProject, Project,
  templates, InsertTemplate, Template,
  subscriptions, InsertSubscription,
  buildQueue, InsertBuildQueue,
  activityLogs, InsertActivityLog,
  apiKeys, InsertApiKey,
  pricingPlans, InsertPricingPlan
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER OPERATIONS
// ============================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'superadmin';
      updateSet.role = 'superadmin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return result[0]?.count ?? 0;
}

export async function incrementUserAppCount(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ 
    appsCreated: sql`${users.appsCreated} + 1`,
    updatedAt: new Date() 
  }).where(eq(users.id, userId));
}

// ============================================
// PROJECT OPERATIONS
// ============================================
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectsByUserId(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(limit).offset(offset);
}

export async function getAllProjects(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt)).limit(limit).offset(offset);
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(projects);
  return result[0]?.count ?? 0;
}

export async function getProjectCountByUserId(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.userId, userId));
  return result[0]?.count ?? 0;
}

export async function incrementProjectViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ 
    landingPageViews: sql`${projects.landingPageViews} + 1` 
  }).where(eq(projects.id, id));
}

export async function incrementProjectDownloads(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ 
    downloadCount: sql`${projects.downloadCount} + 1` 
  }).where(eq(projects.id, id));
}

// ============================================
// TEMPLATE OPERATIONS
// ============================================
export async function createTemplate(data: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(templates).values(data);
  return result[0].insertId;
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTemplateBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTemplates(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(templates).where(eq(templates.isActive, true)).orderBy(desc(templates.usageCount));
  }
  return db.select().from(templates).orderBy(desc(templates.usageCount));
}

export async function getTemplatesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates)
    .where(and(eq(templates.category, category as any), eq(templates.isActive, true)))
    .orderBy(desc(templates.usageCount));
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(templates).set({ 
    usageCount: sql`${templates.usageCount} + 1` 
  }).where(eq(templates.id, id));
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================
export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  return result[0].insertId;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.id, id));
}

export async function cancelSubscription(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set({ 
    status: "cancelled", 
    autoRenew: false,
    updatedAt: new Date() 
  }).where(eq(subscriptions.id, id));
}

// ============================================
// BUILD QUEUE OPERATIONS
// ============================================
export async function addToBuildQueue(data: InsertBuildQueue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(buildQueue).values(data);
  return result[0].insertId;
}

export async function getBuildQueueItem(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buildQueue).where(eq(buildQueue.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuildQueueByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buildQueue)
    .where(eq(buildQueue.projectId, projectId))
    .orderBy(desc(buildQueue.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getNextQueuedBuild() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buildQueue)
    .where(eq(buildQueue.status, "queued"))
    .orderBy(desc(buildQueue.priority), asc(buildQueue.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBuildQueue(id: number, data: Partial<InsertBuildQueue>) {
  const db = await getDb();
  if (!db) return;
  await db.update(buildQueue).set({ ...data, updatedAt: new Date() }).where(eq(buildQueue.id, id));
}

export async function getPendingBuildsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(buildQueue)
    .where(or(eq(buildQueue.status, "queued"), eq(buildQueue.status, "processing")));
  return result[0]?.count ?? 0;
}

export async function getAllBuildQueue(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(buildQueue).orderBy(desc(buildQueue.createdAt)).limit(limit);
}

// ============================================
// ACTIVITY LOG OPERATIONS
// ============================================
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(activityLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}

export async function getActivityLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
}

export async function getActivityLogsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

// ============================================
// PRICING PLANS OPERATIONS
// ============================================
export async function getAllPricingPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingPlans).where(eq(pricingPlans.isActive, true)).orderBy(asc(pricingPlans.priceInr));
}

export async function getPricingPlanByTier(tier: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pricingPlans).where(eq(pricingPlans.tier, tier as any)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertPricingPlan(data: InsertPricingPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pricingPlans).values(data).onDuplicateKeyUpdate({
    set: {
      nameEn: data.nameEn,
      nameHi: data.nameHi,
      descriptionEn: data.descriptionEn,
      descriptionHi: data.descriptionHi,
      priceInr: data.priceInr,
      priceUsd: data.priceUsd,
      appLimit: data.appLimit,
      features: data.features,
      isPopular: data.isPopular,
      updatedAt: new Date(),
    }
  });
}

// ============================================
// STATISTICS
// ============================================
export async function getSystemStats() {
  const db = await getDb();
  if (!db) return { users: 0, projects: 0, builds: 0, templates: 0 };
  
  const [userCount, projectCount, buildCount, templateCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(buildQueue),
    db.select({ count: sql<number>`count(*)` }).from(templates),
  ]);

  return {
    users: userCount[0]?.count ?? 0,
    projects: projectCount[0]?.count ?? 0,
    builds: buildCount[0]?.count ?? 0,
    templates: templateCount[0]?.count ?? 0,
  };
}

export async function getRecentProjects(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt)).limit(limit);
}

export async function getProjectsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.status, status as any)).orderBy(desc(projects.createdAt));
}
