import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, bigint } from "drizzle-orm/mysql-core";

// ============================================
// USERS TABLE - Core user accounts
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "single", "multiple", "unlimited"]).default("free").notNull(),
  appLimit: int("appLimit").default(1).notNull(),
  appsCreated: int("appsCreated").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// PROJECTS TABLE - Generated applications
// ============================================
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  prompt: text("prompt"),
  appType: mysqlEnum("appType", ["android", "ios", "pwa", "hybrid", "web", "desktop"]).default("hybrid").notNull(),
  status: mysqlEnum("status", ["pending", "building", "completed", "failed"]).default("pending").notNull(),
  buildProgress: int("buildProgress").default(0).notNull(),
  templateId: int("templateId"),
  
  // App configuration
  appIcon: text("appIcon"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#6366f1"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#8b5cf6"),
  features: json("features").$type<string[]>(),
  screenshots: json("screenshots").$type<string[]>(),
  
  // Build outputs
  apkUrl: text("apkUrl"),
  ipaUrl: text("ipaUrl"),
  pwaUrl: text("pwaUrl"),
  webUrl: text("webUrl"),
  sourceCodeUrl: text("sourceCodeUrl"),
  
  // Landing page
  landingPageEnabled: boolean("landingPageEnabled").default(true).notNull(),
  landingPageViews: int("landingPageViews").default(0).notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  
  // Metadata
  version: varchar("version", { length: 20 }).default("1.0.0"),
  packageName: varchar("packageName", { length: 255 }),
  buildNumber: int("buildNumber").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================
// TEMPLATES TABLE - Pre-built app templates
// ============================================
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: mysqlEnum("category", [
    "food_delivery", "ecommerce", "social_media", "booking", 
    "fitness", "task_manager", "chat", "lms", "crm", "news", "other"
  ]).default("other").notNull(),
  icon: text("icon"),
  previewImage: text("previewImage"),
  features: json("features").$type<string[]>(),
  defaultPrompt: text("defaultPrompt"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#6366f1"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#8b5cf6"),
  usageCount: int("usageCount").default(0).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// ============================================
// SUBSCRIPTIONS TABLE - Billing records
// ============================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("tier", ["free", "single", "multiple", "unlimited"]).default("free").notNull(),
  priceInr: int("priceInr").default(0).notNull(),
  priceUsd: int("priceUsd").default(0).notNull(),
  currency: mysqlEnum("currency", ["INR", "USD"]).default("INR").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentId: varchar("paymentId", { length: 255 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================
// BUILD QUEUE TABLE - Async build management
// ============================================
export const buildQueue = mysqlTable("build_queue", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  priority: int("priority").default(0).notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  currentStep: varchar("currentStep", { length: 255 }),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  estimatedTime: int("estimatedTime"), // in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuildQueue = typeof buildQueue.$inferSelect;
export type InsertBuildQueue = typeof buildQueue.$inferInsert;

// ============================================
// ACTIVITY LOGS TABLE - Audit trail
// ============================================
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================
// API KEYS TABLE - Developer API access
// ============================================
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 10 }).notNull(),
  permissions: json("permissions").$type<string[]>(),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ============================================
// PRICING PLANS - Static pricing configuration
// ============================================
export const pricingPlans = mysqlTable("pricing_plans", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["free", "single", "multiple", "unlimited"]).notNull().unique(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  nameHi: varchar("nameHi", { length: 100 }),
  descriptionEn: text("descriptionEn"),
  descriptionHi: text("descriptionHi"),
  priceInr: int("priceInr").default(0).notNull(),
  priceUsd: int("priceUsd").default(0).notNull(),
  appLimit: int("appLimit").default(1).notNull(),
  features: json("features").$type<string[]>(),
  isPopular: boolean("isPopular").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;
