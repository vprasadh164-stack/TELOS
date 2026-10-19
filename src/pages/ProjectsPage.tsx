import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import InternalLink from "../components/ui/InternalLink";
import type { ProjectStatus } from "../domain/types";
import type { WorkspaceData } from "../data/workspace-data";
import type { Navigate } from "../navigation";

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value: string | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function ProjectsPage({ data, navigate }: { data: WorkspaceData; navigate: Navigate }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          Workspace
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">Projects</h1>
        <p className="mt-2 text-label text-muted">
          Work created for your clients, with status and dates in one place.
        </p>
      </div>
      {data.projects.length === 0 ? (
        <Card className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
          <h2 className="text-title font-semibold text-ink">No projects yet</h2>
          <p className="mt-2 max-w-md text-label leading-6 text-muted">
            Convert a qualified lead to a client, then create its first project from the lead
            profile.
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
        <ul className="grid gap-4 md:grid-cols-2">
          {data.projects.map(({ project, progress, nextMilestone }) => {
            const client = data.clients.find((item) => item.id === project.clientId);
            return (
              <li key={project.id}>
                <Card className="h-full p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-muted">{client?.name ?? "Client"}</p>
                      <h2 className="mt-1 text-title font-semibold text-ink">{project.name}</h2>
                    </div>
                    <Badge tone={project.status === "on_hold" ? "neutral" : "primary"}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-caption text-muted">
                      <span>Project progress</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar label={`${project.name} project progress`} value={progress} />
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                    <div>
                      <p className="text-caption text-muted">Next milestone</p>
                      <p className="mt-1 text-label font-medium text-ink">{nextMilestone}</p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Deadline</p>
                      <p className="mt-1 text-label font-medium text-ink">
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                  </div>
                  <InternalLink
                    className="mt-5 inline-flex text-label font-semibold text-primary no-underline hover:underline"
                    href={`/projects/${project.id}`}
                    navigate={navigate}
                  >
                    View project
                  </InternalLink>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ProjectsPage;
