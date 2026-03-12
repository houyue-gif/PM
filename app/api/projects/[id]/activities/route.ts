import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await prisma.activityLog.findMany({ where: { scope: "project", scopeId: params.id }, orderBy: { createdAt: "desc" } });
  return Response.json({ items: items.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })) });
}
