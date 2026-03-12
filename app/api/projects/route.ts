import { prisma } from "@/lib/prisma";
import { getProjectOptions, toProjectDto } from "@/lib/project-repo";
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
  const archived = searchParams.get("archived") === "true";
  const rows = await prisma.project.findMany({ where: { archived }, include: { members: true, tags: true }, orderBy: { updatedAt: "desc" } });
  const items = await Promise.all(rows.map((p) => toProjectDto(p)));
  const options = await getProjectOptions();
  return Response.json({ items, options });
}

export async function POST(req: Request) {
  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;

    if (new Date(d.startDate) > new Date(d.endDate)) return Response.json({ error: "开始日期不得晚于结束日期" }, { status: 400 });

    const exists = await prisma.project.findUnique({ where: { code: d.code } });
    if (exists) return Response.json({ error: "项目编码已存在" }, { status: 400 });

    const workspaceId = (await prisma.team.findUnique({ where: { id: d.teamId } }))?.workspaceId;
    if (!workspaceId) return Response.json({ error: "团队不存在" }, { status: 400 });

    const created = await prisma.project.create({
      data: {
        code: d.code,
        name: d.name,
        description: d.description,
        status: "draft",
        phase: "initiation",
        type: d.type,
        businessLine: d.businessLine,
        ownerId: d.ownerId,
        teamId: d.teamId,
        workspaceId,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        riskLevel: d.enableRiskTracking ? "medium" : "low",
        visibility: d.visibility,
        templateId: d.templateId || null,
        members: { create: [{ memberId: d.ownerId, role: "admin" }] },
        tags: { create: d.tagIds.map((tagId) => ({ tagId })) }
      },
      include: { members: true, tags: true }
    });

    await prisma.projectPhase.create({ data: { projectId: created.id, name: "立项", type: "initiation", ownerId: d.ownerId, startDate: new Date(d.startDate), endDate: new Date(d.endDate), status: "active", keyNode: true, note: `来源：${d.lifecycleTemplate}` } });
    if (d.enableMilestones) await prisma.milestone.create({ data: { projectId: created.id, name: "项目启动会", kind: "business", targetDate: new Date(d.startDate), status: "pending", ownerId: d.ownerId, criteria: "完成核心目标对齐", relatedTaskCount: 0, keyNode: true } });
    await prisma.activityLog.create({ data: { scope: "project", scopeId: created.id, actorId: d.ownerId, eventType: "project_update", message: `创建项目 ${d.name}（${d.mode}）` } });

    return Response.json({ item: await toProjectDto(created) });
  } catch (e) {
    console.error("POST /api/projects failed", e);
    return Response.json({ error: "创建项目失败" }, { status: 500 });
  }
}

const patchSchema = z.object({ ids: z.array(z.string()).optional(), action: z.enum(["archive", "restore", "change_owner", "change_tags"]), ownerId: z.string().optional(), tagIds: z.array(z.string()).optional() });

export async function PATCH(req: Request) {
  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    const { ids = [], action, ownerId, tagIds = [] } = parsed.data;
    if (!ids.length) return Response.json({ error: "请选择项目" }, { status: 400 });

    for (const id of ids) {
      if (action === "archive") await prisma.project.update({ where: { id }, data: { archived: true, status: "archived" } });
      if (action === "restore") await prisma.project.update({ where: { id }, data: { archived: false, status: "active" } });
      if (action === "change_owner" && ownerId) await prisma.project.update({ where: { id }, data: { ownerId } });
      if (action === "change_tags") {
        await prisma.projectTag.deleteMany({ where: { projectId: id } });
        if (tagIds.length) await prisma.projectTag.createMany({ data: tagIds.map((tagId) => ({ projectId: id, tagId })) });
      }
      await prisma.activityLog.create({ data: { scope: "project", scopeId: id, actorId: "u1", eventType: "project_update", message: `批量操作 ${action}` } });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/projects failed", e);
    return Response.json({ error: "批量操作失败" }, { status: 500 });
  }
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
