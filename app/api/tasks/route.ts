import { prisma } from "@/lib/prisma";
import { canTransit, CURRENT_USER_ID, formatTask, recalcParent } from "@/lib/task-repo";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2),
  projectId: z.string(),
  ownerId: z.string(),
  acceptorId: z.string(),
  plannedEndAt: z.string(),
  plannedStartAt: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  parentTaskId: z.string().optional(),
  description: z.string().optional(),
  createAndContinue: z.boolean().optional()
});

const patchSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
  action: z.enum(["batch_owner", "batch_acceptor", "batch_status", "batch_time", "archive"]).optional(),
  ownerId: z.string().optional(),
  acceptorId: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "blocked", "pending_acceptance", "completed", "closed"]).optional(),
  plannedStartAt: z.string().optional(),
  plannedEndAt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  actualDoneAt: z.string().optional(),
  parentTaskId: z.string().optional()
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const acceptance = searchParams.get("acceptance");
  const q = (searchParams.get("q") || "").toLowerCase();
  const projectId = searchParams.get("projectId") || undefined;
  const status = searchParams.get("status") || undefined;

  const where: any = { archived: false };
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (mine === "owner") where.ownerId = CURRENT_USER_ID;
  if (mine === "participant") where.collaborators = { some: { memberId: CURRENT_USER_ID } };
  if (mine === "pending-acceptance") { where.acceptorId = CURRENT_USER_ID; where.status = "pending_acceptance"; }
  if (acceptance === "done") { where.acceptorId = CURRENT_USER_ID; where.status = { in: ["completed", "closed"] }; }

  const rows = await prisma.task.findMany({ where, include: { collaborators: true, tags: true }, orderBy: { updatedAt: "desc" } });
  const filtered = rows.filter((t) => [t.title, t.taskNo, t.ownerId, t.acceptorId].join(" ").toLowerCase().includes(q));
  const [projects, members, phases, milestones] = await Promise.all([prisma.project.findMany(), prisma.member.findMany(), prisma.projectPhase.findMany(), prisma.milestone.findMany()]);
  return Response.json({
    items: await Promise.all(filtered.map((x) => formatTask(x))),
    options: {
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      members: members.map((m) => ({ id: m.id, name: m.name })),
      phases: phases.map((p) => ({ id: p.id, name: p.name })),
      milestones: milestones.map((m) => ({ id: m.id, name: m.name }))
    }
  });
}

export async function POST(req: Request) {
  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const project = await prisma.project.findUnique({ where: { id: d.projectId } });
    if (!project) return Response.json({ error: "项目不存在" }, { status: 400 });

    if (d.parentTaskId) {
      const parent = await prisma.task.findUnique({ where: { id: d.parentTaskId } });
      if (!parent) return Response.json({ error: "父任务不存在" }, { status: 400 });
      if (d.plannedStartAt && parent.plannedStartAt && new Date(d.plannedStartAt) < parent.plannedStartAt) return Response.json({ error: "子任务开始时间超出父任务范围" }, { status: 400 });
      if (new Date(d.plannedEndAt) > parent.plannedEndAt) return Response.json({ error: "子任务截止时间超出父任务范围" }, { status: 400 });
    }

    const count = await prisma.task.count();
    const item = await prisma.task.create({ data: {
      taskNo: `T-${1000 + count + 1}`,
      title: d.title,
      description: d.description || "",
      projectId: d.projectId,
      ownerId: d.ownerId,
      acceptorId: d.acceptorId,
      plannedStartAt: d.plannedStartAt ? new Date(d.plannedStartAt) : null,
      plannedEndAt: new Date(d.plannedEndAt),
      priority: d.priority,
      status: "not_started",
      parentTaskId: d.parentTaskId || null,
      createdBy: CURRENT_USER_ID,
      remainingHours: 8,
      estimateHours: 8
    }, include: { collaborators: true, tags: true } });

    await prisma.taskActivityLog.create({ data: { taskId: item.id, actorId: CURRENT_USER_ID, type: "create", message: `创建任务 ${item.title}` } });
    await recalcParent(item.parentTaskId || null);
    return Response.json({ item: await formatTask(item) });
  } catch (e) {
    console.error("POST /api/tasks", e);
    return Response.json({ error: "创建任务失败" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  if (d.ids?.length && d.action) {
    for (const id of d.ids) {
      if (d.action === "batch_owner" && d.ownerId) await prisma.task.update({ where: { id }, data: { ownerId: d.ownerId } });
      if (d.action === "batch_acceptor" && d.acceptorId) await prisma.task.update({ where: { id }, data: { acceptorId: d.acceptorId } });
      if (d.action === "batch_status" && d.status) await prisma.task.update({ where: { id }, data: { status: d.status } });
      if (d.action === "batch_time" && d.plannedEndAt) await prisma.task.update({ where: { id }, data: { plannedStartAt: d.plannedStartAt ? new Date(d.plannedStartAt) : undefined, plannedEndAt: new Date(d.plannedEndAt) } });
      if (d.action === "archive") await prisma.task.update({ where: { id }, data: { archived: true } });
      await prisma.taskActivityLog.create({ data: { taskId: id, actorId: CURRENT_USER_ID, type: "batch", message: `批量更新 ${d.action}` } });
    }
    return Response.json({ ok: true });
  }

  if (!d.id) return Response.json({ error: "缺少任务ID" }, { status: 400 });
  const current = await prisma.task.findUnique({ where: { id: d.id } });
  if (!current) return Response.json({ error: "任务不存在" }, { status: 404 });

  if (d.status && !canTransit(current.status, d.status)) return Response.json({ error: `状态不可从 ${current.status} 流转到 ${d.status}` }, { status: 400 });

  const next: any = { ...("title" in d ? { title: d.title } : {}), ...("description" in d ? { description: d.description } : {}), ...("priority" in d ? { priority: d.priority } : {}), ...("ownerId" in d ? { ownerId: d.ownerId } : {}), ...("acceptorId" in d ? { acceptorId: d.acceptorId } : {}), ...("progress" in d ? { progress: d.progress } : {}), ...("parentTaskId" in d ? { parentTaskId: d.parentTaskId || null } : {}) };
  if (d.plannedStartAt) next.plannedStartAt = new Date(d.plannedStartAt);
  if (d.plannedEndAt) next.plannedEndAt = new Date(d.plannedEndAt);
  if (d.status) {
    next.status = d.status;
    if (d.status === "in_progress" && !current.actualStartAt) next.actualStartAt = new Date();
  }
  if (d.actualDoneAt) next.actualDoneAt = new Date(d.actualDoneAt);

  const updated = await prisma.task.update({ where: { id: d.id }, data: next, include: { collaborators: true, tags: true } });
  if (d.ownerId && d.ownerId !== current.ownerId) await prisma.taskActivityLog.create({ data: { taskId: d.id, actorId: CURRENT_USER_ID, type: "owner_change", message: `负责人变更为 ${d.ownerId}` } });
  await prisma.taskActivityLog.create({ data: { taskId: d.id, actorId: CURRENT_USER_ID, type: "update", message: `更新任务字段` } });
  await recalcParent(updated.parentTaskId);
  return Response.json({ item: await formatTask(updated) });
}
