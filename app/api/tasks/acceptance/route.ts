import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const done = searchParams.get("done") === "true";
  const where: any = { acceptorId: "u1", archived: false };
  where.status = done ? { in: ["completed", "closed"] } : "pending_acceptance";
  const items = await prisma.task.findMany({ where, orderBy: { updatedAt: "desc" } });
  return Response.json({ items: items.map((t) => ({ id: t.id, taskNo: t.taskNo, title: t.title, projectId: t.projectId, priority: t.priority, status: t.status, plannedEndAt: t.plannedEndAt.toISOString(), actualDoneAt: t.actualDoneAt?.toISOString(), overdue: t.plannedEndAt < new Date() && t.status !== "completed" && t.status !== "closed" })) });
}
