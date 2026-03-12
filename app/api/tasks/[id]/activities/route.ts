import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.taskActivityLog.findMany({ where: { taskId: params.id }, orderBy: { createdAt: "desc" } });
  return Response.json({ items: items.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })) });
}
