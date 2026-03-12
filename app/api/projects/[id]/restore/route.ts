import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await prisma.project.update({ where: { id: params.id }, data: { archived: false, status: "active" } });
  await prisma.activityLog.create({ data: { scope: "project", scopeId: params.id, actorId: "u1", eventType: "project_update", message: "恢复项目" } });
  return Response.json({ ok: true });
}
