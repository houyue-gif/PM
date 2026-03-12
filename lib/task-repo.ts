import { prisma } from "@/lib/prisma";

export const CURRENT_USER_ID = "u1";

export async function formatTask(t: any) {
  return {
    id: t.id,
    taskNo: t.taskNo,
    title: t.title,
    description: t.description,
    projectId: t.projectId,
    phaseId: t.phaseId || undefined,
    milestoneId: t.milestoneId || undefined,
    parentTaskId: t.parentTaskId || undefined,
    priority: t.priority,
    status: t.status,
    riskLevel: t.riskLevel,
    ownerId: t.ownerId,
    acceptorId: t.acceptorId,
    collaboratorIds: t.collaborators?.map((c: any) => c.memberId) || [],
    watcherIds: [],
    tagIds: t.tags?.map((x: any) => x.tagId) || [],
    plannedStartAt: t.plannedStartAt?.toISOString(),
    plannedEndAt: t.plannedEndAt.toISOString(),
    actualStartAt: t.actualStartAt?.toISOString(),
    actualDoneAt: t.actualDoneAt?.toISOString(),
    acceptanceDoneAt: t.acceptanceDoneAt?.toISOString(),
    progress: t.progress,
    estimateHours: t.estimateHours,
    spentHours: t.spentHours,
    remainingHours: t.remainingHours,
    createdBy: t.createdBy,
    completionNote: t.completionNote || "",
    acceptanceConclusion: t.acceptanceConclusion || "",
    archived: t.archived,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString()
  };
}

export async function recalcParent(parentTaskId: string | null) {
  if (!parentTaskId) return;
  const children = await prisma.task.findMany({ where: { parentTaskId, archived: false } });
  if (!children.length) return;
  const progress = Math.round(children.reduce((s, c) => s + c.progress, 0) / children.length);
  const startCandidates = children.map((c) => c.plannedStartAt).filter((x): x is Date => !!x);
  const earliest = startCandidates.sort((a, b) => +a - +b)[0] || null;
  const latest = children.map((c) => c.plannedEndAt).sort((a, b) => +b - +a)[0];
  await prisma.task.update({ where: { id: parentTaskId }, data: { progress, plannedStartAt: earliest, plannedEndAt: latest } });
}

export function canTransit(from: string, to: string) {
  const map: Record<string, string[]> = {
    not_started: ["in_progress"],
    in_progress: ["blocked", "pending_acceptance"],
    blocked: ["in_progress"],
    pending_acceptance: ["completed", "in_progress"],
    completed: ["closed"],
    closed: []
  };
  return from === to || (map[from] || []).includes(to);
}
