import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

function PortalPage({ projectId }: { projectId: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Badge tone="primary">Project portal</Badge>
      <div>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">
          Your project, in one place.
        </h1>
        <p className="mt-2 text-label leading-6 text-muted">
          A simple space for progress updates and shared next steps.
        </p>
      </div>
      <Card className="p-6">
        <p className="text-caption font-medium uppercase tracking-[0.09em] text-muted">
          Project reference
        </p>
        <p className="mt-2 text-label font-semibold text-ink">{projectId}</p>
        <p className="mt-4 text-label leading-6 text-muted">
          Portal updates, files, and approvals will be connected in a later phase.
        </p>
      </Card>
    </div>
  );
}

export default PortalPage;
