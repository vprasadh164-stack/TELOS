import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import InternalLink from "../components/ui/InternalLink";
import ProgressBar from "../components/ui/ProgressBar";
import type { Navigate } from "../navigation";
import { calculateDashboardMetrics } from "../domain/dashboard-metrics";
import type { WorkspaceData } from "../data/workspace-data";
import OnboardingWizard, { type NewLeadInput } from "./OnboardingWizard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDueDate(value: string) {
  const dueDate = new Date(value);
  const today = new Date();
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  if (dueDay < todayStart) return "Overdue";
  if (dueDay === todayStart) return "Due today";
  if (dueDay === tomorrowStart) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(dueDate);
}

function Dashboard({
  data,
  navigate,
  onAddLead,
  scope,
}: {
  data: WorkspaceData;
  navigate: Navigate;
  onAddLead: (input: NewLeadInput) => void;
  scope: string;
}) {
  const workspaceIsEmpty =
    data.leads.length === 0 && data.clients.length === 0 && data.projects.length === 0;
  const greeting = getGreeting();
  const metrics = calculateDashboardMetrics(data);
  const firstProject = data.projects.find((item) =>
    ["planning", "in_progress", "on_hold"].includes(item.project.status),
  );
  const leadNameById = new Map(data.leads.map((lead) => [lead.id, lead.name]));
  const newestLeads = [...data.leads]
    .filter((lead) => lead.stage !== "won" && lead.stage !== "lost")
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  const followUps = metrics.openFollowUps.slice(0, 4);
  const weeklyTrend = metrics.weeklyPipelineChange;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-caption font-semibold uppercase tracking-[0.09em] text-muted">
              Your workspace
            </p>
            <Badge tone="primary">Local demo</Badge>
          </div>
          <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink sm:text-[28px]">
            {greeting}, {data.ownerName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-label text-muted">
            Here&apos;s a snapshot of the client journey.
          </p>
        </div>
        <Button onClick={() => navigate("/leads?new=1")}>
          <Icon className="size-4" name="plus" />
          Add lead
        </Button>
      </div>

      {workspaceIsEmpty && (
        <OnboardingWizard businessName="your workspace" onAddLead={onAddLead} scope={scope} />
      )}

      <section aria-label="Workspace overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={`${metrics.newLeadsLastMonth} last month`}
          icon="users"
          label="New leads this month"
          value={String(metrics.newLeadsThisMonth).padStart(2, "0")}
        />
        <MetricCard
          detail={`${metrics.followUpsDueToday} due today`}
          icon="clock"
          label="Follow-ups due"
          value={String(metrics.followUpsDue).padStart(2, "0")}
        />
        <MetricCard
          detail={`${metrics.onTrackProjects} on track`}
          icon="briefcase"
          label="Active projects"
          value={String(metrics.activeProjects).padStart(2, "0")}
        />
        <MetricCard
          detail={`${weeklyTrend >= 0 ? "+" : "−"}${formatCurrency(Math.abs(weeklyTrend))} this week`}
          icon="chart"
          label="Pipeline value"
          value={formatCurrency(metrics.pipelineValue)}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-semibold text-ink">Customer journey</h2>
              <p className="mt-1 text-label text-muted">Keep each relationship moving forward.</p>
            </div>
            <Badge>{newestLeads.length} leads in progress</Badge>
          </div>
          <div className="mt-7 grid grid-cols-4">
            {[
              { count: newestLeads.length, label: "Lead" },
              {
                count: metrics.openFollowUps.length,
                label: "Follow-up",
              },
              { count: metrics.activeProjects, label: "Project" },
              {
                count: data.projects.filter((item) => item.project.status === "completed").length,
                label: "Complete",
              },
            ].map((step, index) => (
              <div className="relative" key={step.label}>
                {index < 3 && <div className="absolute left-1/2 right-0 top-3 h-px bg-line" />}
                <span
                  className={`relative z-10 inline-flex size-6 items-center justify-center rounded-full text-caption font-semibold ${
                    index < 2 ? "bg-primary text-white" : "border border-line bg-surface text-muted"
                  }`}
                >
                  {String(step.count).padStart(2, "0")}
                </span>
                <p className="mt-3 pr-2 text-caption font-medium text-muted sm:text-label">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-title font-semibold text-ink">Follow-ups</h2>
              <p className="mt-1 text-label text-muted">The next steps on your list.</p>
            </div>
            <InternalLink
              className="text-label font-semibold text-primary no-underline hover:underline"
              href="/leads"
              navigate={navigate}
            >
              View all
            </InternalLink>
          </div>
          {followUps.length === 0 ? (
            <p className="mt-5 text-label text-muted">
              No open follow-ups. You&apos;re all caught up.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {followUps.map((followUp) => {
                const due = formatDueDate(followUp.dueAt);
                const leadName = followUp.leadId
                  ? (leadNameById.get(followUp.leadId) ?? "Lead")
                  : "Client";
                return (
                  <li
                    className="flex items-center gap-3 py-3 first:pt-1 last:pb-0"
                    key={followUp.id}
                  >
                    <Avatar name={leadName} size="small" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label font-semibold text-ink">{leadName}</p>
                      <p className="mt-0.5 truncate text-caption text-muted">{followUp.note}</p>
                    </div>
                    <Badge
                      tone={
                        due === "Overdue" ? "warm" : due === "Due today" ? "success" : "neutral"
                      }
                    >
                      {due}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {firstProject ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                <Icon className="size-5" name="briefcase" />
              </span>
              <div>
                <p className="text-caption font-medium text-muted">Active project</p>
                <h2 className="mt-0.5 text-title font-semibold text-ink">
                  {firstProject.project.name}
                </h2>
              </div>
            </div>
            <Badge tone="success">
              {firstProject.project.deadline &&
              firstProject.project.deadline < new Date().toISOString().slice(0, 10)
                ? "Needs attention"
                : "On track"}
            </Badge>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.5fr] md:items-center">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-label font-medium text-ink">Project progress</span>
                <span className="text-label font-semibold text-ink">{firstProject.progress}%</span>
              </div>
              <ProgressBar
                label={`${firstProject.project.name} project progress`}
                value={firstProject.progress}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-canvas px-4 py-3">
              <div>
                <p className="text-caption text-muted">Next milestone</p>
                <p className="mt-1 text-label font-semibold text-ink">
                  {firstProject.nextMilestone}
                </p>
              </div>
              <InternalLink
                className="inline-flex items-center gap-1 text-label font-semibold text-primary no-underline hover:underline"
                href={`/projects/${firstProject.project.id}`}
                navigate={navigate}
              >
                Project details
                <Icon className="size-4" name="arrow-right" />
              </InternalLink>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label text-muted">
            No active projects yet. Add a lead, convert it to a client, then create a project.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/leads?new=1")} variant="secondary">
              Add a lead
            </Button>
            {data.clients.length > 0 && (
              <Button onClick={() => navigate("/leads")}>Create a project</Button>
            )}
          </div>
        </Card>
      )}

      <p className="text-caption text-muted">
        Pipeline and follow-up totals update from the leads you manage in this local demo.
      </p>
    </div>
  );
}

function MetricCard({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: "briefcase" | "chart" | "clock" | "users";
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label font-medium text-muted">{label}</p>
        <span className="inline-flex size-8 items-center justify-center rounded-control bg-primary-soft text-primary">
          <Icon className="size-4" name={icon} />
        </span>
      </div>
      <p className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-1 text-caption text-muted">{detail}</p>
    </Card>
  );
}

export default Dashboard;
