import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ rejectReason: z.string().min(1) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });
  await prisma.task.update({ where: { id: task.id }, data: { status: "in_progress", acceptanceConclusion: parsed.data.rejectReason } });
  await prisma.acceptance.updateMany({ where: { taskId: task.id, status: "pending" }, data: { status: "rejected", rejectReason: parsed.data.rejectReason } });
  await prisma.taskActivityLog.create({ data: { taskId: task.id, actorId: "u1", type: "reject", message: `验收驳回：${parsed.data.rejectReason}` } });
  return Response.json({ ok: true });
}
