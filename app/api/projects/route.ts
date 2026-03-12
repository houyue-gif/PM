import { activityLogs, currentUserId, members, milestones, projectPhases, projects, tags, teams } from "@/lib/mock-db";
import { z } from "zod";

const createSchema = z.object({
  mode: z.enum(["blank", "template", "copy"]).default("blank"),
  sourceProjectId: z.string().optional(),
  templateId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.enum(["product", "delivery", "ops", "research"]).default("product"),
  businessLine: z.string().default("General"),
  ownerId: z.string().min(1),
  teamId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().default(""),
  visibility: z.enum(["workspace", "team", "private"]).default("workspace"),
  tagIds: z.array(z.string()).default([]),
  lifecycleTemplate: z.string().default("标准生命周期"),
  enableMilestones: z.boolean().default(true),
  enableRiskTracking: z.boolean().default(true)
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived");
  const items = projects.filter((p) => (archived === null ? !p.archived : archived === "true" ? p.archived : !p.archived));
  return Response.json({ items, options: { members, teams, tags } });
}

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  if (projects.some((p) => p.code.toLowerCase() === parsed.data.code.toLowerCase())) {
    return Response.json({ error: "项目编码已存在" }, { status: 400 });
  }
  if (new Date(parsed.data.startDate) > new Date(parsed.data.endDate)) {
    return Response.json({ error: "开始日期不得晚于结束日期" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const item = {
    id: `pr${projects.length + 1}`,
    code: parsed.data.code,
    name: parsed.data.name,
    description: parsed.data.description,
    status: "draft" as const,
    phase: "initiation" as const,
    type: parsed.data.type,
    businessLine: parsed.data.businessLine,
    ownerId: parsed.data.ownerId,
    adminIds: [parsed.data.ownerId],
    memberIds: [parsed.data.ownerId],
    teamId: parsed.data.teamId,
    workspaceId: "ws_1",
    startDate: new Date(parsed.data.startDate).toISOString(),
    endDate: new Date(parsed.data.endDate).toISOString(),
    progress: 0,
    scheduleDelta: 0,
    health: "good" as const,
    riskLevel: parsed.data.enableRiskTracking ? "medium" as const : "low" as const,
    visibility: parsed.data.visibility,
    tagIds: parsed.data.tagIds,
    archived: false,
    templateId: parsed.data.templateId,
    updatedAt: now,
    createdAt: now
  };

  projects.unshift(item);

  projectPhases.push({
    id: `ph${projectPhases.length + 1}`,
    projectId: item.id,
    name: "立项",
    type: "initiation",
    ownerId: parsed.data.ownerId,
    startDate: item.startDate,
    endDate: item.endDate,
    status: "active",
    keyNode: true,
    note: `来源：${parsed.data.lifecycleTemplate}`
  });

  if (parsed.data.enableMilestones) {
    milestones.push({
      id: `ms${milestones.length + 1}`,
      projectId: item.id,
      name: "项目启动会",
      kind: "business",
      targetDate: item.startDate,
      status: "pending",
      ownerId: parsed.data.ownerId,
      criteria: "完成核心目标对齐",
      relatedTaskCount: 0,
      keyNode: true
    });
  }

  activityLogs.unshift({
    id: `a${activityLogs.length + 1}`,
    scope: "project",
    scopeId: item.id,
    actorId: currentUserId,
    eventType: "project_update",
    message: `创建项目 ${item.name}（${parsed.data.mode}）`,
    createdAt: now
  });

  return Response.json({ item });
}

const patchSchema = z.object({
  ids: z.array(z.string()).optional(),
  action: z.enum(["archive", "restore", "change_owner", "change_tags"]).optional(),
  ownerId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
});

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const ids = parsed.data.ids ?? [];
  const targets = projects.filter((p) => ids.includes(p.id));
  if (!targets.length) return Response.json({ error: "未找到项目" }, { status: 404 });

  const now = new Date().toISOString();
  for (const p of targets) {
    if (parsed.data.action === "archive") {
      p.archived = true;
      p.status = "archived";
      p.updatedAt = now;
      activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: p.id, actorId: currentUserId, eventType: "project_update", message: `归档项目 ${p.name}`, createdAt: now });
    }
    if (parsed.data.action === "restore") {
      p.archived = false;
      p.status = "active";
      p.updatedAt = now;
      activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: p.id, actorId: currentUserId, eventType: "project_update", message: `恢复项目 ${p.name}`, createdAt: now });
    }
    if (parsed.data.action === "change_owner" && parsed.data.ownerId) {
      const oldOwner = p.ownerId;
      p.ownerId = parsed.data.ownerId;
      p.updatedAt = now;
      activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: p.id, actorId: currentUserId, eventType: "owner_change", message: `负责人由 ${oldOwner} 变更为 ${parsed.data.ownerId}`, createdAt: now });
    }
    if (parsed.data.action === "change_tags" && parsed.data.tagIds) {
      p.tagIds = parsed.data.tagIds;
      p.updatedAt = now;
      activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: p.id, actorId: currentUserId, eventType: "project_update", message: "更新项目标签", createdAt: now });
    }
  }

  return Response.json({ items: targets });
}
