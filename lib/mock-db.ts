import { addDays, subDays } from "date-fns";
import { ActivityLog, Comment, Member, Notification, Organization, Permission, Project, RecentVisit, Role, Tag, Task, Team, Workspace } from "@/types/domain";

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
  { id: "tag3", name: "Design", color: "bg-purple-100 text-purple-700" }
];


export const projectTemplates = [
  {
    id: "tpl1",
    name: "标准产品研发模板",
    description: "包含立项-规划-执行-验收-复盘完整阶段与核心里程碑",
    projectType: "product",
    defaultPhaseNames: ["立项", "规划", "执行", "验收", "复盘"],
    defaultMilestones: [
      { name: "需求冻结", kind: "quality_gate" },
      { name: "Beta 发布", kind: "release" },
      { name: "正式上线", kind: "go_live" }
    ],
    defaultTags: ["Frontend", "Backend"],
    system: true,
    enabled: true
  }
];

export const projects: Project[] = [
  { id: "pr1", name: "PM P0 Launch", description: "搭建首版项目管理平台", status: "active", ownerId: "u2", memberIds: ["u1", "u2", "u3"], workspaceId: "ws_1", startDate: now.toISOString(), endDate: addDays(now, 40).toISOString(), health: "good" },
  { id: "pr2", name: "Design System", description: "统一 B 端组件库规范", status: "on_hold", ownerId: "u1", memberIds: ["u1", "u3"], workspaceId: "ws_1", startDate: subDays(now, 14).toISOString(), endDate: addDays(now, 14).toISOString(), health: "risk" }
];

export const tasks: Task[] = [
  { id: "tk1", projectId: "pr1", title: "搭建 App Shell", description: "完成 sidebar/topbar/layout", status: "done", priority: "high", tagIds: ["tag1"], assigneeId: "u1", creatorId: "u2", dueDate: subDays(now, 1).toISOString(), subTaskIds: ["tk4"], watcherIds: ["u2", "u3"], createdAt: subDays(now, 8).toISOString(), updatedAt: subDays(now, 1).toISOString() },
  { id: "tk2", projectId: "pr1", title: "实现任务看板视图", description: "支持按状态分栏", status: "in_progress", priority: "urgent", tagIds: ["tag1", "tag2"], assigneeId: "u2", creatorId: "u1", dueDate: addDays(now, 2).toISOString(), subTaskIds: [], watcherIds: ["u1"], createdAt: subDays(now, 3).toISOString(), updatedAt: now.toISOString() },
  { id: "tk3", projectId: "pr2", title: "设计通知面板样式", description: "支持未读已读状态", status: "todo", priority: "medium", tagIds: ["tag3"], assigneeId: "u3", creatorId: "u1", dueDate: addDays(now, 5).toISOString(), subTaskIds: [], watcherIds: ["u1", "u2"], createdAt: subDays(now, 2).toISOString(), updatedAt: now.toISOString() },
  { id: "tk4", projectId: "pr1", title: "构建面包屑组件", description: "展示当前路由路径", status: "done", priority: "low", tagIds: ["tag1"], assigneeId: "u1", creatorId: "u1", dueDate: subDays(now, 3).toISOString(), subTaskIds: [], watcherIds: ["u2"], createdAt: subDays(now, 6).toISOString(), updatedAt: subDays(now, 4).toISOString() }
];

export const comments: Comment[] = [
  { id: "c1", taskId: "tk2", memberId: "u1", content: "@Bruce 看板列宽需要再优化一下", createdAt: subDays(now, 1).toISOString() }
];

export const activityLogs: ActivityLog[] = [
  { id: "a1", scope: "task", scopeId: "tk2", actorId: "u1", message: "将任务状态更新为 in_progress", createdAt: subDays(now, 1).toISOString() },
  { id: "a2", scope: "project", scopeId: "pr1", actorId: "u2", message: "创建项目 PM P0 Launch", createdAt: subDays(now, 8).toISOString() }
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
