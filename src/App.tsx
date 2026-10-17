import { useState } from "react";
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
import { createFollowUp, createLead, createLeadActivity } from "./data/workspace-data";
import AppShell from "./layout/AppShell";
import { useNavigation } from "./navigation";
import Dashboard from "./pages/Dashboard";
import DetailPage from "./pages/DetailPage";
import LeadsPage from "./pages/LeadsPage";
import NotFoundPage from "./pages/NotFoundPage";
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
    return (
      <LoginChoicePage
        demoAvailable={!auth.configured && import.meta.env.DEV}
        navigate={navigate}
      />
    );
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

  if (auth.error && !auth.client) {
    return <ConfigurationError message={auth.error} />;
  }

  if (!auth.configured && !import.meta.env.DEV && !demoMode && route.kind !== "reference") {
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
  previewMode = false,
}: {
  navigate: (to: string) => void;
  pathname: string;
  route: ReturnType<typeof getRoute>;
  scope: string;
  authClient: AppSupabaseClient | null;
  previewMode?: boolean;
}) {
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { data, error, updateData } = useWorkspaceData(true, scope);

  if (!data) {
    return (
      <LoadingPage
        label={
          error
            ? "Could not open this browser's demo workspace. Clear its TELOS demo data to restart."
            : "Loading your workspace…"
        }
      />
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
          Changes could not be saved to this browser: {error}
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
