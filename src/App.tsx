import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  AuthCallbackPage,
  BusinessAccessGate,
  BusinessPreviewPage,
  BusinessRequestsPage,
  BusinessVerificationPage,
  CustomerAccessPage,
  LoginChoicePage,
  LoginPage,
} from "./auth/AuthPages";
import { signOut } from "./auth/auth-service";
import { useAuth } from "./auth/use-auth";
import type { AppSupabaseClient } from "./data/supabase-client";
import { useWorkspaceData } from "./data/use-workspace-data";
import {
  convertSupabaseLead,
  createSupabaseLead,
  createSupabaseProject,
  scheduleSupabaseFollowUp,
  updateSupabaseFollowUp,
} from "./data/supabase-workspace-data";
import {
  convertLeadToClient,
  createClientActivity,
  createFollowUp,
  createLead,
  createLeadActivity,
  createProject,
  createProjectActivity,
} from "./data/workspace-data";
import Button from "./components/ui/Button";
import AppShell from "./layout/AppShell";
import { useNavigation } from "./navigation";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import DetailPage from "./pages/DetailPage";
import LeadsPage from "./pages/LeadsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectsPage from "./pages/ProjectsPage";
import ReferencePage from "./pages/ReferencePage";
import WorkspacePage from "./pages/WorkspacePage";
import PortalLayout from "./portal/PortalLayout";
import PortalPage from "./portal/PortalPage";
import { getRoute } from "./routes";

function App() {
  const { pathname, navigate } = useNavigation();
  const route = getRoute(pathname);
  const auth = useAuth();
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

  if (route.kind === "login") {
    return <LoginChoicePage demoAvailable={!auth.configured && demoMode} navigate={navigate} />;
  }
  if (route.kind === "business-login" || route.kind === "customer-login") {
    return (
      <LoginPage
        client={auth.client}
        configured={auth.configured}
        error={auth.error}
        mode={route.kind === "business-login" ? "business" : "customer"}
        navigate={navigate}
        user={auth.user}
      />
    );
  }
  if (route.kind === "auth-callback") {
    const callbackParams = new URLSearchParams(window.location.search);
    return (
      <AuthCallbackPage
        client={auth.client}
        configured={auth.configured}
        error={
          auth.error ??
          callbackParams.get("error_description") ??
          callbackParams.get("error") ??
          (!auth.loading && !auth.user && auth.configured
            ? "No authenticated session was returned. Please try signing in again."
            : null) ??
          (auth.configured ? null : "Supabase sign-in is not configured yet.")
        }
        navigate={navigate}
        user={auth.user}
      />
    );
  }

  if (route.kind === "business-verify") {
    return auth.loading ? (
      <LoadingPage label="Restoring your secure session…" />
    ) : (
      <BusinessVerificationPage
        client={auth.client}
        configured={auth.configured}
        error={auth.error}
        navigate={navigate}
        user={auth.user}
      />
    );
  }
  if (route.kind === "customer-access") {
    return auth.loading ? (
      <LoadingPage label="Restoring your secure session…" />
    ) : (
      <CustomerAccessPage
        client={auth.client}
        configured={auth.configured}
        error={auth.error}
        navigate={navigate}
        user={auth.user}
      />
    );
  }

  if (auth.error && !auth.client && !demoMode) {
    return <ConfigurationError message={auth.error} />;
  }

  if (!auth.configured && !demoMode && route.kind !== "reference") {
    return (
      <ConfigurationError message="Supabase authentication must be configured before the TELOS app can be used." />
    );
  }

  if (auth.configured) {
    if (auth.loading) return <LoadingPage label="Restoring your secure session…" />;
    if (route.kind === "business-requests") {
      return (
        <BusinessAccessGate {...auth} navigate={navigate}>
          <BusinessRequestsPage {...auth} navigate={navigate} />
        </BusinessAccessGate>
      );
    }
    if (route.kind === "business-preview") {
      return (
        <BusinessAccessGate {...auth} navigate={navigate} previewOnly>
          <BusinessPreviewPage navigate={navigate} />
        </BusinessAccessGate>
      );
    }
    if (route.kind === "portal") {
      return (
        <CustomerAccessPage
          client={auth.client}
          configured={auth.configured}
          error={auth.error}
          navigate={navigate}
          user={auth.user}
        />
      );
    }
    if (route.kind === "reference") return <ReferencePage />;

    return (
      <BusinessAccessGate {...auth} navigate={navigate}>
        <WorkspaceApp
          key={auth.user?.id ?? "signed-out"}
          navigate={navigate}
          pathname={pathname}
          route={route}
          scope={auth.user?.id ?? "unauthenticated"}
          authClient={auth.client}
          userId={auth.user?.id}
          ownerName={getUserDisplayName(auth.user)}
        />
      </BusinessAccessGate>
    );
  }

  if (route.kind === "business-requests" || route.kind === "business-preview") {
    return (
      <BusinessAccessGate
        {...auth}
        navigate={navigate}
        previewOnly={route.kind === "business-preview"}
      >
        {route.kind === "business-preview" ? (
          <BusinessPreviewPage navigate={navigate} />
        ) : (
          <BusinessRequestsPage {...auth} navigate={navigate} />
        )}
      </BusinessAccessGate>
    );
  }

  if (route.kind === "portal") {
    return (
      <PortalLayout>
        <PortalPage projectId={route.projectId} />
      </PortalLayout>
    );
  }
  if (route.kind === "reference") return <ReferencePage />;
  return (
    <WorkspaceApp
      navigate={navigate}
      pathname={pathname}
      route={route}
      scope="local-preview"
      authClient={null}
      previewMode={demoMode}
    />
  );
}

