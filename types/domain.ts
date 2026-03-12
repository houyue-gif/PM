export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "not_started" | "in_progress" | "blocked" | "pending_acceptance" | "completed" | "closed";

export interface Organization { id: string; name: string; }
export interface Workspace { id: string; name: string; organizationId: string; }
export interface Team { id: string; name: string; memberIds: string[]; workspaceId: string; }
export interface Member { id: string; name: string; email: string; roleId: string; teamIds: string[]; }
export interface Role { id: string; name: string; permissions: string[]; }
export interface Permission { id: string; key: string; description: string; }
export interface Tag { id: string; name: string; color: string; }

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "draft" | "active" | "on_hold" | "completed" | "closed" | "archived";
  phase: "initiation" | "planning" | "execution" | "acceptance" | "retrospective";
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
  riskLevel: "low" | "medium" | "high" | "critical";
  visibility: "workspace" | "team" | "private";
  tagIds: string[];
  archived: boolean;
  templateId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ProjectPhase { id: string; projectId: string; name: string; type: string; ownerId: string; startDate: string; endDate: string; status: string; keyNode: boolean; note?: string; }
export interface Milestone { id: string; projectId: string; name: string; kind: string; targetDate: string; actualDate?: string; status: string; ownerId: string; criteria: string; relatedTaskCount: number; note?: string; keyNode: boolean; }
export interface ProjectTemplate { id: string; name: string; description: string; projectType: Project["type"]; defaultPhaseNames: string[]; defaultMilestones: Array<{ name: string; kind: string }>; defaultTags: string[]; system: boolean; enabled: boolean; }
export interface ProjectMember { id: string; projectId: string; memberId: string; role: "admin" | "member" | "observer"; }

export interface Task {
  id: string;
  taskNo: string;
  title: string;
  description: string;
  projectId: string;
  phaseId?: string;
  milestoneId?: string;
  iterationId?: string;
  parentTaskId?: string;
  priority: Priority;
  status: TaskStatus;
  riskLevel: "low" | "medium" | "high" | "critical";
  tagIds: string[];
  ownerId: string;
  collaboratorIds: string[];
  acceptorId: string;
  watcherIds: string[];
  plannedStartAt?: string;
  plannedEndAt: string;
  actualStartAt?: string;
  actualDoneAt?: string;
  acceptanceDoneAt?: string;
  progress: number;
  estimateHours: number;
  spentHours: number;
  remainingHours: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completionNote: string;
  acceptanceConclusion: string;
  archived: boolean;
}

export interface Acceptance { id: string; taskId: string; acceptorId: string; submittedAt: string; status: "pending" | "accepted" | "rejected"; comment?: string; rejectReason?: string; acceptedAt?: string; createdAt: string; }
export interface Dependency { id: string; fromTaskId: string; toTaskId: string; type: "FS" | "SS" | "FF" | "SF"; isHardConstraint: boolean; lagDays: number; }

export interface ActivityLog { id: string; scope: "task" | "project"; scopeId: string; actorId: string; message: string; eventType?: string; createdAt: string; }
export interface Notification { id: string; memberId: string; type: "assignment" | "mention" | "status_change"; title: string; targetType: "task" | "project"; targetId: string; read: boolean; createdAt: string; }
export interface RecentVisit { id: string; memberId: string; type: "task" | "project"; targetId: string; label: string; visitedAt: string; }
