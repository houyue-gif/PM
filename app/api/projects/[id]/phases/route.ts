import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["initiation", "planning", "execution", "acceptance", "retrospective"]),
  ownerId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["pending", "active", "done", "delayed"]),
  keyNode: z.boolean().default(false),
  note: z.string().optional()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.projectPhase.findMany({ where: { projectId: params.id }, orderBy: { startDate: "asc" } });
  return Response.json({ items: items.map((x) => ({ ...x, startDate: x.startDate.toISOString(), endDate: x.endDate.toISOString() })) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  if (d.id) {
    const item = await prisma.projectPhase.update({ where: { id: d.id }, data: { ...d, startDate: new Date(d.startDate), endDate: new Date(d.endDate) } });
    await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "phase_change", message: `更新阶段 ${item.name}` } });
    return Response.json({ item: { ...item, startDate: item.startDate.toISOString(), endDate: item.endDate.toISOString() } });
  }

  const item = await prisma.projectPhase.create({ data: { projectId: params.id, ...d, startDate: new Date(d.startDate), endDate: new Date(d.endDate) } });
  await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "phase_change", message: `新增阶段 ${item.name}` } });
  return Response.json({ item: { ...item, startDate: item.startDate.toISOString(), endDate: item.endDate.toISOString() } });
}
