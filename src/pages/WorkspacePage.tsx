import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

type WorkspacePageProps = {
  description: string;
  title: string;
};

function WorkspacePage({ description, title }: WorkspacePageProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          Workspace
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">{title}</h1>
        <p className="mt-2 max-w-xl text-label leading-6 text-muted">{description}</p>
      </div>
      <Card className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
        <Badge tone="primary">Starter view</Badge>
        <h2 className="mt-4 text-title font-semibold text-ink">This space is ready to shape.</h2>
        <p className="mt-2 max-w-md text-label leading-6 text-muted">
          The working details for {title.toLowerCase()} will be added in a later step. For now, this
          page keeps the main navigation connected without assuming a design that is not in the
          source material.
        </p>
      </Card>
    </div>
  );
}

export default WorkspacePage;
