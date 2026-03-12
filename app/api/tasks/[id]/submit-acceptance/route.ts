import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id }, include: { dependenciesTo: { include: { fromTask: true } } } });
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });
  const blocked = task.dependenciesTo.some((d) => d.fromTask.status !== "completed" && d.fromTask.status !== "closed");
  if (blocked) return Response.json({ error: "前置任务未完成，不可提交验收" }, { status: 400 });
  await prisma.task.update({ where: { id: task.id }, data: { status: "pending_acceptance", actualDoneAt: task.actualDoneAt || new Date() } });
  await prisma.acceptance.create({ data: { taskId: task.id, acceptorId: task.acceptorId, submittedAt: new Date(), status: "pending" } });
  await prisma.taskActivityLog.create({ data: { taskId: task.id, actorId: "u1", type: "submit_acceptance", message: "提交验收" } });
  return Response.json({ ok: true });
}
