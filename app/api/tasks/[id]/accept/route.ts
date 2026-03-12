import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ comment: z.string().optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });
  await prisma.task.update({ where: { id: task.id }, data: { status: "completed", acceptanceDoneAt: new Date(), acceptanceConclusion: parsed.data.comment || "验收通过" } });
  await prisma.acceptance.updateMany({ where: { taskId: task.id, status: "pending" }, data: { status: "accepted", acceptedAt: new Date(), comment: parsed.data.comment } });
  await prisma.taskActivityLog.create({ data: { taskId: task.id, actorId: "u1", type: "accept", message: "验收通过" } });
  return Response.json({ ok: true });
}
