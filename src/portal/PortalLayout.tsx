import type { ReactNode } from "react";

function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
        <span className="text-title font-bold tracking-[-0.06em] text-ink">
          TELOS<span className="text-primary">.</span>
        </span>
        <span className="text-label font-medium text-muted">Client portal</span>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}

export default PortalLayout;
