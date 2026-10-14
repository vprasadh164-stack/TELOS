export type Id = string;
export type DateOnly = string;
export type Instant = string;

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type ActiveLeadStage = Exclude<LeadStage, "won" | "lost">;

export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type WorkStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type FollowUpStatus = "open" | "sent" | "done";
export type MemberRole = "owner" | "member";
export type Visibility = "internal" | "portal";

export interface Workspace {
  id: Id;
  name: string;
  timezone: string;
  currency: string;
  planId: Id;
  createdAt: Instant;
}

export interface User {
  id: Id;
  name: string;
  email: string;
}

export interface WorkspaceMember {
  workspaceId: Id;
  userId: Id;
  role: MemberRole;
}

type LeadBase = {
  id: Id;
  workspaceId: Id;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  ownerId?: Id;
  estimatedValue?: number;
  createdAt: Instant;
  updatedAt: Instant;
};

export type Lead =
  | (LeadBase & {
      stage: ActiveLeadStage;
      wonAt?: never;
      convertedClientId?: never;
      lostAt?: never;
      lostReason?: never;
    })
  | (LeadBase & {
      stage: "won";
      wonAt: Instant;
      convertedClientId: Id;
      lostAt?: never;
      lostReason?: never;
    })
  | (LeadBase & {
      stage: "lost";
      lostAt: Instant;
      lostReason: string;
      wonAt?: never;
      convertedClientId?: never;
    });

export interface Client {
  id: Id;
  workspaceId: Id;
  name: string;
  email?: string;
  phone?: string;
  sourceLeadId?: Id;
  ownerId?: Id;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface Project {
  id: Id;
  workspaceId: Id;
  clientId: Id;
  name: string;
  status: ProjectStatus;
  ownerId?: Id;
  startDate?: DateOnly;
  deadline?: DateOnly;
  createdAt: Instant;
  updatedAt: Instant;
}

export interface Milestone {
  id: Id;
  projectId: Id;
  title: string;
  status: WorkStatus;
  order: number;
  dueDate?: DateOnly;
  completedAt?: Instant;
}

export interface Task {
  id: Id;
  projectId: Id;
  milestoneId?: Id;
  title: string;
  status: WorkStatus;
  assigneeId?: Id;
  dueDate?: DateOnly;
  completedAt?: Instant;
}

type FollowUpTarget = { leadId: Id; clientId?: never } | { leadId?: never; clientId: Id };

export type FollowUp = FollowUpTarget & {
  id: Id;
  workspaceId: Id;
  ownerId?: Id;
  dueAt: Instant;
  status: FollowUpStatus;
  note: string;
  createdAt: Instant;
};

export type ActivityActor =
  | { kind: "member"; userId: Id }
  | { kind: "client"; portalAccessId: Id }
  | { kind: "system" };

export type ActivityEntity =
  | { entityType: "lead"; entityId: Id }
  | { entityType: "client"; entityId: Id }
  | { entityType: "project"; entityId: Id };

export type ActivityType =
  | "lead_created"
  | "lead_stage_changed"
  | "lead_lost"
  | "lead_converted"
  | "follow_up_scheduled"
  | "follow_up_sent"
  | "follow_up_completed"
  | "project_created"
  | "project_status_changed"
  | "milestone_completed"
  | "task_completed"
  | "message_sent"
  | "file_uploaded"
  | "client_approved"
  | "changes_requested"
  | "note_added";

export type Activity = ActivityEntity & {
  id: Id;
  workspaceId: Id;
  actor: ActivityActor;
  type: ActivityType;
  summary: string;
  visibility: Visibility;
  occurredAt: Instant;
};

export type MessageSender = { kind: "member"; userId: Id } | { kind: "client"; portalAccessId: Id };

export interface Message {
  id: Id;
  workspaceId: Id;
  projectId: Id;
  sender: MessageSender;
  body: string;
  sentAt: Instant;
}

export interface ProjectFile {
  id: Id;
  workspaceId: Id;
  projectId: Id;
  uploadedBy: ActivityActor;
  fileName: string;
  mediaType: string;
  sizeBytes: number;
  storageKey: string;
  visibility: Visibility;
  uploadedAt: Instant;
}

export interface PortalAccess {
  id: Id;
  workspaceId: Id;
  projectId: Id;
  clientId: Id;
  email: string;
  status: "invited" | "active" | "revoked";
  invitedAt?: Instant;
  acceptedAt?: Instant;
  revokedAt?: Instant;
}
