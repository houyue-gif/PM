export type Status = "todo" | "in_progress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Organization { id: string; name: string; }
export interface Workspace { id: string; name: string; organizationId: string; }
export interface Team { id: string; name: string; memberIds: string[]; workspaceId: string; }
export interface Member { id: string; name: string; email: string; roleId: string; teamIds: string[]; }
export interface Role { id: string; name: string; permissions: string[]; }
export interface Permission { id: string; key: string; description: string; }
export interface Tag { id: string; name: string; color: string; }

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "on_hold" | "completed";
  ownerId: string;
  memberIds: string[];
  workspaceId: string;
  startDate: string;
  endDate: string;
  health: "good" | "risk" | "critical";
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tagIds: string[];
  assigneeId: string;
  creatorId: string;
  dueDate: string;
  subTaskIds: string[];
  watcherIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  memberId: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  scope: "task" | "project";
  scopeId: string;
  actorId: string;
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  memberId: string;
  type: "assignment" | "mention" | "status_change";
  title: string;
  targetType: "task" | "project";
  targetId: string;
  read: boolean;
  createdAt: string;
}

export interface RecentVisit {
  id: string;
  memberId: string;
  type: "task" | "project";
  targetId: string;
  label: string;
  visitedAt: string;
}
