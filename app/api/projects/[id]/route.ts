import { prisma } from "@/lib/prisma";
import { toProjectDto } from "@/lib/project-repo";
import { z } from "zod";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { members: true, tags: true } });
  if (!project) return Response.json({ error: "项目不存在" }, { status: 404 });
  const [phases, milestones, activities, members, teams, templates] = await Promise.all([
    prisma.projectPhase.findMany({ where: { projectId: project.id }, orderBy: { startDate: "asc" } }),
    prisma.milestone.findMany({ where: { projectId: project.id }, orderBy: { targetDate: "asc" } }),
    prisma.activityLog.findMany({ where: { scope: "project", scopeId: project.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.member.findMany(),
    prisma.team.findMany(),
    prisma.projectTemplate.findMany({ where: { enabled: true } })
  ]);
  return Response.json({
    item: await toProjectDto(project),
    phases: phases.map((p) => ({ ...p, startDate: p.startDate.toISOString(), endDate: p.endDate.toISOString() })),
    milestones: milestones.map((m) => ({ ...m, targetDate: m.targetDate.toISOString(), actualDate: m.actualDate?.toISOString() })),
    activities: activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    members: members.map((m) => ({ id: m.id, name: m.name, email: m.email, roleId: m.role, teamIds: [] })),
    teams: teams.map((t) => ({ id: t.id, name: t.name, workspaceId: t.workspaceId, memberIds: [] })),
    templates: templates.map((t) => ({ id: t.id, name: t.name }))
  });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  ownerId: z.string().optional(),
  phase: z.enum(["initiation", "planning", "execution", "acceptance", "retrospective"]).optional(),
  status: z.enum(["draft", "active", "on_hold", "completed", "closed", "archived"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  visibility: z.enum(["workspace", "team", "private"]).optional(),
  templateId: z.string().optional(),
  archived: z.boolean().optional(),
  notification: z.object({ milestoneReminder: z.boolean(), delayAlert: z.boolean(), ownerChange: z.boolean() }).optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;

    if (data.code) {
      const exists = await prisma.project.findFirst({ where: { code: data.code, NOT: { id: params.id } } });
      if (exists) return Response.json({ error: "项目编码已存在" }, { status: 400 });
    }

    const current = await prisma.project.findUnique({ where: { id: params.id } });
    if (!current) return Response.json({ error: "项目不存在" }, { status: 404 });

    const startDate = data.startDate ? new Date(data.startDate) : current.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : current.endDate;
    if (startDate > endDate) return Response.json({ error: "开始日期不得晚于结束日期" }, { status: 400 });

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...("name" in data ? { name: data.name } : {}),
        ...("code" in data ? { code: data.code } : {}),
        ...("description" in data ? { description: data.description } : {}),
        ...("ownerId" in data ? { ownerId: data.ownerId } : {}),
        ...("phase" in data ? { phase: data.phase } : {}),
        ...("status" in data ? { status: data.status } : {}),
        ...("visibility" in data ? { visibility: data.visibility } : {}),
        ...("templateId" in data ? { templateId: data.templateId || null } : {}),
        ...("archived" in data ? { archived: data.archived, status: data.archived ? "archived" : "active" } : {}),
        startDate,
        endDate
      },
      include: { members: true, tags: true }
    });

    await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "project_update", message: "更新项目配置" } });
    return Response.json({ item: await toProjectDto(updated) });
  } catch (e) {
    console.error("PATCH /api/projects/[id] failed", e);
    return Response.json({ error: "更新失败" }, { status: 500 });
  }
}
