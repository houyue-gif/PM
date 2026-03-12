import { prisma } from "@/lib/prisma";

export async function getProjectOptions() {
  const [members, teams, tags] = await Promise.all([
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } })
  ]);
  return {
    members: members.map((m) => ({ id: m.id, name: m.name, email: m.email, roleId: m.role, teamIds: [] })),
    teams: teams.map((t) => ({ id: t.id, name: t.name, workspaceId: t.workspaceId, memberIds: [] })),
    tags: tags.map((t) => ({ id: t.id, name: t.name, color: t.color }))
  };
}

export async function toProjectDto(project: any) {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
    status: project.status,
    phase: project.phase,
    type: project.type,
    businessLine: project.businessLine,
    ownerId: project.ownerId,
    adminIds: project.members.filter((m: any) => m.role === "admin").map((m: any) => m.memberId),
    memberIds: project.members.map((m: any) => m.memberId),
    teamId: project.teamId,
    workspaceId: project.workspaceId,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    progress: project.progress,
    scheduleDelta: project.scheduleDelta,
    health: project.health,
    riskLevel: project.riskLevel,
    visibility: project.visibility,
    tagIds: project.tags.map((t: any) => t.tagId),
    archived: project.archived,
    templateId: project.templateId || undefined,
    updatedAt: project.updatedAt.toISOString(),
    createdAt: project.createdAt.toISOString()
  };
}

export async function getProjectWithRelations(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { members: true, tags: true, phases: true, milestones: true }
  });
}
