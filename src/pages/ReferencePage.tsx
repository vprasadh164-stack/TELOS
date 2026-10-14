import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

function ReferencePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.09em] text-muted">
          Design reference
        </p>
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">
          Reference screens
        </h1>
      </div>
      <Card className="p-6">
        <Badge>Reference not imported</Badge>
        <p className="mt-4 max-w-xl text-label leading-6 text-muted">
          This fresh repository contains no ProductExperience artwork to compare against. The Figma
          project remains untouched outside this folder, so no reference screens have been recreated
          here.
        </p>
      </Card>
    </div>
  );
}

export default ReferencePage;
