import type { AppSupabaseClient } from "./supabase-client";
import type { Database } from "./database.types";
import type { Activity, ActivityType, Client, FollowUp, Lead, LeadStage } from "../domain/types";
import type { DemoProject, WorkspaceData } from "./workspace-data";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type FollowUpRow = Database["public"]["Tables"]["follow_ups"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export async function loadSupabaseWorkspaceData(
  client: AppSupabaseClient,
  userId: string,
  ownerName: string,
) {
  const { data: membership, error: membershipError } = await client
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) {
    throw new Error(
      "No approved business workspace is linked to this account. Complete business verification first.",
    );
  }

  const workspaceId = membership.workspace_id;
  const [
    workspaceResult,
    leadsResult,
    clientsResult,
    projectsResult,
    followUpsResult,
    activitiesResult,
  ] = await Promise.all([
    client.from("workspaces").select("name, plan_id").eq("id", workspaceId).single(),
    client.from("leads").select("*").eq("workspace_id", workspaceId).order("created_at", {
      ascending: false,
    }),
    client.from("clients").select("*").eq("workspace_id", workspaceId).order("created_at", {
      ascending: false,
    }),
    client.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", {
      ascending: false,
    }),
    client.from("follow_ups").select("*").eq("workspace_id", workspaceId).order("due_at"),
    client.from("activities").select("*").eq("workspace_id", workspaceId).order("occurred_at", {
      ascending: false,
    }),
  ]);

  for (const result of [
    workspaceResult,
    leadsResult,
    clientsResult,
    projectsResult,
    followUpsResult,
    activitiesResult,
  ]) {
    if (result.error) throw result.error;
  }
  if (
    !workspaceResult.data ||
    !leadsResult.data ||
    !clientsResult.data ||
    !projectsResult.data ||
    !followUpsResult.data ||
    !activitiesResult.data
  ) {
    throw new Error("Supabase returned incomplete workspace data.");
  }

  const leads = leadsResult.data.map(toLead);
  const clients = clientsResult.data.map(toClient);
  const projects = projectsResult.data.map(toProject);
  const followUps = followUpsResult.data.map(toFollowUp);
  const activities = activitiesResult.data.map(toActivity);

  return {
    workspaceId,
    data: {
      ownerName: ownerName || workspaceResult.data.name,
      contactsUsed: leads.length + clients.length,
      contactsLimit: 1000,
      leads,
      clients,
      projects,
      followUps,
      activities,
    } satisfies WorkspaceData,
  };
}

export async function createSupabaseLead(
  client: AppSupabaseClient,
  workspaceId: string,
  input: { name: string; email?: string; phone?: string; source?: string; estimatedValue?: number },
) {
  const { error } = await client.rpc("create_lead_with_activity", {
    p_workspace_id: workspaceId,
    p_name: input.name.trim(),
    ...(input.email ? { p_email: input.email.trim() } : {}),
    ...(input.phone ? { p_phone: input.phone.trim() } : {}),
    ...(input.source ? { p_source: input.source.trim() } : {}),
    ...(input.estimatedValue !== undefined ? { p_estimated_value: input.estimatedValue } : {}),
  });
  if (error) throw error;
}

export async function convertSupabaseLead(client: AppSupabaseClient, leadId: string) {
  const { error } = await client.rpc("convert_lead_to_client", { p_lead_id: leadId });
  if (error) throw error;
}

export async function createSupabaseProject(
  client: AppSupabaseClient,
  workspaceId: string,
  input: { clientId: string; name: string; startDate?: string; deadline?: string },
) {
  const { error } = await client.rpc("create_project_with_activity", {
    p_workspace_id: workspaceId,
    p_client_id: input.clientId,
    p_name: input.name.trim(),
    ...(input.startDate ? { p_start_date: input.startDate } : {}),
    ...(input.deadline ? { p_deadline: input.deadline } : {}),
  });
  if (error) throw error;
}

export async function scheduleSupabaseFollowUp(
  client: AppSupabaseClient,
  workspaceId: string,
  input: { leadId: string; dueAt: string; note: string },
) {
  const { error } = await client.rpc("create_follow_up_with_activity", {
    p_workspace_id: workspaceId,
    p_lead_id: input.leadId,
    p_due_at: input.dueAt,
    p_note: input.note.trim(),
  });
  if (error) throw error;
}

