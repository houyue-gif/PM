import { activityLogs, currentUserId, projectPhases } from "@/lib/mock-db";
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const now = new Date().toISOString();
  const d = parsed.data;
  if (d.id) {
    const exist = projectPhases.find((p) => p.id === d.id && p.projectId === params.id);
    if (!exist) return Response.json({ error: "阶段不存在" }, { status: 404 });
    Object.assign(exist, { ...d, startDate: new Date(d.startDate).toISOString(), endDate: new Date(d.endDate).toISOString() });
    activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: params.id, actorId: currentUserId, eventType: "phase_change", message: `更新阶段 ${exist.name}`, createdAt: now });
    return Response.json({ item: exist });
  }
  const item = { id: `ph${projectPhases.length + 1}`, projectId: params.id, ...d, startDate: new Date(d.startDate).toISOString(), endDate: new Date(d.endDate).toISOString() };
  projectPhases.push(item);
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: params.id, actorId: currentUserId, eventType: "phase_change", message: `新增阶段 ${item.name}`, createdAt: now });
  return Response.json({ item });
}
