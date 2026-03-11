import { tasks, activityLogs, notifications } from "@/lib/mock-db";
import { z } from "zod";

const schema = z.object({ title: z.string().min(2), projectId: z.string(), assigneeId: z.string(), priority: z.enum(["low", "medium", "high", "urgent"]) });

export async function GET() {
  return Response.json({ items: tasks });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const now = new Date().toISOString();
  const item = { id: `tk${tasks.length + 1}`, description: "", status: "todo" as const, tagIds: [], creatorId: "u1", dueDate: now, subTaskIds: [], watcherIds: ["u1"], createdAt: now, updatedAt: now, ...parsed.data };
  tasks.unshift(item);
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "task", scopeId: item.id, actorId: "u1", message: `创建任务 ${item.title}`, createdAt: now });
  notifications.unshift({ id: `n${notifications.length + 1}`, memberId: parsed.data.assigneeId, type: "assignment", title: `你被指派到任务：${item.title}`, targetType: "task", targetId: item.id, read: false, createdAt: now });
  return Response.json({ item });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const task = tasks.find((t) => t.id === body.id);
  if (!task) return Response.json({ error: "not found" }, { status: 404 });
  if (body.status) {
    task.status = body.status;
    activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "task", scopeId: task.id, actorId: "u1", message: `将任务状态更新为 ${body.status}`, createdAt: new Date().toISOString() });
    notifications.unshift({ id: `n${notifications.length + 1}`, memberId: task.assigneeId, type: "status_change", title: `任务 ${task.title} 状态更新为 ${body.status}`, targetType: "task", targetId: task.id, read: false, createdAt: new Date().toISOString() });
  }
  return Response.json({ item: task });
}
