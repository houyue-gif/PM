const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.taskActivityLog.deleteMany();
  await prisma.acceptance.deleteMany();
  await prisma.dependency.deleteMany();
  await prisma.taskCollaborator.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskSetting.deleteMany();
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
  await prisma.team.createMany({ data: [{ id: "t1", name: "Platform", workspaceId: ws.id }, { id: "t2", name: "Design", workspaceId: ws.id }] });
  await prisma.teamMember.createMany({ data: [{ teamId: "t1", memberId: "u1" }, { teamId: "t1", memberId: "u2" }, { teamId: "t2", memberId: "u2" }, { teamId: "t2", memberId: "u3" }] });

  await prisma.tag.createMany({ data: [
    { id: "tag1", name: "Frontend", color: "bg-blue-100 text-blue-700" },
    { id: "tag2", name: "Backend", color: "bg-emerald-100 text-emerald-700" },
    { id: "tag3", name: "Design", color: "bg-purple-100 text-purple-700" },
    { id: "tag4", name: "关键项目", color: "bg-amber-100 text-amber-700" }
  ]});

  await prisma.projectTemplate.createMany({ data: [
    { id: "tpl1", name: "标准产品研发模板", description: "完整阶段与里程碑", projectType: "product", defaultPhaseNames: ["立项", "规划", "执行"], defaultMilestones: [{ name: "需求冻结", kind: "quality_gate" }], defaultTags: ["Frontend"], isSystem: true, enabled: true }
  ]});

  await prisma.project.createMany({ data: [
    { id: "pr1", code: "PM-001", name: "PM P0 Launch", description: "搭建首版项目管理平台", status: "active", phase: "execution", type: "product", businessLine: "SaaS", ownerId: "u2", teamId: "t1", workspaceId: ws.id, visibility: "workspace", archived: false, progress: 58, scheduleDelta: 3, health: "good", riskLevel: "medium", templateId: "tpl1", startDate: new Date(Date.now() - 20*86400000), endDate: new Date(Date.now() + 30*86400000) },
    { id: "pr2", code: "DS-018", name: "Design System", description: "统一 B 端组件库规范", status: "on_hold", phase: "planning", type: "research", businessLine: "DesignOps", ownerId: "u1", teamId: "t2", workspaceId: ws.id, visibility: "team", archived: false, progress: 32, scheduleDelta: 9, health: "risk", riskLevel: "high", templateId: "tpl1", startDate: new Date(Date.now() - 14*86400000), endDate: new Date(Date.now() + 14*86400000) }
  ]});

  await prisma.projectMember.createMany({ data: [
    { projectId: "pr1", memberId: "u1", role: "admin" }, { projectId: "pr1", memberId: "u2", role: "admin" }, { projectId: "pr1", memberId: "u3", role: "member" },
    { projectId: "pr2", memberId: "u1", role: "admin" }, { projectId: "pr2", memberId: "u3", role: "member" }
  ]});

  await prisma.projectPhase.createMany({ data: [
    { id: "ph1", projectId: "pr1", name: "立项", type: "initiation", ownerId: "u2", startDate: new Date(Date.now()-20*86400000), endDate: new Date(Date.now()-15*86400000), status: "done", keyNode: true },
    { id: "ph2", projectId: "pr1", name: "执行", type: "execution", ownerId: "u2", startDate: new Date(Date.now()-6*86400000), endDate: new Date(Date.now()+20*86400000), status: "active", keyNode: true }
  ]});
  await prisma.milestone.createMany({ data: [
    { id: "ms1", projectId: "pr1", name: "需求冻结", kind: "quality_gate", targetDate: new Date(Date.now()-3*86400000), status: "done", ownerId: "u2", criteria: "核心需求完成", relatedTaskCount: 8, keyNode: true },
    { id: "ms2", projectId: "pr1", name: "Beta", kind: "release", targetDate: new Date(Date.now()+10*86400000), status: "on_track", ownerId: "u1", criteria: "核心流程可用", relatedTaskCount: 6, keyNode: true }
  ]});

  await prisma.task.createMany({ data: [
    { id: "tk1", taskNo: "T-1001", title: "搭建任务模块列表", description: "支持筛选和排序", projectId: "pr1", phaseId: "ph2", milestoneId: "ms2", priority: "high", status: "in_progress", riskLevel: "medium", ownerId: "u1", acceptorId: "u2", plannedStartAt: new Date(Date.now()-5*86400000), plannedEndAt: new Date(Date.now()+3*86400000), actualStartAt: new Date(Date.now()-4*86400000), progress: 60, estimateHours: 16, spentHours: 10, remainingHours: 6, createdBy: "u2" },
    { id: "tk2", taskNo: "T-1002", title: "任务详情页开发", description: "详情tab", projectId: "pr1", phaseId: "ph2", milestoneId: "ms2", priority: "urgent", status: "pending_acceptance", riskLevel: "high", ownerId: "u2", acceptorId: "u1", plannedStartAt: new Date(Date.now()-6*86400000), plannedEndAt: new Date(Date.now()-1*86400000), actualStartAt: new Date(Date.now()-6*86400000), actualDoneAt: new Date(Date.now()-1*86400000), progress: 100, estimateHours: 20, spentHours: 22, remainingHours: 0, createdBy: "u1", completionNote: "已完成开发，待验收" },
    { id: "tk3", taskNo: "T-1003", title: "任务甘特图基础版", description: "左树右轴", projectId: "pr1", phaseId: "ph2", milestoneId: "ms2", priority: "medium", status: "not_started", riskLevel: "low", ownerId: "u3", acceptorId: "u1", plannedStartAt: new Date(Date.now()+1*86400000), plannedEndAt: new Date(Date.now()+7*86400000), progress: 0, estimateHours: 12, spentHours: 0, remainingHours: 12, createdBy: "u1" },
    { id: "tk4", taskNo: "T-1004", title: "子任务：状态流规则", description: "校验规则", projectId: "pr1", parentTaskId: "tk1", priority: "high", status: "in_progress", riskLevel: "medium", ownerId: "u1", acceptorId: "u2", plannedStartAt: new Date(Date.now()-3*86400000), plannedEndAt: new Date(Date.now()+1*86400000), actualStartAt: new Date(Date.now()-2*86400000), progress: 50, estimateHours: 8, spentHours: 4, remainingHours: 4, createdBy: "u1" }
  ]});

  await prisma.taskCollaborator.createMany({ data: [{ taskId: "tk1", memberId: "u2" }, { taskId: "tk1", memberId: "u3" }, { taskId: "tk2", memberId: "u3" }] });
  await prisma.taskTag.createMany({ data: [{ taskId: "tk1", tagId: "tag1" }, { taskId: "tk2", tagId: "tag2" }, { taskId: "tk3", tagId: "tag3" }] });
  await prisma.dependency.createMany({ data: [{ fromTaskId: "tk1", toTaskId: "tk2", type: "FS", isHardConstraint: true, lagDays: 0 }] });
  await prisma.acceptance.create({ data: { taskId: "tk2", acceptorId: "u1", submittedAt: new Date(Date.now()-12*3600000), status: "pending", comment: "请验收" } });

  await prisma.taskActivityLog.createMany({ data: [
    { taskId: "tk2", actorId: "u2", type: "submit_acceptance", message: "提交验收" },
    { taskId: "tk1", actorId: "u1", type: "status_change", message: "状态更新为进行中" }
  ]});

  await prisma.taskSetting.createMany({ data: [
    { key: "statusFlow", value: JSON.stringify(["not_started","in_progress","blocked","pending_acceptance","completed","closed"]) },
    { key: "acceptanceRules", value: JSON.stringify({ forceAcceptor: true, rejectBackTo: "in_progress", requireKeySubtasks: false }) },
    { key: "ganttRules", value: JSON.stringify({ forceStartTime: true, parentChildLinked: true, forbidChildOverflow: true }) }
  ]});
}

main().finally(() => prisma.$disconnect());
