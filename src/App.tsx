import { useWorkspaceData } from "./data/use-workspace-data";
import { createFollowUp, createLead, createLeadActivity } from "./data/workspace-data";
import AppShell from "./layout/AppShell";
import { useNavigation } from "./navigation";
import PortalLayout from "./portal/PortalLayout";
import PortalPage from "./portal/PortalPage";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import LeadsPage from "./pages/LeadsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReferencePage from "./pages/ReferencePage";
import WorkspacePage from "./pages/WorkspacePage";
import { getRoute } from "./routes";

function App() {
  const { pathname, navigate } = useNavigation();
  const route = getRoute(pathname);
  const { data, error, updateData } = useWorkspaceData();

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
        <section className="max-w-lg rounded-panel border border-line bg-surface p-6 shadow-panel">
          <h1 className="text-title font-semibold text-ink">
            {error ? "Could not open your demo workspace" : "Loading your workspace…"}
          </h1>
          {error && <p className="mt-3 text-label leading-6 text-muted">{error}</p>}
          {error && (
            <p className="mt-3 text-caption text-muted">
              The local demo data was not changed. Clear this site&apos;s TELOS demo data in browser
              storage if you want to start over.
            </p>
          )}
        </section>
      </main>
    );
  }

  const addLead = (input: {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    estimatedValue?: number;
  }) => {
    const lead = createLead(input);
    updateData((current) => ({
      ...current,
      leads: [lead, ...current.leads],
      activities: [
        createLeadActivity(
          lead.id,
          "lead_created",
          `Lead added${lead.source ? ` from ${lead.source}` : ""}`,
        ),
        ...current.activities,
      ],
    }));
  };

  const scheduleFollowUp = (input: { leadId: string; dueAt: string; note: string }) => {
    const followUp = createFollowUp(input);
    updateData((current) => ({
      ...current,
      followUps: [...current.followUps, followUp],
      activities: [
        createLeadActivity(
          input.leadId,
          "follow_up_scheduled",
          `Follow-up scheduled: ${input.note}`,
        ),
        ...current.activities,
      ],
    }));
  };

  const sendFollowUp = (followUpId: string, message: string) => {
    updateData((current) => {
      const followUp = current.followUps.find((item) => item.id === followUpId);
      if (!followUp || !followUp.leadId || followUp.status !== "open") return current;
      return {
        ...current,
        followUps: current.followUps.map((item) =>
          item.id === followUpId ? { ...item, status: "sent" } : item,
        ),
        activities: [
          createLeadActivity(
            followUp.leadId,
            "follow_up_sent",
            `Follow-up logged as sent: ${message.slice(0, 90)}`,
          ),
          ...current.activities,
        ],
      };
    });
  };

  const completeFollowUp = (followUpId: string) => {
    updateData((current) => {
      const followUp = current.followUps.find((item) => item.id === followUpId);
      if (!followUp || !followUp.leadId || followUp.status !== "open") return current;
      return {
        ...current,
        followUps: current.followUps.map((item) =>
          item.id === followUpId ? { ...item, status: "done" } : item,
        ),
        activities: [
          createLeadActivity(
            followUp.leadId,
            "follow_up_completed",
            `Follow-up completed: ${followUp.note}`,
          ),
          ...current.activities,
        ],
      };
    });
  };

  if (route.kind === "portal") {
    return (
      <PortalLayout>
        <PortalPage projectId={route.projectId} />
      </PortalLayout>
    );
  }

  let page;
  switch (route.kind) {
    case "dashboard":
      page = <Dashboard data={data} navigate={navigate} />;
      break;
    case "workspace":
      page =
        route.title === "Leads" ? (
          <LeadsPage
            data={data}
            onAddLead={addLead}
            onCompleteFollowUp={completeFollowUp}
            onScheduleFollowUp={scheduleFollowUp}
            onSendFollowUp={sendFollowUp}
          />
        ) : (
          <WorkspacePage description={route.description} title={route.title} />
        );
      break;
    case "detail":
      page = (
        <DetailPage entity={route.entity} id={route.id} navigate={navigate} title={route.title} />
      );
      break;
    case "reference":
      page = <ReferencePage />;
      break;
    case "not-found":
      page = <NotFoundPage navigate={navigate} />;
      break;
  }

  return (
    <AppShell
      contactsLimit={data.contactsLimit}
      contactsUsed={data.contactsUsed}
      navigate={navigate}
      ownerName={data.ownerName}
      pathname={pathname}
    >
      {error && (
        <p
          className="mb-4 rounded-control bg-warm-soft px-4 py-3 text-label text-warm"
          role="alert"
        >
          Changes could not be saved to this browser: {error}
        </p>
      )}
      {page}
    </AppShell>
  );
}

export default App;
