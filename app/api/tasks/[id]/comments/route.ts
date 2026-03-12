import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1) });

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.taskActivityLog.findMany({ where: { taskId: params.id, type: "comment" }, orderBy: { createdAt: "asc" } });
  return Response.json({ items: items.map((x) => ({ id: x.id, memberId: x.actorId, content: x.message, createdAt: x.createdAt.toISOString() })) });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.taskActivityLog.create({ data: { taskId: params.id, actorId: "u1", type: "comment", message: parsed.data.content } });
  return Response.json({ item: { id: item.id, memberId: item.actorId, content: item.message, createdAt: item.createdAt.toISOString() } });
}
