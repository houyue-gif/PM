import { comments, notifications } from "@/lib/mock-db";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1) });

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return Response.json({ items: comments.filter((c) => c.taskId === params.id) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = { id: `c${comments.length + 1}`, taskId: params.id, memberId: "u1", content: parsed.data.content, createdAt: new Date().toISOString() };
  comments.unshift(item);
  if (parsed.data.content.includes("@")) {
    notifications.unshift({ id: `n${notifications.length + 1}`, memberId: "u2", type: "mention", title: "你在评论中被提及", targetType: "task", targetId: params.id, read: false, createdAt: new Date().toISOString() });
  }
  return Response.json({ item });
}
