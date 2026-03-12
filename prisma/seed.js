const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.projectTag.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectPhase.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.projectTemplate.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.member.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.configOption.deleteMany();

  const ws = await prisma.workspace.create({ data: { id: "ws_1", name: "Product Workspace" } });

  await prisma.member.createMany({ data: [
    { id: "u1", name: "Lena", email: "lena@acme.com", role: "Admin", workspaceId: ws.id },
    { id: "u2", name: "Bruce", email: "bruce@acme.com", role: "Project Manager", workspaceId: ws.id },
    { id: "u3", name: "Nora", email: "nora@acme.com", role: "Member", workspaceId: ws.id }
  ]});

  await prisma.team.createMany({ data: [
    { id: "t1", name: "Platform", workspaceId: ws.id },
    { id: "t2", name: "Design", workspaceId: ws.id }
  ]});
  await prisma.teamMember.createMany({ data: [
    { teamId: "t1", memberId: "u1" },
    { teamId: "t1", memberId: "u2" },
    { teamId: "t2", memberId: "u2" },
    { teamId: "t2", memberId: "u3" }
  ]});

  await prisma.tag.createMany({ data: [
    { id: "tag1", name: "Frontend", color: "bg-blue-100 text-blue-700" },
    { id: "tag2", name: "Backend", color: "bg-emerald-100 text-emerald-700" },
    { id: "tag3", name: "Design", color: "bg-purple-100 text-purple-700" },
    { id: "tag4", name: "关键项目", color: "bg-amber-100 text-amber-700" }
  ]});

  await prisma.projectTemplate.createMany({ data: [
    { id: "tpl1", name: "标准产品研发模板", description: "完整阶段与里程碑", projectType: "product", defaultPhaseNames: ["立项","规划","执行","验收","复盘"], defaultMilestones: [{ name: "需求冻结", kind: "quality_gate" }], defaultTags: ["Frontend"], isSystem: true, enabled: true },
    { id: "tpl2", name: "交付项目模板", description: "偏交付", projectType: "delivery", defaultPhaseNames: ["立项","规划","执行","验收"], defaultMilestones: [{ name: "验收签收", kind: "quality_gate" }], defaultTags: ["关键项目"], isSystem: true, enabled: true }
  ]});

  const pr1 = await prisma.project.create({ data: {
    id: "pr1", code: "PM-001", name: "PM P0 Launch", description: "搭建首版项目管理平台", status: "active", phase: "execution", type: "product", businessLine: "SaaS", ownerId: "u2", teamId: "t1", workspaceId: ws.id, visibility: "workspace", archived: false, progress: 58, scheduleDelta: 3, health: "good", riskLevel: "medium", templateId: "tpl1", startDate: new Date(Date.now()-20*86400000), endDate: new Date(Date.now()+40*86400000)
  }});
  await prisma.project.create({ data: {
    id: "pr2", code: "DS-018", name: "Design System", description: "统一 B 端组件库规范", status: "on_hold", phase: "planning", type: "research", businessLine: "DesignOps", ownerId: "u1", teamId: "t2", workspaceId: ws.id, visibility: "team", archived: false, progress: 32, scheduleDelta: 9, health: "risk", riskLevel: "high", templateId: "tpl2", startDate: new Date(Date.now()-14*86400000), endDate: new Date(Date.now()+14*86400000)
  }});

  await prisma.projectMember.createMany({ data: [
    { projectId: "pr1", memberId: "u1", role: "admin" }, { projectId: "pr1", memberId: "u2", role: "admin" }, { projectId: "pr1", memberId: "u3", role: "member" },
    { projectId: "pr2", memberId: "u1", role: "admin" }, { projectId: "pr2", memberId: "u3", role: "member" }
  ]});
  await prisma.projectTag.createMany({ data: [
    { projectId: "pr1", tagId: "tag1" }, { projectId: "pr1", tagId: "tag2" }, { projectId: "pr1", tagId: "tag4" }, { projectId: "pr2", tagId: "tag3" }
  ]});

  await prisma.projectPhase.createMany({ data: [
    { id: "ph1", projectId: pr1.id, name: "立项", type: "initiation", ownerId: "u2", startDate: new Date(Date.now()-20*86400000), endDate: new Date(Date.now()-15*86400000), status: "done", keyNode: true },
    { id: "ph2", projectId: pr1.id, name: "规划", type: "planning", ownerId: "u1", startDate: new Date(Date.now()-14*86400000), endDate: new Date(Date.now()-7*86400000), status: "done", keyNode: true },
    { id: "ph3", projectId: pr1.id, name: "执行", type: "execution", ownerId: "u2", startDate: new Date(Date.now()-6*86400000), endDate: new Date(Date.now()+20*86400000), status: "active", keyNode: true }
  ]});

  await prisma.milestone.createMany({ data: [
    { id: "ms1", projectId: "pr1", name: "需求冻结", kind: "quality_gate", targetDate: new Date(Date.now()-4*86400000), actualDate: new Date(Date.now()-3*86400000), status: "done", ownerId: "u2", criteria: "核心需求全部评审完成", relatedTaskCount: 12, keyNode: true },
    { id: "ms2", projectId: "pr1", name: "Beta 发布", kind: "release", targetDate: new Date(Date.now()+10*86400000), status: "on_track", ownerId: "u1", criteria: "核心流程可用", relatedTaskCount: 8, keyNode: true }
  ]});

  await prisma.activityLog.createMany({ data: [
    { id: "a1", scope: "project", scopeId: "pr1", actorId: "u2", eventType: "project_update", message: "创建项目 PM P0 Launch" },
    { id: "a2", scope: "project", scopeId: "pr1", actorId: "u1", eventType: "owner_change", message: "负责人由 Lena 变更为 Bruce" }
  ]});

  await prisma.configOption.createMany({ data: [
    { category: "priority", key: "urgent", value: "紧急" },
    { category: "priority", key: "high", value: "高" },
    { category: "status", key: "active", value: "进行中" },
    { category: "status", key: "on_hold", value: "暂停中" }
  ]});
}

main().finally(() => prisma.$disconnect());
