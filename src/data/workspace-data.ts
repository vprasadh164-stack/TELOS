import type { Activity, Client, FollowUp, Lead, Project, WorkStatus } from "../domain/types.js";

export interface DemoProject {
  project: Project;
  progress: number;
  nextMilestone: string;
  nextMilestoneStatus: WorkStatus;
}

export interface WorkspaceData {
  ownerName: string;
  contactsUsed: number;
  contactsLimit: number;
  leads: Lead[];
  clients: Client[];
  followUps: FollowUp[];
  activities: Activity[];
  projects: DemoProject[];
}

export interface WorkspaceService {
  load(scope?: string): WorkspaceData;
  save(data: WorkspaceData, scope?: string): void;
}

const storageKey = (scope: string) => `telos.demo-workspace.v1.${encodeURIComponent(scope)}`;
const workspaceId = "demo-workspace";
const ownerId = "demo-owner";

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function createSeedData(): WorkspaceData {
  const now = new Date();
  const leadCreated = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const leads: Lead[] = [
    {
      id: "lead-sofia",
      workspaceId,
      name: "Sofia Martin",
      email: "sofia@example.com",
      phone: "(415) 555-0138",
      source: "Website",
      ownerId,
      estimatedValue: 8400,
      stage: "qualified",
      createdAt: leadCreated(2),
      updatedAt: leadCreated(1),
    },
    {
      id: "lead-sarah",
      workspaceId,
      name: "Sarah Adams",
      email: "sarah@example.com",
      phone: "(415) 555-0172",
      source: "Referral",
      ownerId,
      estimatedValue: 5100,
      stage: "contacted",
      createdAt: leadCreated(4),
      updatedAt: leadCreated(2),
    },
    {
      id: "lead-abc",
      workspaceId,
      name: "ABC Restaurant",
      email: "hello@abcrestaurant.example",
      source: "Referral",
      ownerId,
      estimatedValue: 18200,
      stage: "won",
      wonAt: leadCreated(1),
      convertedClientId: "client-abc",
      createdAt: leadCreated(12),
      updatedAt: leadCreated(3),
    },
    {
      id: "lead-greenline",
      workspaceId,
      name: "Greenline Landscaping",
      email: "team@greenline.example",
      source: "Instagram",
      estimatedValue: 3200,
      stage: "new",
      createdAt: leadCreated(38),
      updatedAt: leadCreated(38),
    },
  ];
  const followUps: FollowUp[] = [
    {
      id: "follow-up-sofia",
      workspaceId,
      leadId: "lead-sofia",
      dueAt: daysFromNow(0),
      status: "open",
      note: "Confirm the project brief",
      createdAt: leadCreated(1),
      ownerId,
    },
    {
      id: "follow-up-sarah",
      workspaceId,
      leadId: "lead-sarah",
      dueAt: daysFromNow(1),
      status: "open",
      note: "Share the updated estimate",
      createdAt: leadCreated(1),
      ownerId,
    },
    {
      id: "follow-up-greenline",
      workspaceId,
      leadId: "lead-greenline",
      dueAt: daysFromNow(-1),
      status: "open",
      note: "Ask about their preferred start date",
      createdAt: leadCreated(3),
      ownerId,
    },
  ];

  return {
    ownerName: "Alex Morgan",
    contactsUsed: 742,
    contactsLimit: 1000,
    leads,
    clients: [
      {
        id: "client-abc",
        workspaceId,
        name: "ABC Restaurant",
        email: "hello@abcrestaurant.example",
        sourceLeadId: "lead-abc",
        ownerId,
        createdAt: leadCreated(1),
        updatedAt: leadCreated(1),
      },
    ],
    followUps,
    activities: [
      {
        id: "activity-sofia-created",
        workspaceId,
        entityType: "lead",
        entityId: "lead-sofia",
        actor: { kind: "system" },
        type: "lead_created",
        summary: "Lead added from Website",
        visibility: "internal",
        occurredAt: leadCreated(2),
      },
      {
        id: "activity-sofia-follow-up",
        workspaceId,
        entityType: "lead",
        entityId: "lead-sofia",
        actor: { kind: "member", userId: ownerId },
        type: "follow_up_scheduled",
        summary: "Follow-up scheduled: Confirm the project brief",
        visibility: "internal",
        occurredAt: leadCreated(1),
      },
      {
        id: "activity-sarah-created",
        workspaceId,
        entityType: "lead",
        entityId: "lead-sarah",
        actor: { kind: "system" },
        type: "lead_created",
        summary: "Lead added from Referral",
        visibility: "internal",
        occurredAt: leadCreated(4),
      },
    ],
    projects: [
      {
        project: {
          id: "project-demo",
          workspaceId,
          clientId: "client-abc",
          name: "ABC Restaurant",
          status: "in_progress",
          ownerId,
          startDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          createdAt: leadCreated(28),
          updatedAt: leadCreated(1),
        },
        progress: 60,
        nextMilestone: "Project review",
        nextMilestoneStatus: "in_progress",
      },
    ],
  };
}

