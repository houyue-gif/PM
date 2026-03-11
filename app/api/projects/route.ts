import { projects, activityLogs } from "@/lib/mock-db";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2), description: z.string().min(2) });

export async function GET() {
  return Response.json({ items: projects });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = {
    id: `pr${projects.length + 1}`,
    name: parsed.data.name,
    description: parsed.data.description,
    status: "active" as const,
    ownerId: "u1",
    memberIds: ["u1"],
    workspaceId: "ws_1",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    health: "good" as const
  };
  projects.unshift(item);
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "project", scopeId: item.id, actorId: "u1", message: `创建项目 ${item.name}`, createdAt: new Date().toISOString() });
  return Response.json({ item });
}
