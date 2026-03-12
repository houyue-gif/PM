import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { formatTask, recalcParent } from "@/lib/task-repo";

const schema = z.object({ title: z.string().min(2), ownerId: z.string(), acceptorId: z.string(), plannedEndAt: z.string() });
const patchSchema = z.object({ ids: z.array(z.string()), ownerId: z.string().optional(), acceptorId: z.string().optional(), plannedEndAt: z.string().optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parent = await prisma.task.findUnique({ where: { id: params.id } });
  if (!parent) return Response.json({ error: "父任务不存在" }, { status: 404 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  if (new Date(d.plannedEndAt) > parent.plannedEndAt) return Response.json({ error: "子任务截止时间超出父任务范围" }, { status: 400 });
  const count = await prisma.task.count();
  const item = await prisma.task.create({ data: { taskNo: `T-${1000 + count + 1}`, title: d.title, projectId: parent.projectId, parentTaskId: parent.id, ownerId: d.ownerId, acceptorId: d.acceptorId, plannedStartAt: parent.plannedStartAt, plannedEndAt: new Date(d.plannedEndAt), priority: parent.priority, status: "not_started", createdBy: "u1" }, include: { collaborators: true, tags: true } });
  await recalcParent(parent.id);
  return Response.json({ item: await formatTask(item) });
}

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const { ids, ownerId, acceptorId, plannedEndAt } = parsed.data;
  for (const id of ids) {
    await prisma.task.update({ where: { id }, data: { ...(ownerId ? { ownerId } : {}), ...(acceptorId ? { acceptorId } : {}), ...(plannedEndAt ? { plannedEndAt: new Date(plannedEndAt) } : {}) } });
  }
  return Response.json({ ok: true });
}
