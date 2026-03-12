import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  kind: z.enum(["release", "quality_gate", "go_live", "business"]),
  targetDate: z.string(),
  actualDate: z.string().optional(),
  status: z.enum(["pending", "on_track", "at_risk", "done", "delayed"]),
  ownerId: z.string().min(1),
  criteria: z.string().min(1),
  relatedTaskCount: z.number().int().min(0),
  note: z.string().optional(),
  keyNode: z.boolean().default(false)
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.milestone.findMany({ where: { projectId: params.id }, orderBy: { targetDate: "asc" } });
  return Response.json({ items: items.map((x) => ({ ...x, targetDate: x.targetDate.toISOString(), actualDate: x.actualDate?.toISOString() })) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  if (d.id) {
    const item = await prisma.milestone.update({ where: { id: d.id }, data: { ...d, targetDate: new Date(d.targetDate), actualDate: d.actualDate ? new Date(d.actualDate) : null } });
    await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "milestone_change", message: `更新里程碑 ${item.name}` } });
    return Response.json({ item: { ...item, targetDate: item.targetDate.toISOString(), actualDate: item.actualDate?.toISOString() } });
  }

  const item = await prisma.milestone.create({ data: { projectId: params.id, ...d, targetDate: new Date(d.targetDate), actualDate: d.actualDate ? new Date(d.actualDate) : null } });
  await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "milestone_change", message: `新增里程碑 ${item.name}` } });
  return Response.json({ item: { ...item, targetDate: item.targetDate.toISOString(), actualDate: item.actualDate?.toISOString() } });
}
