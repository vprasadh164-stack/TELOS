import Button from "../components/ui/Button";
import type { Navigate } from "../navigation";

function NotFoundPage({ navigate }: { navigate: Navigate }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-caption font-semibold uppercase tracking-[0.09em] text-muted">404</p>
      <h1 className="mt-2 text-page-title font-semibold text-ink">This page isn&apos;t here.</h1>
      <p className="mt-2 text-label text-muted">Check the address or return to your dashboard.</p>
      <Button className="mt-5" onClick={() => navigate("/")}>
        Go to dashboard
      </Button>
    </div>
  );
}

export default NotFoundPage;
