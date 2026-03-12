import { prisma } from "@/lib/prisma";
import { formatTask } from "@/lib/task-repo";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id }, include: { collaborators: true, tags: true, dependenciesFrom: true, dependenciesTo: true, parentTask: true, children: true, acceptances: true } });
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });
  const [project, activities, members] = await Promise.all([
    prisma.project.findUnique({ where: { id: task.projectId } }),
    prisma.taskActivityLog.findMany({ where: { taskId: task.id }, orderBy: { createdAt: "desc" } }),
    prisma.member.findMany()
  ]);
  return Response.json({
    item: await formatTask(task),
    project: project ? { id: project.id, name: project.name } : null,
    parentPath: task.parentTask ? [{ id: task.parentTask.id, title: task.parentTask.title }] : [],
    subtasks: task.children.map((c) => ({ id: c.id, title: c.title, ownerId: c.ownerId, acceptorId: c.acceptorId, status: c.status, plannedStartAt: c.plannedStartAt?.toISOString(), plannedEndAt: c.plannedEndAt.toISOString(), actualDoneAt: c.actualDoneAt?.toISOString(), progress: c.progress })),
    dependencies: { predecessors: task.dependenciesTo, successors: task.dependenciesFrom },
    activities: activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    acceptanceRecords: task.acceptances.map((a) => ({ ...a, submittedAt: a.submittedAt.toISOString(), acceptedAt: a.acceptedAt?.toISOString(), createdAt: a.createdAt.toISOString() })),
    members: members.map((m) => ({ id: m.id, name: m.name }))
  });
}
