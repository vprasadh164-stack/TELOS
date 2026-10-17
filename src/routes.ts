export type AppRoute =
  | { kind: "dashboard" }
  | { kind: "detail"; entity: "lead" | "project"; id: string; title: string }
  | { kind: "auth-callback" }
  | { kind: "business-login" }
  | { kind: "business-preview" }
  | { kind: "business-requests" }
  | { kind: "business-verify" }
  | { kind: "customer-access" }
  | { kind: "customer-login" }
  | { kind: "login" }
  | { kind: "not-found" }
  | { kind: "portal"; projectId: string }
  | { kind: "reference" }
  | { kind: "workspace"; description: string; title: string };

const workspacePages: Record<string, { description: string; title: string }> = {
  "/automations": {
    title: "Automations",
    description: "A simple workspace for the reminders and routines you add later.",
  },
  "/clients": {
    title: "Clients",
    description: "Your client list will live here as leads move into active work.",
  },
  "/leads": {
    title: "Leads",
    description: "Organize new inquiries and follow-ups in one place.",
  },
  "/messages": {
    title: "Messages",
    description: "Client conversations will be gathered here.",
  },
  "/projects": {
    title: "Projects",
    description: "Keep active work and upcoming milestones together.",
  },
  "/reports": {
    title: "Reports",
    description: "A clear view of your pipeline and project activity will appear here.",
  },
  "/settings": {
    title: "Settings",
    description: "Workspace and account preferences will live here.",
  },
};

export function getRoute(pathname: string): AppRoute {
  if (pathname === "/") return { kind: "dashboard" };
  if (pathname === "/login") return { kind: "login" };
  if (pathname === "/business/login") return { kind: "business-login" };
  if (pathname === "/business/preview") return { kind: "business-preview" };
  if (pathname === "/business/verify") return { kind: "business-verify" };
  if (pathname === "/business/requests") return { kind: "business-requests" };
  if (pathname === "/customer/login") return { kind: "customer-login" };
  if (pathname === "/customer/access") return { kind: "customer-access" };
  if (pathname === "/auth/callback") return { kind: "auth-callback" };
  if (pathname === "/reference") return { kind: "reference" };

  const leadMatch = pathname.match(/^\/leads\/([^/]+)$/);
  if (leadMatch) {
    return {
      kind: "detail",
      entity: "lead",
      id: leadMatch[1],
      title: "Lead profile",
    };
  }

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return {
      kind: "detail",
      entity: "project",
      id: projectMatch[1],
      title: "Project overview",
    };
  }

  const portalMatch = pathname.match(/^\/portal\/([^/]+)$/);
  if (portalMatch) {
    return { kind: "portal", projectId: portalMatch[1] };
  }

  const workspacePage = workspacePages[pathname];
  if (workspacePage) {
    return { kind: "workspace", ...workspacePage };
  }

  return { kind: "not-found" };
}
