import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import InternalLink from "../components/ui/InternalLink";
import type { FollowUp } from "../domain/types";
import type { WorkspaceData } from "../data/workspace-data";
import type { Navigate } from "../navigation";

function ClientsPage({ data, navigate }: { data: WorkspaceData; navigate: Navigate }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          Workspace
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">Clients</h1>
        <p className="mt-2 text-label text-muted">
          Relationships converted from your lead pipeline.
        </p>
      </div>
      {data.clients.length === 0 ? (
        <Card className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
          <h2 className="text-title font-semibold text-ink">No clients yet</h2>
          <p className="mt-2 max-w-md text-label leading-6 text-muted">
            When you convert a qualified lead, its client record will appear here.
          </p>
          <InternalLink
            className="mt-4 text-label font-semibold text-primary no-underline hover:underline"
            href="/leads"
            navigate={navigate}
          >
            Go to leads
          </InternalLink>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.clients.map((client) => {
            const projects = data.projects.filter(({ project }) => project.clientId === client.id);
            const openFollowUps = data.followUps.filter(
              (followUp): followUp is Extract<FollowUp, { clientId: string }> =>
                followUp.clientId === client.id && followUp.status === "open",
            );
            return (
              <li key={client.id}>
                <Card className="h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={client.name} size="small" />
                      <div className="min-w-0">
                        <h2 className="truncate text-label font-semibold text-ink">
                          {client.name}
                        </h2>
                        <p className="truncate text-caption text-muted">
                          {client.email ?? "No email address"}
                        </p>
                      </div>
                    </div>
                    <Badge tone="primary">{projects.length} projects</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-caption text-muted">
                    <span>{openFollowUps.length} open follow-ups</span>
                    {client.sourceLeadId && (
                      <InternalLink
                        className="font-semibold text-primary no-underline hover:underline"
                        href={`/leads/${client.sourceLeadId}`}
                        navigate={navigate}
                      >
                        Source lead
                      </InternalLink>
                    )}
                  </div>
                  {projects.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {projects.map(({ project }) => (
                        <li key={project.id}>
                          <InternalLink
                            className="text-label font-medium text-primary no-underline hover:underline"
                            href={`/projects/${project.id}`}
                            navigate={navigate}
                          >
                            {project.name}
                          </InternalLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ClientsPage;
