import { activityLogs, currentUserId, members, milestones, projectPhases, projectTemplates, projects, teams } from "@/lib/mock-db";
import { z } from "zod";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  if (!project) return Response.json({ error: "项目不存在" }, { status: 404 });
  const phases = projectPhases.filter((p) => p.projectId === project.id);
  const ms = milestones.filter((m) => m.projectId === project.id);
  const activities = activityLogs.filter((a) => a.scope === "project" && a.scopeId === project.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return Response.json({ item: project, phases, milestones: ms, activities, members, teams, templates: projectTemplates });
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
  const project = projects.find((p) => p.id === params.id);
  if (!project) return Response.json({ error: "项目不存在" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const nextCode = data.code?.toLowerCase();
  if (nextCode && projects.some((p) => p.id !== project.id && p.code.toLowerCase() === nextCode)) {
    return Response.json({ error: "项目编码已存在" }, { status: 400 });
  }

  const beforeOwner = project.ownerId;
  const beforePhase = project.phase;
  const beforeTemplate = project.templateId;
  const beforeVisibility = project.visibility;
  const beforeStart = project.startDate;
  const beforeEnd = project.endDate;

  Object.assign(project, data);

  if (data.startDate) project.startDate = new Date(data.startDate).toISOString();
  if (data.endDate) project.endDate = new Date(data.endDate).toISOString();
  if (new Date(project.startDate) > new Date(project.endDate)) {
    return Response.json({ error: "开始日期不得晚于结束日期" }, { status: 400 });
  }

  project.updatedAt = new Date().toISOString();
  if (data.archived === true) {
    project.archived = true;
    project.status = "archived";
  }
  if (data.archived === false) {
    project.archived = false;
    if (project.status === "archived") project.status = "active";
  }

  const now = new Date().toISOString();
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "project_update", message: `更新项目配置`, createdAt: now });
  if (beforeOwner !== project.ownerId) activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "owner_change", message: `负责人由 ${beforeOwner} 变更为 ${project.ownerId}`, createdAt: now });
  if (beforePhase !== project.phase) activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "phase_change", message: `阶段由 ${beforePhase} 变更为 ${project.phase}`, createdAt: now });
  if (beforeTemplate !== project.templateId) activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "project_update", message: `模板由 ${beforeTemplate || "无"} 变更为 ${project.templateId || "无"}`, createdAt: now });
  if (beforeVisibility !== project.visibility) activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "project_update", message: `可见范围由 ${beforeVisibility} 变更为 ${project.visibility}`, createdAt: now });
  if (beforeStart !== project.startDate || beforeEnd !== project.endDate) activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: project.id, actorId: currentUserId, eventType: "project_update", message: `项目时间范围已变更`, createdAt: now });

  return Response.json({ item: project });
}
