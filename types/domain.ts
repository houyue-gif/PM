export type Status = "todo" | "in_progress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Organization { id: string; name: string; }
export interface Workspace { id: string; name: string; organizationId: string; }
export interface Team { id: string; name: string; memberIds: string[]; workspaceId: string; }
export interface Member { id: string; name: string; email: string; roleId: string; teamIds: string[]; }
export interface Role { id: string; name: string; permissions: string[]; }
export interface Permission { id: string; key: string; description: string; }
export interface Tag { id: string; name: string; color: string; }

export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "closed" | "archived";
export type ProjectPhaseType = "initiation" | "planning" | "execution" | "acceptance" | "retrospective";
export type ProjectRiskLevel = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: ProjectStatus;
  phase: ProjectPhaseType;
  type: "product" | "delivery" | "ops" | "research";
  businessLine: string;
  ownerId: string;
  adminIds: string[];
  memberIds: string[];
  teamId: string;
  workspaceId: string;
  startDate: string;
  endDate: string;
  progress: number;
  scheduleDelta: number;
  health: "good" | "risk" | "critical";
  riskLevel: ProjectRiskLevel;
  visibility: "workspace" | "team" | "private";
  tagIds: string[];
  archived: boolean;
  templateId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  type: ProjectPhaseType;
  ownerId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "done" | "delayed";
  keyNode: boolean;
  note?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  kind: "release" | "quality_gate" | "go_live" | "business";
  targetDate: string;
  actualDate?: string;
  status: "pending" | "on_track" | "at_risk" | "done" | "delayed";
  ownerId: string;
  criteria: string;
  relatedTaskCount: number;
  note?: string;
  keyNode: boolean;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  projectType: Project["type"];
  defaultPhaseNames: string[];
  defaultMilestones: Array<{ name: string; kind: Milestone["kind"] }>;
  defaultTags: string[];
  system: boolean;
  enabled: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  memberId: string;
  role: "admin" | "member" | "observer";
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
  eventType?: "project_update" | "owner_change" | "phase_change" | "milestone_change" | "risk_update" | "comment";
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
