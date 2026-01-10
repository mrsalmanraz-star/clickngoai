import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getProjectsByUserId: vi.fn(),
  getProjectById: vi.fn(),
  getProjectBySlug: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  getProjectCountByUserId: vi.fn(),
  incrementProjectViews: vi.fn(),
  incrementProjectDownloads: vi.fn(),
  addToBuildQueue: vi.fn(),
  incrementUserAppCount: vi.fn(),
  logActivity: vi.fn(),
  getTemplateById: vi.fn(),
  incrementTemplateUsage: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    subscriptionTier: "single",
    appLimit: 5,
    appsCreated: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("projects.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user's projects", async () => {
    const mockProjects = [
      { id: 1, name: "Test App 1", userId: 1, status: "completed" },
      { id: 2, name: "Test App 2", userId: 1, status: "pending" },
    ];
    vi.mocked(db.getProjectsByUserId).mockResolvedValue(mockProjects as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.list();

    expect(result).toEqual(mockProjects);
    expect(db.getProjectsByUserId).toHaveBeenCalledWith(1);
  });
});

describe("projects.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns project for owner", async () => {
    const mockProject = { id: 1, name: "Test App", userId: 1, status: "completed" };
    vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.getById({ id: 1 });

    expect(result).toEqual(mockProject);
  });

  it("throws NOT_FOUND for non-existent project", async () => {
    vi.mocked(db.getProjectById).mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.projects.getById({ id: 999 })).rejects.toThrow("Project not found");
  });

  it("throws FORBIDDEN for non-owner user", async () => {
    const mockProject = { id: 1, name: "Test App", userId: 2, status: "completed" };
    vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

    const ctx = createAuthContext({ id: 1 });
    const caller = appRouter.createCaller(ctx);

    await expect(caller.projects.getById({ id: 1 })).rejects.toThrow("Access denied");
  });

  it("allows admin to view any project", async () => {
    const mockProject = { id: 1, name: "Test App", userId: 2, status: "completed" };
    vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

    const ctx = createAuthContext({ id: 1, role: "admin" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.getById({ id: 1 });

    expect(result).toEqual(mockProject);
  });
});

describe("projects.getBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns project by slug and increments views", async () => {
    const mockProject = { 
      id: 1, 
      name: "Test App", 
      slug: "test-app-abc123", 
      landingPageEnabled: true,
      status: "completed" 
    };
    vi.mocked(db.getProjectBySlug).mockResolvedValue(mockProject as any);
    vi.mocked(db.incrementProjectViews).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.getBySlug({ slug: "test-app-abc123" });

    expect(result).toEqual(mockProject);
    expect(db.incrementProjectViews).toHaveBeenCalledWith(1);
  });

  it("throws NOT_FOUND for disabled landing page", async () => {
    const mockProject = { 
      id: 1, 
      name: "Test App", 
      slug: "test-app-abc123", 
      landingPageEnabled: false 
    };
    vi.mocked(db.getProjectBySlug).mockResolvedValue(mockProject as any);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.projects.getBySlug({ slug: "test-app-abc123" })).rejects.toThrow("Project not found");
  });
});

describe("projects.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new project successfully", async () => {
    vi.mocked(db.getProjectCountByUserId).mockResolvedValue(0);
    vi.mocked(db.createProject).mockResolvedValue(1);
    vi.mocked(db.addToBuildQueue).mockResolvedValue(1);
    vi.mocked(db.incrementUserAppCount).mockResolvedValue(undefined);
    vi.mocked(db.logActivity).mockResolvedValue(1);

    const ctx = createAuthContext({ appLimit: 5, appsCreated: 0 });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "My New App",
      description: "A test app",
      appType: "hybrid",
    });

    expect(result.id).toBe(1);
    expect(result.slug).toContain("my-new-app");
    expect(db.createProject).toHaveBeenCalled();
    expect(db.addToBuildQueue).toHaveBeenCalled();
  });

  it("throws FORBIDDEN when app limit reached", async () => {
    vi.mocked(db.getProjectCountByUserId).mockResolvedValue(5);

    const ctx = createAuthContext({ appLimit: 5, subscriptionTier: "single" });
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.projects.create({
        name: "My New App",
        appType: "hybrid",
      })
    ).rejects.toThrow("App limit reached");
  });

  it("allows unlimited tier to create beyond limit", async () => {
    vi.mocked(db.getProjectCountByUserId).mockResolvedValue(100);
    vi.mocked(db.createProject).mockResolvedValue(101);
    vi.mocked(db.addToBuildQueue).mockResolvedValue(1);
    vi.mocked(db.incrementUserAppCount).mockResolvedValue(undefined);
    vi.mocked(db.logActivity).mockResolvedValue(1);

    const ctx = createAuthContext({ appLimit: 9999, subscriptionTier: "unlimited" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "Another App",
      appType: "android",
    });

    expect(result.id).toBe(101);
  });
});

describe("projects.trackDownload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments download count", async () => {
    vi.mocked(db.incrementProjectDownloads).mockResolvedValue(undefined);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.trackDownload({ id: 1 });

    expect(result).toEqual({ success: true });
    expect(db.incrementProjectDownloads).toHaveBeenCalledWith(1);
  });
});

describe("projects.delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes project for owner", async () => {
    const mockProject = { id: 1, name: "Test App", userId: 1 };
    vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);
    vi.mocked(db.deleteProject).mockResolvedValue(undefined);
    vi.mocked(db.logActivity).mockResolvedValue(1);

    const ctx = createAuthContext({ id: 1 });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.delete({ id: 1 });

    expect(result).toEqual({ success: true });
    expect(db.deleteProject).toHaveBeenCalledWith(1);
  });

  it("throws FORBIDDEN for non-owner", async () => {
    const mockProject = { id: 1, name: "Test App", userId: 2 };
    vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

    const ctx = createAuthContext({ id: 1 });
    const caller = appRouter.createCaller(ctx);

    await expect(caller.projects.delete({ id: 1 })).rejects.toThrow("Access denied");
  });
});
