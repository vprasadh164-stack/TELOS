import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import InternalLink from "../components/ui/InternalLink";
import type { Navigate } from "../navigation";

type DetailPageProps = {
  entity: "lead" | "project";
  id: string;
  navigate: Navigate;
  title: string;
};

function DetailPage({ entity, id, navigate, title }: DetailPageProps) {
  const listHref = entity === "lead" ? "/leads" : "/projects";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <InternalLink
        className="text-label font-semibold text-primary no-underline hover:underline"
        href={listHref}
        navigate={navigate}
      >
        Back to {entity === "lead" ? "leads" : "projects"}
      </InternalLink>
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          {entity} details
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">{title}</h1>
      </div>
      <Card className="p-6">
        <Badge tone="primary">Starter view</Badge>
        <p className="mt-4 text-label leading-6 text-muted">
          The {entity} details for <span className="font-medium text-ink">{id}</span> will be added
          in a later step.
        </p>
      </Card>
    </div>
  );
}

export default DetailPage;
