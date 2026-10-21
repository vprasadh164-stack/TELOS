import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          Workspace
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">Pricing</h1>
        <p className="mt-2 max-w-xl text-label leading-6 text-muted">
          Plan details will be published here when TELOS billing is ready.
        </p>
      </div>
      <Card className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
        <Badge tone="primary">Coming soon</Badge>
        <h2 className="mt-4 text-title font-semibold text-ink">Pricing is being prepared.</h2>
        <p className="mt-2 max-w-md text-label leading-6 text-muted">
          Subscriptions and payments are not enabled yet. No plan prices or charges are active.
        </p>
      </Card>
    </div>
  );
}

export default PricingPage;
