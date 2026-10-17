import type { ReactNode } from "react";
import type { Navigate } from "../navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: ReactNode;
  contactsLimit: number;
  contactsUsed: number;
  navigate: Navigate;
  onSignOut?: () => void;
  ownerName: string;
  pathname: string;
  previewMode?: boolean;
};

function AppShell({
  children,
  contactsLimit,
  contactsUsed,
  navigate,
  onSignOut,
  ownerName,
  pathname,
  previewMode = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink md:flex">
      <Sidebar
        contactsLimit={contactsLimit}
        contactsUsed={contactsUsed}
        navigate={navigate}
        ownerName={ownerName}
        pathname={pathname}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onSignOut={onSignOut} ownerName={ownerName} />
        {previewMode && (
          <aside
            aria-label="Demo preview notice"
            className="border-b border-warm/20 bg-warm-soft px-4 py-2 text-center text-caption text-warm sm:px-6"
          >
            Demo preview — sample data only. Changes are saved in this browser and are not private.
          </aside>
        )}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