function WorkspaceApp({
  navigate,
  pathname,
  route,
  scope,
  authClient,
  userId = "",
  ownerName = "",
  previewMode = false,
}: {
  navigate: (to: string) => void;
  pathname: string;
  route: ReturnType<typeof getRoute>;
  scope: string;
  authClient: AppSupabaseClient | null;
  userId?: string;
  ownerName?: string;
  previewMode?: boolean;
}) {
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { data, error, updateData, runRemote, reload } = useWorkspaceData(
    true,
    scope,
    authClient,
    userId,
    ownerName,
    previewMode,
  );

  if (!data) {
    if (error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
          <section
            aria-labelledby="workspace-load-error"
            className="max-w-lg rounded-panel border border-line bg-surface p-6 shadow-panel"
            role="alert"
          >
            <h1 className="text-title font-semibold text-ink" id="workspace-load-error">
              Could not load your workspace
            </h1>
            <p className="mt-3 text-label leading-6 text-warm">{error}</p>
            <Button className="mt-5" onClick={() => void reload()} variant="secondary">
              Try again
            </Button>
          </section>
        </main>
      );
    }
    return <LoadingPage label="Loading your workspace…" />;
  }

  const addLead = (input: {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    estimatedValue?: number;
  }) => {
    if (!previewMode) {
      void runRemote((client, workspaceId) => createSupabaseLead(client, workspaceId, input));
      return;
    }
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

  const convertLead = (leadId: string) => {
    if (!previewMode) {
      void runRemote((client) => convertSupabaseLead(client, leadId));
      return;
    }
    updateData((current) => {
      const lead = current.leads.find((item) => item.id === leadId);
      if (!lead || lead.stage === "won" || lead.stage === "lost") return current;
      const existingClient = current.clients.find(
        (client) =>
          client.sourceLeadId === lead.id ||
          (Boolean(lead.email) &&
            client.email?.trim().toLowerCase() === lead.email?.trim().toLowerCase()),
      );
      const { client, lead: convertedLead } = convertLeadToClient(lead, existingClient);
      return {
        ...current,
        leads: current.leads.map((item) => (item.id === leadId ? convertedLead : item)),
        clients: existingClient
          ? current.clients.map((item) => (item.id === client.id ? client : item))
          : [client, ...current.clients],
        followUps: current.followUps.map((followUp) =>
          followUp.leadId === leadId && followUp.status === "open"
            ? {
                id: followUp.id,
                workspaceId: followUp.workspaceId,
                ownerId: followUp.ownerId,
                dueAt: followUp.dueAt,
                status: followUp.status,
                note: followUp.note,
                createdAt: followUp.createdAt,
                clientId: client.id,
              }
            : followUp,
        ),
        activities: [
          createLeadActivity(leadId, "lead_converted", `Converted to client: ${client.name}`),
          ...current.activities,
        ],
      };
    });
  };

  const addProject = (input: {
    clientId: string;
    name: string;
    startDate?: string;
    deadline?: string;
  }) => {
    if (!previewMode) {
      void runRemote((client, workspaceId) => createSupabaseProject(client, workspaceId, input));
      return;
    }
    const project = createProject(input);
    updateData((current) => ({
      ...current,
      projects: [project, ...current.projects],
      activities: [
        createProjectActivity(project.project.id, `Project created: ${project.project.name}`),
        ...current.activities,
      ],
    }));
  };

  const scheduleFollowUp = (input: { leadId: string; dueAt: string; note: string }) => {
    if (!previewMode) {
      void runRemote((client, workspaceId) => scheduleSupabaseFollowUp(client, workspaceId, input));
      return;
    }
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
    if (!previewMode) {
      void runRemote((client) => updateSupabaseFollowUp(client, followUpId, "sent", message));
      return;
    }
    updateData((current) => {
      const followUp = current.followUps.find((item) => item.id === followUpId);
      if (!followUp || followUp.status !== "open") return current;
      let activity;
      if (followUp.leadId) {
        activity = createLeadActivity(
          followUp.leadId,
          "follow_up_sent",
          `Follow-up logged as sent: ${message.slice(0, 90)}`,
        );
      } else if (followUp.clientId) {
        activity = createClientActivity(
          followUp.clientId,
          "follow_up_sent",
          `Follow-up logged as sent: ${message.slice(0, 90)}`,
        );
      } else {
        return current;
      }
      return {
        ...current,
        followUps: current.followUps.map((item) =>
          item.id === followUpId ? { ...item, status: "sent" } : item,
        ),
        activities: [activity, ...current.activities],
      };
    });
  };

  const completeFollowUp = (followUpId: string) => {
    if (!previewMode) {
      void runRemote((client) => updateSupabaseFollowUp(client, followUpId, "done"));
      return;
    }
    updateData((current) => {
      const followUp = current.followUps.find((item) => item.id === followUpId);
      if (!followUp || followUp.status !== "open") return current;
      let activity;
      if (followUp.leadId) {
        activity = createLeadActivity(
          followUp.leadId,
          "follow_up_completed",
          `Follow-up completed: ${followUp.note}`,
        );
      } else if (followUp.clientId) {
        activity = createClientActivity(
          followUp.clientId,
          "follow_up_completed",
          `Follow-up completed: ${followUp.note}`,
        );
      } else {
        return current;
      }
      return {
        ...current,
        followUps: current.followUps.map((item) =>
          item.id === followUpId ? { ...item, status: "done" } : item,
        ),
        activities: [activity, ...current.activities],
      };
    });
  };

  const renderLeadsPage = (initialSelectedLeadId?: string) => (
    <LeadsPage
      data={data}
      initialSelectedLeadId={initialSelectedLeadId}
      key={initialSelectedLeadId ?? "workspace-leads"}
      navigate={navigate}
      onAddLead={addLead}
      onCompleteFollowUp={completeFollowUp}
      onConvertLead={convertLead}
      onCreateProject={addProject}
      onScheduleFollowUp={scheduleFollowUp}
      onSendFollowUp={sendFollowUp}
    />
  );

  async function handleSignOut() {
    if (!authClient) return;
    try {
      await signOut(authClient);
      navigate("/login");
    } catch (cause) {
      setSignOutError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  let page;
  switch (route.kind) {
    case "dashboard":
      page = <Dashboard data={data} navigate={navigate} />;
      break;
    case "workspace":
      page =
        route.title === "Leads" ? (
          renderLeadsPage()
        ) : route.title === "Clients" ? (
          <ClientsPage data={data} navigate={navigate} />
        ) : route.title === "Projects" ? (
          <ProjectsPage data={data} navigate={navigate} />
        ) : (
          <WorkspacePage description={route.description} title={route.title} />
        );
      break;
    case "detail":
      page =
        route.entity === "lead" ? (
          renderLeadsPage(route.id)
        ) : (
          <DetailPage entity={route.entity} id={route.id} navigate={navigate} title={route.title} />
        );
      break;
    case "reference":
      page = <ReferencePage />;
      break;
    case "not-found":
      page = <NotFoundPage navigate={navigate} />;
      break;
    default:
      page = <NotFoundPage navigate={navigate} />;
      break;
  }

  return (
    <AppShell
      contactsLimit={data.contactsLimit}
      contactsUsed={data.contactsUsed}
      navigate={navigate}
      onSignOut={authClient ? () => void handleSignOut() : undefined}
      ownerName={data.ownerName}
      pathname={pathname}
      previewMode={previewMode}
    >
      {error && (
        <p
          className="mb-4 rounded-control bg-warm-soft px-4 py-3 text-label text-warm"
          role="alert"
        >
          Workspace change failed: {error}
        </p>
      )}
      {signOutError && (
        <p
          className="mb-4 rounded-control bg-warm-soft px-4 py-3 text-label text-warm"
          role="alert"
        >
          {signOutError}
        </p>
      )}
      {page}
    </AppShell>
  );
}

function getUserDisplayName(user: User | null) {
  const fullName = user?.user_metadata.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  const name = user?.user_metadata.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  return user?.email?.split("@")[0] ?? "Workspace owner";
}

function LoadingPage({ label }: { label: string }) {
  return (
    <main
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-canvas px-5 text-label text-muted"
    >
      {label}
    </main>
  );
}

function ConfigurationError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <section className="max-w-lg rounded-panel border border-line bg-surface p-6 shadow-panel">
        <h1 className="text-title font-semibold text-ink">Authentication configuration issue</h1>
        <p className="mt-3 text-label leading-6 text-warm">{message}</p>
        <p className="mt-3 text-caption text-muted">
          Correct the local Supabase URL and public key in <code>.env.local</code>, then restart the
          development server.
        </p>
      </section>
    </main>
  );
}

export default App;
