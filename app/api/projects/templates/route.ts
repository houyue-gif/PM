import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.projectTemplate.findMany({ where: { enabled: true }, orderBy: { createdAt: "desc" } });
  return Response.json({
    items: items.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      projectType: t.projectType,
      defaultPhaseNames: (t.defaultPhaseNames as string[]) || [],
      defaultMilestones: (t.defaultMilestones as Array<{ name: string; kind: string }>) || [],
      defaultTags: (t.defaultTags as string[]) || [],
      system: t.isSystem,
      enabled: t.enabled
    }))
  });
}
