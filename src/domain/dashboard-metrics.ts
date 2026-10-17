import type { ActiveLeadStage, FollowUp, Lead, ProjectStatus } from "./types.js";
import type { DemoProject, WorkspaceData } from "../data/workspace-data.js";

const activeProjectStatuses: ProjectStatus[] = ["planning", "in_progress", "on_hold"];
const activeLeadStages: ActiveLeadStage[] = ["new", "contacted", "qualified", "proposal"];

function isActiveLead(lead: Lead): lead is Extract<Lead, { stage: ActiveLeadStage }> {
  return lead.stage !== "won" && lead.stage !== "lost";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function isInRange(value: string, start: Date, end: Date) {
  const timestamp = new Date(value).getTime();
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

export function isOpenFollowUpDue(followUp: FollowUp, now = new Date()) {
  return followUp.status === "open" && new Date(followUp.dueAt).getTime() <= now.getTime();
}

export function getOpenFollowUps(data: WorkspaceData) {
  return data.followUps
    .filter((followUp) => followUp.status === "open")
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt));
}

function isOnTrack(project: DemoProject, today: string) {
  const status = project.project.status;
  return (
    (status === "planning" || status === "in_progress") &&
    (!project.project.deadline || project.project.deadline >= today)
  );
}

export function calculateDashboardMetrics(data: WorkspaceData, now = new Date()) {
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = startOfNextMonth(now);
  const previousMonthStart = startOfPreviousMonth(now);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const previousWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const thisWeekValue = data.leads
    .filter((lead) => isInRange(lead.createdAt, weekStart, new Date(now.getTime() + 1)))
    .reduce((total, lead) => total + (lead.estimatedValue ?? 0), 0);
  const lastWeekValue = data.leads
    .filter((lead) => isInRange(lead.createdAt, previousWeekStart, weekStart))
    .reduce((total, lead) => total + (lead.estimatedValue ?? 0), 0);
  const newLeadsThisMonth = data.leads.filter((lead) =>
    isInRange(lead.createdAt, currentMonthStart, nextMonthStart),
  ).length;
  const newLeadsLastMonth = data.leads.filter((lead) =>
    isInRange(lead.createdAt, previousMonthStart, currentMonthStart),
  ).length;
  const activeProjects = data.projects.filter((item) =>
    activeProjectStatuses.includes(item.project.status),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return {
    newLeadsThisMonth,
    newLeadsLastMonth,
    followUpsDue: data.followUps.filter((followUp) => isOpenFollowUpDue(followUp, now)).length,
    followUpsDueToday: data.followUps.filter(
      (followUp) => followUp.status === "open" && isInRange(followUp.dueAt, today, tomorrow),
    ).length,
    activeProjects: activeProjects.length,
    onTrackProjects: activeProjects.filter((item) =>
      isOnTrack(item, today.toISOString().slice(0, 10)),
    ).length,
    pipelineValue: data.leads
      .filter((lead) => isActiveLead(lead) && activeLeadStages.includes(lead.stage))
      .reduce((total, lead) => total + (lead.estimatedValue ?? 0), 0),
    weeklyPipelineChange: thisWeekValue - lastWeekValue,
    openFollowUps: getOpenFollowUps(data),
  };
}
