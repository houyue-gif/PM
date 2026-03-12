import { addDays, subDays } from "date-fns";
import {
  ActivityLog,
  Comment,
  Member,
  Milestone,
  Notification,
  Organization,
  Permission,
  Project,
  ProjectMember,
  ProjectPhase,
  ProjectTemplate,
  RecentVisit,
  Role,
  Tag,
  Task,
  Team,
  Workspace
} from "@/types/domain";

const now = new Date();

export const organizations: Organization[] = [{ id: "org_1", name: "Acme Group" }];
export const workspaces: Workspace[] = [{ id: "ws_1", name: "Product Workspace", organizationId: "org_1" }];
export const permissions: Permission[] = [
  { id: "p1", key: "project.read", description: "查看项目" },
  { id: "p2", key: "project.write", description: "编辑项目" },
  { id: "p3", key: "task.write", description: "编辑任务" },
  { id: "p4", key: "member.manage", description: "管理成员" }
];
export const roles: Role[] = [
  { id: "r1", name: "Admin", permissions: permissions.map((p) => p.key) },
  { id: "r2", name: "Project Manager", permissions: ["project.read", "project.write", "task.write"] },
  { id: "r3", name: "Member", permissions: ["project.read"] }
];

export const members: Member[] = [
  { id: "u1", name: "Lena", email: "lena@acme.com", roleId: "r1", teamIds: ["t1"] },
  { id: "u2", name: "Bruce", email: "bruce@acme.com", roleId: "r2", teamIds: ["t1", "t2"] },
  { id: "u3", name: "Nora", email: "nora@acme.com", roleId: "r3", teamIds: ["t2"] }
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

export const projects: Project[] = [
  {
    id: "pr1",
    code: "PM-001",
    name: "PM P0 Launch",
    description: "搭建首版项目管理平台",
    status: "active",
    phase: "execution",
    type: "product",
    businessLine: "SaaS",
    ownerId: "u2",
    adminIds: ["u1", "u2"],
    memberIds: ["u1", "u2", "u3"],
    teamId: "t1",
    workspaceId: "ws_1",
    startDate: subDays(now, 20).toISOString(),
    endDate: addDays(now, 40).toISOString(),
    progress: 58,
    scheduleDelta: 3,
    health: "good",
    riskLevel: "medium",
    visibility: "workspace",
    tagIds: ["tag1", "tag2", "tag4"],
    archived: false,
    templateId: "tpl1",
    updatedAt: subDays(now, 1).toISOString(),
    createdAt: subDays(now, 30).toISOString()
  },
  {
    id: "pr2",
    code: "DS-018",
    name: "Design System",
    description: "统一 B 端组件库规范",
    status: "on_hold",
    phase: "planning",
    type: "research",
    businessLine: "DesignOps",
    ownerId: "u1",
    adminIds: ["u1"],
    memberIds: ["u1", "u3"],
    teamId: "t2",
    workspaceId: "ws_1",
    startDate: subDays(now, 14).toISOString(),
    endDate: addDays(now, 14).toISOString(),
    progress: 32,
    scheduleDelta: 9,
    health: "risk",
    riskLevel: "high",
    visibility: "team",
    tagIds: ["tag3"],
    archived: false,
    templateId: "tpl2",
    updatedAt: now.toISOString(),
    createdAt: subDays(now, 18).toISOString()
  }
];

export const projectMembers: ProjectMember[] = [
  { id: "pm1", projectId: "pr1", memberId: "u1", role: "admin" },
  { id: "pm2", projectId: "pr1", memberId: "u2", role: "admin" },
  { id: "pm3", projectId: "pr1", memberId: "u3", role: "member" },
  { id: "pm4", projectId: "pr2", memberId: "u1", role: "admin" },
  { id: "pm5", projectId: "pr2", memberId: "u3", role: "member" }
];

export const projectPhases: ProjectPhase[] = [
  { id: "ph1", projectId: "pr1", name: "立项", type: "initiation", ownerId: "u2", startDate: subDays(now, 20).toISOString(), endDate: subDays(now, 15).toISOString(), status: "done", keyNode: true },
  { id: "ph2", projectId: "pr1", name: "规划", type: "planning", ownerId: "u1", startDate: subDays(now, 14).toISOString(), endDate: subDays(now, 7).toISOString(), status: "done", keyNode: true },
  { id: "ph3", projectId: "pr1", name: "执行", type: "execution", ownerId: "u2", startDate: subDays(now, 6).toISOString(), endDate: addDays(now, 20).toISOString(), status: "active", keyNode: true },
  { id: "ph4", projectId: "pr2", name: "规划", type: "planning", ownerId: "u1", startDate: subDays(now, 10).toISOString(), endDate: addDays(now, 4).toISOString(), status: "delayed", keyNode: true, note: "需求评审延期" }
];

export const milestones: Milestone[] = [
  { id: "ms1", projectId: "pr1", name: "需求冻结", kind: "quality_gate", targetDate: subDays(now, 4).toISOString(), actualDate: subDays(now, 3).toISOString(), status: "done", ownerId: "u2", criteria: "核心需求全部评审完成", relatedTaskCount: 12, keyNode: true },
  { id: "ms2", projectId: "pr1", name: "Beta 发布", kind: "release", targetDate: addDays(now, 10).toISOString(), status: "on_track", ownerId: "u1", criteria: "核心流程可用，缺陷可控", relatedTaskCount: 8, keyNode: true },
  { id: "ms3", projectId: "pr2", name: "规范评审", kind: "business", targetDate: addDays(now, 3).toISOString(), status: "at_risk", ownerId: "u3", criteria: "关键组件规范通过评审", relatedTaskCount: 5, keyNode: true }
];

export const tasks: Task[] = [
  { id: "tk1", projectId: "pr1", title: "搭建 App Shell", description: "完成 sidebar/topbar/layout", status: "done", priority: "high", tagIds: ["tag1"], assigneeId: "u1", creatorId: "u2", dueDate: subDays(now, 1).toISOString(), subTaskIds: ["tk4"], watcherIds: ["u2", "u3"], createdAt: subDays(now, 8).toISOString(), updatedAt: subDays(now, 1).toISOString() },
  { id: "tk2", projectId: "pr1", title: "实现任务看板视图", description: "支持按状态分栏", status: "in_progress", priority: "urgent", tagIds: ["tag1", "tag2"], assigneeId: "u2", creatorId: "u1", dueDate: addDays(now, 2).toISOString(), subTaskIds: [], watcherIds: ["u1"], createdAt: subDays(now, 3).toISOString(), updatedAt: now.toISOString() },
  { id: "tk3", projectId: "pr2", title: "设计通知面板样式", description: "支持未读已读状态", status: "todo", priority: "medium", tagIds: ["tag3"], assigneeId: "u3", creatorId: "u1", dueDate: addDays(now, 5).toISOString(), subTaskIds: [], watcherIds: ["u1", "u2"], createdAt: subDays(now, 2).toISOString(), updatedAt: now.toISOString() },
  { id: "tk4", projectId: "pr1", title: "补充空状态/加载态", description: "保证关键页面体验", status: "in_progress", priority: "medium", tagIds: ["tag3"], assigneeId: "u3", creatorId: "u2", dueDate: addDays(now, 3).toISOString(), subTaskIds: [], watcherIds: ["u1"], createdAt: subDays(now, 2).toISOString(), updatedAt: now.toISOString() }
];

export const comments: Comment[] = [
  { id: "c1", taskId: "tk2", memberId: "u1", content: "@Bruce 看板列顺序是否需要和状态机一致？", createdAt: subDays(now, 1).toISOString() },
  { id: "c2", taskId: "tk2", memberId: "u2", content: "已调整，今晚合并。", createdAt: now.toISOString() }
];

export const activityLogs: ActivityLog[] = [
  { id: "a1", scope: "task", scopeId: "tk2", actorId: "u2", message: "任务状态更新为 in_progress", createdAt: subDays(now, 1).toISOString() },
  { id: "a2", scope: "project", scopeId: "pr1", actorId: "u2", message: "创建项目 PM P0 Launch", eventType: "project_update", createdAt: subDays(now, 30).toISOString() },
  { id: "a3", scope: "project", scopeId: "pr1", actorId: "u1", message: "负责人由 Lena 变更为 Bruce", eventType: "owner_change", createdAt: subDays(now, 7).toISOString() },
  { id: "a4", scope: "project", scopeId: "pr1", actorId: "u2", message: "里程碑 Beta 发布目标日期调整", eventType: "milestone_change", createdAt: subDays(now, 2).toISOString() }
];

export const notifications: Notification[] = [
  { id: "n1", memberId: "u1", type: "assignment", title: "你被指派到任务：实现任务看板视图", targetType: "task", targetId: "tk2", read: false, createdAt: subDays(now, 1).toISOString() },
  { id: "n2", memberId: "u1", type: "mention", title: "Lena 在评论中提到了你", targetType: "task", targetId: "tk2", read: false, createdAt: now.toISOString() },
  { id: "n3", memberId: "u1", type: "status_change", title: "项目 Design System 状态已变更", targetType: "project", targetId: "pr2", read: true, createdAt: subDays(now, 2).toISOString() }
];

export const recentVisits: RecentVisit[] = [
  { id: "v1", memberId: "u1", type: "project", targetId: "pr1", label: "PM P0 Launch", visitedAt: now.toISOString() },
  { id: "v2", memberId: "u1", type: "task", targetId: "tk2", label: "实现任务看板视图", visitedAt: subDays(now, 1).toISOString() }
];

export const currentUserId = "u1";
