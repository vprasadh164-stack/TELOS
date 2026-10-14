export type AppRoute =
  | { kind: "dashboard" }
  | { kind: "detail"; entity: "lead" | "project"; id: string; title: string }
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
