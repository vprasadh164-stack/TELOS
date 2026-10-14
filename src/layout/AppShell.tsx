import type { ReactNode } from "react";
import type { Navigate } from "../navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: ReactNode;
  navigate: Navigate;
  pathname: string;
};

function AppShell({ children, navigate, pathname }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink md:flex">
      <Sidebar navigate={navigate} pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
