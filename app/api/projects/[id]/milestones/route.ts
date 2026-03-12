import { activityLogs, currentUserId, milestones } from "@/lib/mock-db";
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const now = new Date().toISOString();

  if (d.id) {
    const exist = milestones.find((m) => m.id === d.id && m.projectId === params.id);
    if (!exist) return Response.json({ error: "里程碑不存在" }, { status: 404 });
    Object.assign(exist, { ...d, targetDate: new Date(d.targetDate).toISOString(), actualDate: d.actualDate ? new Date(d.actualDate).toISOString() : undefined });
    activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: params.id, actorId: currentUserId, eventType: "milestone_change", message: `更新里程碑 ${exist.name}`, createdAt: now });
    return Response.json({ item: exist });
  }

  const item = {
    id: `ms${milestones.length + 1}`,
    projectId: params.id,
    ...d,
    targetDate: new Date(d.targetDate).toISOString(),
    actualDate: d.actualDate ? new Date(d.actualDate).toISOString() : undefined
  };
  milestones.push(item);
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: params.id, actorId: currentUserId, eventType: "milestone_change", message: `新增里程碑 ${item.name}`, createdAt: now });
  return Response.json({ item });
}