export async function updateSupabaseFollowUp(
  client: AppSupabaseClient,
  followUpId: string,
  status: "sent" | "done",
  message?: string,
) {
  const { error } = await client.rpc("update_follow_up_status", {
    p_follow_up_id: followUpId,
    p_status: status,
    ...(message ? { p_message: message.slice(0, 90) } : {}),
  });
  if (error) throw error;
}

function toLead(row: LeadRow): Lead {
  const base = {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    source: row.source ?? undefined,
    ownerId: row.owner_id ?? undefined,
    estimatedValue: row.estimated_value ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (
    row.stage === "won" &&
    row.won_at &&
    row.converted_client_id &&
    row.lost_at === null &&
    row.lost_reason === null
  ) {
    return {
      ...base,
      stage: "won",
      wonAt: row.won_at,
      convertedClientId: row.converted_client_id,
    };
  }
  if (row.stage === "lost" && row.lost_at && row.lost_reason) {
    return {
      ...base,
      stage: "lost",
      lostAt: row.lost_at,
      lostReason: row.lost_reason,
    };
  }
  if (
    isActiveLeadStage(row.stage) &&
    row.won_at === null &&
    row.converted_client_id === null &&
    row.lost_at === null &&
    row.lost_reason === null
  ) {
    return { ...base, stage: row.stage };
  }
  throw new Error(`Lead ${row.id} has inconsistent conversion data.`);
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    sourceLeadId: row.source_lead_id ?? undefined,
    ownerId: row.owner_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProject(row: ProjectRow): DemoProject {
  return {
    project: {
      id: row.id,
      workspaceId: row.workspace_id,
      clientId: row.client_id,
      name: row.name,
      status: row.status,
      ownerId: row.owner_id ?? undefined,
      startDate: row.start_date ?? undefined,
      deadline: row.deadline ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    progress: 0,
    nextMilestone: "No milestones yet",
    nextMilestoneStatus: "not_started",
  };
}

function toFollowUp(row: FollowUpRow): FollowUp {
  if ((row.lead_id === null) === (row.client_id === null)) {
    throw new Error(`Follow-up ${row.id} must belong to exactly one lead or client.`);
  }
  const base = {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id ?? undefined,
    dueAt: row.due_at,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
  if (row.lead_id) return { ...base, leadId: row.lead_id };
  if (row.client_id) return { ...base, clientId: row.client_id };
  throw new Error(`Follow-up ${row.id} must belong to exactly one lead or client.`);
}

function toActivity(row: ActivityRow): Activity {
  if (!isActivityType(row.type)) {
    throw new Error(`Activity ${row.id} has an unsupported event type.`);
  }
  const actor =
    row.actor_kind === "member" && row.actor_user_id
      ? { kind: "member" as const, userId: row.actor_user_id }
      : row.actor_kind === "client" && row.actor_portal_access_id
        ? { kind: "client" as const, portalAccessId: row.actor_portal_access_id }
        : row.actor_kind === "system" && !row.actor_user_id && !row.actor_portal_access_id
          ? { kind: "system" as const }
          : null;
  if (!actor) throw new Error(`Activity ${row.id} has inconsistent actor data.`);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actor,
    type: row.type,
    summary: row.summary,
    visibility: row.visibility,
    occurredAt: row.occurred_at,
  };
}

function isActiveLeadStage(stage: LeadStage): stage is Exclude<LeadStage, "won" | "lost"> {
  return stage === "new" || stage === "contacted" || stage === "qualified" || stage === "proposal";
}

function isActivityType(value: string): value is ActivityType {
  return [
    "lead_created",
    "lead_stage_changed",
    "lead_lost",
    "lead_converted",
    "follow_up_scheduled",
    "follow_up_sent",
    "follow_up_completed",
    "project_created",
    "project_status_changed",
    "milestone_completed",
    "task_completed",
    "message_sent",
    "file_uploaded",
    "client_approved",
    "changes_requested",
    "note_added",
  ].includes(value);
}