type StoredWorkspaceData = Omit<WorkspaceData, "clients"> & { clients?: Client[] };

function isWorkspaceData(value: unknown): value is StoredWorkspaceData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<StoredWorkspaceData>;
  return (
    typeof data.ownerName === "string" &&
    Array.isArray(data.leads) &&
    (data.clients === undefined || Array.isArray(data.clients)) &&
    Array.isArray(data.followUps) &&
    Array.isArray(data.activities) &&
    Array.isArray(data.projects) &&
    typeof data.contactsUsed === "number" &&
    typeof data.contactsLimit === "number"
  );
}

export const demoWorkspaceService: WorkspaceService = {
  load(scope = "local-preview") {
    const key = storageKey(scope);
    const storedData = window.localStorage.getItem(key);
    if (storedData === null) {
      const seedData = createSeedData();
      this.save(seedData, scope);
      return seedData;
    }

    const parsedData: unknown = JSON.parse(storedData);
    if (!isWorkspaceData(parsedData)) {
      throw new Error(
        "Saved TELOS demo data has an unexpected format. Clear this browser's TELOS demo data to restart.",
      );
    }
    const migratedData: WorkspaceData = {
      ...parsedData,
      clients: parsedData.clients ?? clientsFromProjects(parsedData.projects),
    };
    if (parsedData.clients === undefined) this.save(migratedData, scope);
    return migratedData;
  },
  save(data, scope = "local-preview") {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(data));
  },
};

function clientsFromProjects(projects: DemoProject[]): Client[] {
  const clients = new Map<string, Client>();
  for (const { project } of projects) {
    if (!clients.has(project.clientId)) {
      clients.set(project.clientId, {
        id: project.clientId,
        workspaceId: project.workspaceId,
        name: project.name,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    }
  }
  return [...clients.values()];
}

export function createLead(input: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  estimatedValue?: number;
}): Lead {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    workspaceId,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    source: input.source?.trim() || undefined,
    estimatedValue: input.estimatedValue,
    ownerId,
    stage: "new",
    createdAt: now,
    updatedAt: now,
  };
}

export function convertLeadToClient(
  lead: Lead,
  existingClient?: Client,
): {
  client: Client;
  lead: Extract<Lead, { stage: "won" }>;
} {
  if (lead.stage === "won" || lead.stage === "lost") {
    throw new Error("Only an active lead can be converted to a client.");
  }

  const now = new Date().toISOString();
  const clientId = existingClient?.id ?? crypto.randomUUID();
  const client: Client = existingClient
    ? {
        ...existingClient,
        email: existingClient.email ?? lead.email,
        phone: existingClient.phone ?? lead.phone,
        sourceLeadId: lead.id,
        updatedAt: now,
      }
    : {
        id: clientId,
        workspaceId: lead.workspaceId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        sourceLeadId: lead.id,
        ownerId: lead.ownerId,
        createdAt: now,
        updatedAt: now,
      };
  return {
    client,
    lead: {
      ...lead,
      stage: "won",
      wonAt: now,
      convertedClientId: clientId,
      updatedAt: now,
    },
  };
}

export function createProject(input: {
  clientId: string;
  name: string;
  startDate?: string;
  deadline?: string;
}): DemoProject {
  const now = new Date().toISOString();
  const project: Project = {
    id: crypto.randomUUID(),
    workspaceId,
    clientId: input.clientId,
    name: input.name.trim(),
    status: "planning",
    ownerId,
    startDate: input.startDate || undefined,
    deadline: input.deadline || undefined,
    createdAt: now,
    updatedAt: now,
  };
  return {
    project,
    progress: 0,
    nextMilestone: "No milestones yet",
    nextMilestoneStatus: "not_started",
  };
}

export function createFollowUp(input: {
  leadId: string;
  dueAt: string;
  note: string;
}): Extract<FollowUp, { leadId: string }> {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    leadId: input.leadId,
    dueAt: new Date(input.dueAt).toISOString(),
    status: "open",
    note: input.note.trim(),
    createdAt: new Date().toISOString(),
    ownerId,
  };
}

export function createLeadActivity(
  leadId: string,
  type: Activity["type"],
  summary: string,
): Activity {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    entityType: "lead",
    entityId: leadId,
    actor: { kind: "member", userId: ownerId },
    type,
    summary,
    visibility: "internal",
    occurredAt: new Date().toISOString(),
  };
}

export function createClientActivity(
  clientId: string,
  type: Activity["type"],
  summary: string,
): Activity {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    entityType: "client",
    entityId: clientId,
    actor: { kind: "member", userId: ownerId },
    type,
    summary,
    visibility: "internal",
    occurredAt: new Date().toISOString(),
  };
}

export function createProjectActivity(projectId: string, summary: string): Activity {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    entityType: "project",
    entityId: projectId,
    actor: { kind: "member", userId: ownerId },
    type: "project_created",
    summary,
    visibility: "internal",
    occurredAt: new Date().toISOString(),
  };
}
