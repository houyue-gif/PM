import { tasks, activityLogs, notifications } from "@/lib/mock-db";
import { z } from "zod";

const createSchema = z.object({ title: z.string().min(2), projectId: z.string(), assigneeId: z.string(), priority: z.enum(["low", "medium", "high", "urgent"]) });
const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  title: z.string().min(2).optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  subTaskTitle: z.string().optional()
});

export async function GET() {
  return Response.json({ items: tasks });
}

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const now = new Date().toISOString();
  const item = { id: `tk${tasks.length + 1}`, description: "", status: "todo" as const, tagIds: [], creatorId: "u1", dueDate: now, subTaskIds: [], watcherIds: ["u1"], createdAt: now, updatedAt: now, ...parsed.data };
  tasks.unshift(item);
  activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "task", scopeId: item.id, actorId: "u1", message: `创建任务 ${item.title}`, createdAt: now });
  notifications.unshift({ id: `n${notifications.length + 1}`, memberId: parsed.data.assigneeId, type: "assignment", title: `你被指派到任务：${item.title}`, targetType: "task", targetId: item.id, read: false, createdAt: now });
  return Response.json({ item });
}

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const task = tasks.find((t) => t.id === body.id);
  if (!task) return Response.json({ error: "not found" }, { status: 404 });

  if (body.status && body.status !== task.status) {
    task.status = body.status;
    activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "task", scopeId: task.id, actorId: "u1", message: `将任务状态更新为 ${body.status}`, createdAt: new Date().toISOString() });
    notifications.unshift({ id: `n${notifications.length + 1}`, memberId: task.assigneeId, type: "status_change", title: `任务 ${task.title} 状态更新为 ${body.status}`, targetType: "task", targetId: task.id, read: false, createdAt: new Date().toISOString() });
  }
  if (body.title) task.title = body.title;
  if (body.assigneeId) task.assigneeId = body.assigneeId;
  if (body.priority) task.priority = body.priority;
  if (body.dueDate) task.dueDate = body.dueDate;
  if (body.description !== undefined) task.description = body.description;

  if (body.subTaskTitle) {
    const subId = `tk${tasks.length + 1}`;
    tasks.unshift({ ...task, id: subId, title: body.subTaskTitle, status: "todo", subTaskIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    task.subTaskIds.push(subId);
    activityLogs.unshift({ id: `a${activityLogs.length + 1}`, scope: "task", scopeId: task.id, actorId: "u1", message: `新增子任务 ${body.subTaskTitle}`, createdAt: new Date().toISOString() });
  }

  task.updatedAt = new Date().toISOString();
  return Response.json({ item: task });
}
