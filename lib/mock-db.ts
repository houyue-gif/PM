import { addDays, subDays } from "date-fns";
import { ActivityLog, Member, Notification, Project, ProjectTemplate, RecentVisit, Tag, Task, Team } from "@/types/domain";

const now = new Date();

export const members: Member[] = [
  { id: "u1", name: "Lena", email: "lena@acme.com", roleId: "Admin", teamIds: ["t1"] },
  { id: "u2", name: "Bruce", email: "bruce@acme.com", roleId: "Project Manager", teamIds: ["t1", "t2"] },
  { id: "u3", name: "Nora", email: "nora@acme.com", roleId: "Member", teamIds: ["t2"] }
];

export const teams: Team[] = [
  { id: "t1", name: "Platform", memberIds: ["u1", "u2"], workspaceId: "ws_1" },
  { id: "t2", name: "Design", memberIds: ["u2", "u3"], workspaceId: "ws_1" }
];

export const tags: Tag[] = [
  { id: "tag1", name: "Frontend", color: "bg-blue-100 text-blue-700" },
  { id: "tag2", name: "Backend", color: "bg-emerald-100 text-emerald-700" },
  { id: "tag3", name: "Design", color: "bg-purple-100 text-purple-700" },
  { id: "tag4", name: "关键项目", color: "bg-amber-100 text-amber-700" }
];

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "tpl1",
    name: "标准产品研发模板",
    description: "包含立项-规划-执行-验收-复盘完整阶段与核心里程碑",
    projectType: "product",
    defaultPhaseNames: ["立项", "规划", "执行", "验收", "复盘"],
    defaultMilestones: [{ name: "需求冻结", kind: "quality_gate" }, { name: "Beta 发布", kind: "release" }, { name: "正式上线", kind: "go_live" }],
    defaultTags: ["Frontend", "Backend"],
    system: true,
    enabled: true
  },
  {
    id: "tpl2",
    name: "交付项目模板",
    description: "偏客户交付场景，强调评审与里程碑验收",
    projectType: "delivery",
    defaultPhaseNames: ["立项", "规划", "执行", "验收"],
    defaultMilestones: [{ name: "方案评审", kind: "business" }, { name: "验收签收", kind: "quality_gate" }],
    defaultTags: ["关键项目"],
    system: true,
    enabled: true
  }
];

export const projectTemplates: ProjectTemplate[] = [
  { id: "tpl1", name: "标准产品研发模板", description: "完整阶段与里程碑", projectType: "product", defaultPhaseNames: ["立项", "规划", "执行"], defaultMilestones: [{ name: "需求冻结", kind: "quality_gate" }], defaultTags: ["Frontend"], system: true, enabled: true }
];

export const projects: Project[] = [
  { id: "pr1", code: "PM-001", name: "PM P0 Launch", description: "搭建首版项目管理平台", status: "active", phase: "execution", type: "product", businessLine: "SaaS", ownerId: "u2", adminIds: ["u1", "u2"], memberIds: ["u1", "u2", "u3"], teamId: "t1", workspaceId: "ws_1", startDate: subDays(now, 20).toISOString(), endDate: addDays(now, 40).toISOString(), progress: 58, scheduleDelta: 3, health: "good", riskLevel: "medium", visibility: "workspace", tagIds: ["tag1"], archived: false, templateId: "tpl1", updatedAt: now.toISOString(), createdAt: subDays(now, 30).toISOString() }
];

export const tasks: Task[] = [
  { id: "tk1", taskNo: "T-1001", title: "搭建任务模块列表", description: "支持筛选和排序", projectId: "pr1", priority: "high", status: "in_progress", riskLevel: "medium", tagIds: ["tag1"], ownerId: "u1", collaboratorIds: ["u2"], acceptorId: "u2", watcherIds: [], plannedStartAt: subDays(now, 5).toISOString(), plannedEndAt: addDays(now, 2).toISOString(), actualStartAt: subDays(now, 4).toISOString(), progress: 60, estimateHours: 16, spentHours: 10, remainingHours: 6, createdBy: "u2", createdAt: subDays(now, 6).toISOString(), updatedAt: now.toISOString(), completionNote: "", acceptanceConclusion: "", archived: false },
  { id: "tk2", taskNo: "T-1002", title: "任务详情页开发", description: "详情tab", projectId: "pr1", priority: "urgent", status: "pending_acceptance", riskLevel: "high", tagIds: ["tag2"], ownerId: "u2", collaboratorIds: ["u3"], acceptorId: "u1", watcherIds: [], plannedStartAt: subDays(now, 6).toISOString(), plannedEndAt: subDays(now, 1).toISOString(), actualStartAt: subDays(now, 6).toISOString(), actualDoneAt: subDays(now, 1).toISOString(), progress: 100, estimateHours: 20, spentHours: 22, remainingHours: 0, createdBy: "u1", createdAt: subDays(now, 7).toISOString(), updatedAt: now.toISOString(), completionNote: "已完成，待验收", acceptanceConclusion: "", archived: false }
];

export const activityLogs: ActivityLog[] = [
  { id: "a1", scope: "task", scopeId: "tk2", actorId: "u2", message: "提交验收", createdAt: subDays(now, 1).toISOString() },
  { id: "a2", scope: "project", scopeId: "pr1", actorId: "u2", message: "创建项目 PM P0 Launch", createdAt: subDays(now, 30).toISOString() }
];

export const notifications: Notification[] = [
  { id: "n1", memberId: "u1", type: "assignment", title: "你被指派到任务：任务详情页开发", targetType: "task", targetId: "tk2", read: false, createdAt: now.toISOString() }
];

export const recentVisits: RecentVisit[] = [
  { id: "v1", memberId: "u1", type: "project", targetId: "pr1", label: "PM P0 Launch", visitedAt: now.toISOString() },
  { id: "v2", memberId: "u1", type: "task", targetId: "tk2", label: "任务详情页开发", visitedAt: subDays(now, 1).toISOString() }
];

export const roles = [
  { id: "r1", name: "Admin", permissions: ["project.read", "project.write"] },
  { id: "r2", name: "Project Manager", permissions: ["project.read", "task.write"] },
  { id: "r3", name: "Member", permissions: ["project.read"] }
];
