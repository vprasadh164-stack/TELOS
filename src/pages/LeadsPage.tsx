import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import type { FollowUp, Lead, LeadStage } from "../domain/types";
import type { WorkspaceData } from "../data/workspace-data";

const stages: { label: string; value: LeadStage | "all" }[] = [
  { label: "All leads", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];
type LeadsPageProps = {
  data: WorkspaceData;
  onAddLead: (input: {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    estimatedValue?: number;
  }) => void;
  onScheduleFollowUp: (input: { leadId: string; dueAt: string; note: string }) => void;
  onSendFollowUp: (followUpId: string, message: string) => void;
  onCompleteFollowUp: (followUpId: string) => void;
};

function stageLabel(stage: LeadStage) {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(value),
  );
}

function getDueLabel(followUp: FollowUp) {
  const dueDate = new Date(followUp.dueAt);
  const today = new Date();
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  if (dueDay < todayStart) return "Overdue";
  if (dueDay === todayStart) return "Due today";
  if (dueDay === tomorrowStart) return "Tomorrow";
  return formatDate(followUp.dueAt);
}

function makeLocalDateTimeValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function LeadsPage({
  data,
  onAddLead,
  onScheduleFollowUp,
  onSendFollowUp,
  onCompleteFollowUp,
}: LeadsPageProps) {
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedLeadId, setSelectedLeadId] = useState(data.leads[0]?.id ?? "");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [followUpError, setFollowUpError] = useState("");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDueDefault, setFollowUpDueDefault] = useState("");
  const [composerFollowUpId, setComposerFollowUpId] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.leads
      .filter((lead) => stageFilter === "all" || lead.stage === stageFilter)
      .filter((lead) =>
        [lead.name, lead.email, lead.phone, lead.source]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .sort((first, second) => {
        if (sortOrder === "name") return first.name.localeCompare(second.name);
        if (sortOrder === "value")
          return (second.estimatedValue ?? 0) - (first.estimatedValue ?? 0);
        return second.createdAt.localeCompare(first.createdAt);
      });
  }, [data.leads, query, sortOrder, stageFilter]);
  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? null;
  const selectedFollowUps = data.followUps
    .filter((followUp) => followUp.leadId === selectedLead?.id)
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt));
  const selectedActivities = data.activities
    .filter((activity) => activity.entityType === "lead" && activity.entityId === selectedLead?.id)
    .sort((first, second) => second.occurredAt.localeCompare(first.occurredAt));

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const source = String(formData.get("source") ?? "").trim();
    const valueRaw = String(formData.get("estimatedValue") ?? "").trim();
    const estimatedValue = valueRaw ? Number(valueRaw) : undefined;

    if (!name) {
      setFormError("Enter the lead's name.");
      return;
    }
    if (valueRaw && (!Number.isFinite(Number(valueRaw)) || Number(valueRaw) < 0)) {
      setFormError("Enter a valid, non-negative estimate.");
      return;
    }
    onAddLead({ name, email, phone, source, estimatedValue });
    setFormError("");
    setShowLeadForm(false);
    setSelectedLeadId("");
  }

  function submitFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLead) return;
    const formData = new FormData(event.currentTarget);
    const dueAt = String(formData.get("dueAt") ?? "");
    const note = String(formData.get("note") ?? "").trim();
    if (!dueAt || !note) {
      setFollowUpError("Add a due date and a short note.");
      return;
    }
    onScheduleFollowUp({ leadId: selectedLead.id, dueAt, note });
    setFollowUpError("");
    setShowFollowUpForm(false);
  }

  function submitSendFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composerFollowUpId || !followUpMessage.trim()) return;
    onSendFollowUp(composerFollowUpId, followUpMessage.trim());
    setComposerFollowUpId("");
    setFollowUpMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
            Workspace
          </p>
          <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">Leads</h1>
          <p className="mt-2 text-label text-muted">
            Keep new opportunities, next steps, and conversations together.
          </p>
        </div>
        <Button onClick={() => setShowLeadForm((visible) => !visible)}>
          <Icon className="size-4" name="plus" />
          Add lead
        </Button>
      </div>

      {showLeadForm && (
        <Card className="p-5 sm:p-6">
          <form className="space-y-4" onSubmit={submitLead}>
            <div>
              <h2 className="text-title font-semibold text-ink">New lead</h2>
              <p className="mt-1 text-caption text-muted">
                A new lead starts in the New stage. You can add follow-ups from its profile.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-label font-medium text-ink">
                Name <span className="text-primary">*</span>
                <input
                  autoFocus
                  className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                  maxLength={120}
                  name="name"
                  required
                />
              </label>
              <label className="space-y-1.5 text-label font-medium text-ink">
                Email
                <input
                  className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                  maxLength={254}
                  name="email"
                  type="email"
                />
              </label>
              <label className="space-y-1.5 text-label font-medium text-ink">
                Phone
                <input
                  className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                  maxLength={40}
                  name="phone"
                  type="tel"
                />
              </label>
              <label className="space-y-1.5 text-label font-medium text-ink">
                Source
                <input
                  className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                  maxLength={80}
                  name="source"
                  placeholder="Website, referral..."
                />
              </label>
              <label className="space-y-1.5 text-label font-medium text-ink sm:col-span-2">
                Estimated value
                <input
                  className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label sm:max-w-xs"
                  min="0"
                  name="estimatedValue"
                  placeholder="0"
                  step="0.01"
                  type="number"
                />
              </label>
            </div>
            {formError && (
              <p className="text-label text-warm" role="alert">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save lead</Button>
              <Button onClick={() => setShowLeadForm(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.85fr)]">
        <Card className="overflow-hidden">
          <div className="space-y-4 border-b border-line p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Icon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  name="search"
                />
                <input
                  aria-label="Search leads"
                  className="min-h-10 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-label"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, source..."
                  type="search"
                  value={query}
                />
              </div>
              <label className="flex items-center gap-2 text-label text-muted">
                Sort by
                <select
                  aria-label="Sort leads"
                  className="min-h-10 rounded-control border border-line bg-surface px-3 text-label text-ink"
                  onChange={(event) => setSortOrder(event.target.value)}
                  value={sortOrder}
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                  <option value="value">Value</option>
                </select>
              </label>
            </div>
            <div aria-label="Lead stages" className="flex gap-2 overflow-x-auto pb-1" role="group">
              {stages.map((stage) => {
                const count =
                  stage.value === "all"
                    ? data.leads.length
                    : data.leads.filter((lead) => lead.stage === stage.value).length;
                const active = stageFilter === stage.value;
                return (
                  <button
                    aria-pressed={active}
                    className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-control px-3 text-caption font-medium transition-colors ${
                      active ? "bg-primary-soft text-primary" : "text-muted hover:bg-canvas"
                    }`}
                    key={stage.value}
                    onClick={() => setStageFilter(stage.value)}
                    type="button"
                  >
                    {stage.label}
                    <span className="text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-caption font-medium text-muted">
                  <th className="px-5 py-3" scope="col">
                    Lead
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Stage
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Source
                  </th>
                  <th className="px-5 py-3 text-right" scope="col">
                    Est. value
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredLeads.map((lead) => (
                  <tr
                    className={`transition-colors ${selectedLead?.id === lead.id ? "bg-primary-soft/50" : "hover:bg-canvas/70"}`}
                    key={lead.id}
                  >
                    <td className="px-5 py-3.5">
                      <button
                        aria-pressed={selectedLead?.id === lead.id}
                        className="flex items-center gap-3 text-left"
                        onClick={() => setSelectedLeadId(lead.id)}
                        type="button"
                      >
                        <Avatar name={lead.name} size="small" />
                        <span>
                          <span className="block text-label font-semibold text-ink">
                            {lead.name}
                          </span>
                          <span className="mt-0.5 block text-caption text-muted">
                            {lead.email ?? "No email"}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={lead.stage === "lost" ? "neutral" : "primary"}>
                        {stageLabel(lead.stage)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-label text-muted">{lead.source ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right text-label font-medium text-ink">
                      {lead.estimatedValue === undefined
                        ? "—"
                        : formatCurrency(lead.estimatedValue)}
                    </td>
                    <td className="px-5 py-3.5 text-label text-muted">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-label text-muted" colSpan={5}>
                      {data.leads.length === 0
                        ? "No leads yet. Add your first lead to get started."
                        : "No leads match those filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedLead && (
          <LeadProfile
            activities={selectedActivities}
            followUps={selectedFollowUps}
            lead={selectedLead}
            onCompleteFollowUp={onCompleteFollowUp}
            onScheduleFollowUp={() => {
              if (!showFollowUpForm) {
                setFollowUpDueDefault(
                  makeLocalDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)),
                );
              }
              setShowFollowUpForm((visible) => !visible);
            }}
            onSend={(followUpId) => {
              setComposerFollowUpId(followUpId);
              setFollowUpMessage(
                `Hi ${selectedLead.name.split(" ")[0]},\n\nJust checking in on the next steps for your project. Let me know if you have any questions.\n\nBest,\nAlex`,
              );
            }}
          >
            {showFollowUpForm && (
              <form
                className="mt-4 space-y-3 rounded-control border border-line bg-canvas p-3"
                onSubmit={submitFollowUp}
              >
                <label className="block space-y-1.5 text-caption font-medium text-ink">
                  Due date and time
                  <input
                    className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                    defaultValue={followUpDueDefault}
                    name="dueAt"
                    required
                    type="datetime-local"
                  />
                </label>
                <label className="block space-y-1.5 text-caption font-medium text-ink">
                  Next step
                  <input
                    className="min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label"
                    maxLength={240}
                    name="note"
                    placeholder="What needs to happen?"
                    required
                  />
                </label>
                {followUpError && (
                  <p className="text-caption text-warm" role="alert">
                    {followUpError}
                  </p>
                )}
                <Button type="submit">Schedule follow-up</Button>
              </form>
            )}
            {composerFollowUpId && (
              <form
                className="mt-4 space-y-3 rounded-control border border-line bg-canvas p-3"
                onSubmit={submitSendFollowUp}
              >
                <p className="text-caption font-medium text-ink">Template message · demo only</p>
                <textarea
                  aria-label="Follow-up message"
                  className="min-h-28 w-full rounded-control border border-line bg-surface p-3 text-label"
                  maxLength={2000}
                  onChange={(event) => setFollowUpMessage(event.target.value)}
                  value={followUpMessage}
                />
                <p className="text-caption text-muted">
                  This logs the message to the activity timeline; it does not send email.
                </p>
                <div className="flex gap-2">
                  <Button type="submit">Log as sent</Button>
                  <Button onClick={() => setComposerFollowUpId("")} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </LeadProfile>
        )}
      </div>
    </div>
  );
}

function LeadProfile({
  activities,
  children,
  followUps,
  lead,
  onCompleteFollowUp,
  onScheduleFollowUp,
  onSend,
}: {
  activities: WorkspaceData["activities"];
  children: ReactNode;
  followUps: FollowUp[];
  lead: Lead;
  onCompleteFollowUp: (followUpId: string) => void;
  onScheduleFollowUp: () => void;
  onSend: (followUpId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={lead.name} />
            <div>
              <h2 className="text-title font-semibold text-ink">{lead.name}</h2>
              <p className="mt-1 text-label text-muted">{lead.email ?? "No email address"}</p>
            </div>
          </div>
          <Badge tone="primary">{stageLabel(lead.stage)}</Badge>
        </div>
        <div className="mt-5 grid gap-3 border-y border-line py-4 sm:grid-cols-2">
          <Info label="Phone" value={lead.phone ?? "Not added"} />
          <Info label="Source" value={lead.source ?? "Not specified"} />
          <Info
            label="Estimated value"
            value={
              lead.estimatedValue === undefined ? "Not set" : formatCurrency(lead.estimatedValue)
            }
          />
          <Info label="Added" value={formatDate(lead.createdAt)} />
        </div>
        {lead.stage !== "won" && lead.stage !== "lost" && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-label font-semibold text-ink">Follow-ups</h3>
              <Button onClick={onScheduleFollowUp} variant="secondary">
                <Icon className="size-4" name="plus" />
                Schedule
              </Button>
            </div>
            {followUps.length === 0 ? (
              <p className="mt-3 text-label text-muted">No follow-ups scheduled.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {followUps.map((followUp) => (
                  <li
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0"
                    key={followUp.id}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-label font-medium text-ink">{followUp.note}</span>
                      <span
                        className={`mt-0.5 block text-caption ${getDueLabel(followUp) === "Overdue" ? "font-semibold text-warm" : "text-muted"}`}
                      >
                        {followUp.status === "done"
                          ? "Completed"
                          : followUp.status === "sent"
                            ? "Sent"
                            : getDueLabel(followUp)}
                      </span>
                    </span>
                    {followUp.status === "open" && (
                      <>
                        <Button onClick={() => onSend(followUp.id)} variant="quiet">
                          Send follow-up
                        </Button>
                        <Button
                          aria-label={`Complete follow-up: ${followUp.note}`}
                          onClick={() => onCompleteFollowUp(followUp.id)}
                          variant="quiet"
                        >
                          <Icon className="size-4" name="check" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {children}
          </div>
        )}
      </Card>
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-label font-semibold text-ink">Activity timeline</h3>
            <p className="mt-1 text-caption text-muted">A record of the relationship so far.</p>
          </div>
          <Badge>{activities.length} events</Badge>
        </div>
        {activities.length === 0 ? (
          <p className="mt-5 text-label text-muted">
            Activity will appear here as you work this lead.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {activities.map((activity) => (
              <li className="relative flex gap-3" key={activity.id}>
                <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon
                    className="size-3.5"
                    name={activity.type.startsWith("follow_up") ? "clock" : "users"}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-label text-ink">{activity.summary}</p>
                  <p className="mt-1 text-caption text-muted">{formatDate(activity.occurredAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-1 break-words text-label font-medium text-ink">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default LeadsPage;
