import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const onlyOverdue = searchParams.get("overdue") === "true";
  const where: any = { archived: false };
  if (projectId) where.projectId = projectId;
  const rows = await prisma.task.findMany({ where, orderBy: { plannedStartAt: "asc" } });
  const items = rows.filter((t) => !onlyOverdue || (t.plannedEndAt < new Date() && !["completed", "closed"].includes(t.status))).map((t) => ({ id: t.id, taskNo: t.taskNo, title: t.title, parentTaskId: t.parentTaskId, ownerId: t.ownerId, acceptorId: t.acceptorId, status: t.status, plannedStartAt: t.plannedStartAt?.toISOString(), plannedEndAt: t.plannedEndAt.toISOString(), actualDoneAt: t.actualDoneAt?.toISOString(), progress: t.progress, overdue: t.plannedEndAt < new Date() && !["completed", "closed"].includes(t.status) }));
  return Response.json({ items, today: new Date().toISOString().slice(0, 10) });
}
