import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import InternalLink from "../components/ui/InternalLink";
import ProgressBar from "../components/ui/ProgressBar";
import StatusPill from "../components/ui/StatusPill";
import type { Navigate } from "../navigation";

const followUps = [
  {
    action: "Confirm the project brief",
    client: "Sofia Martin",
    due: "Due today",
  },
  {
    action: "Share the updated estimate",
    client: "Sarah Adams",
    due: "Tomorrow",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard({ navigate }: { navigate: Navigate }) {
  const greeting = getGreeting();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-caption font-semibold uppercase tracking-[0.09em] text-muted">
              Your workspace
            </p>
            <Badge tone="primary">Demo data</Badge>
          </div>
          <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink sm:text-[28px]">
            {greeting}, Alex
          </h1>
          <p className="mt-2 text-label text-muted">
            Here&apos;s a snapshot of the client journey.
          </p>
        </div>
        <Button onClick={() => navigate("/leads")}>
          <Icon className="size-4" name="plus" />
          View leads
        </Button>
      </div>

      <section aria-label="Workspace overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="Sofia Martin and one more" icon="users" label="New leads" value="02" />
        <MetricCard detail="1 due today" icon="clock" label="Follow-ups" value="02" />
        <MetricCard detail="ABC Restaurant" icon="briefcase" label="Active projects" value="01" />
        <MetricCard
          detail="Sample workspace limit"
          icon="chart"
          label="Contacts this month"
          value="742 / 1,000"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-title font-semibold text-ink">Customer journey</h2>
              <p className="mt-1 text-label text-muted">Keep each relationship moving forward.</p>
            </div>
            <Badge>2 leads in progress</Badge>
          </div>
          <div className="mt-7 grid grid-cols-4">
            {[
              { count: "02", label: "Lead" },
              { count: "02", label: "Follow-up" },
              { count: "01", label: "Project" },
              { count: "00", label: "Complete" },
            ].map((step, index) => (
              <div className="relative" key={step.label}>
                {index < 3 && <div className="absolute left-1/2 right-0 top-3 h-px bg-line" />}
                <span
                  className={`relative z-10 inline-flex size-6 items-center justify-center rounded-full text-caption font-semibold ${
                    index === 0 || index === 1
                      ? "bg-primary text-white"
                      : "border border-line bg-surface text-muted"
                  }`}
                >
                  {step.count}
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
              <p className="mt-1 text-label text-muted">A couple to keep moving.</p>
            </div>
            <InternalLink
              className="text-label font-semibold text-primary no-underline hover:underline"
              href="/leads"
              navigate={navigate}
            >
              View all
            </InternalLink>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {followUps.map((followUp) => (
              <li
                className="flex items-center gap-3 py-3 first:pt-1 last:pb-0"
                key={followUp.client}
              >
                <Avatar name={followUp.client} size="small" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label font-semibold text-ink">{followUp.client}</p>
                  <p className="mt-0.5 truncate text-caption text-muted">{followUp.action}</p>
                </div>
                <StatusPill status={followUp.due === "Tomorrow" ? "Tomorrow" : "Due today"} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-control bg-primary-soft text-primary">
              <Icon className="size-5" name="briefcase" />
            </span>
            <div>
              <p className="text-caption font-medium text-muted">Active project</p>
              <h2 className="mt-0.5 text-title font-semibold text-ink">ABC Restaurant</h2>
            </div>
          </div>
          <StatusPill status="On track" />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.5fr] md:items-center">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-label font-medium text-ink">Project progress</span>
              <span className="text-label font-semibold text-ink">60%</span>
            </div>
            <ProgressBar label="ABC Restaurant project progress" value={60} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-canvas px-4 py-3">
            <div>
              <p className="text-caption text-muted">Next milestone</p>
              <p className="mt-1 text-label font-semibold text-ink">Project review</p>
            </div>
            <InternalLink
              className="inline-flex items-center gap-1 text-label font-semibold text-primary no-underline hover:underline"
              href="/projects/demo-project"
              navigate={navigate}
            >
              Project details
              <Icon className="size-4" name="arrow-right" />
            </InternalLink>
          </div>
        </div>
      </Card>
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
