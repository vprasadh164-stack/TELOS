import Avatar from "../components/ui/Avatar";
import Icon, { type IconName } from "../components/ui/Icon";
import InternalLink from "../components/ui/InternalLink";
import ProgressBar from "../components/ui/ProgressBar";
import type { Navigate } from "../navigation";

const navItems: { href: string; icon: IconName; label: string }[] = [
  { href: "/", icon: "grid", label: "Dashboard" },
  { href: "/leads", icon: "users", label: "Leads" },
  { href: "/clients", icon: "users", label: "Clients" },
  { href: "/projects", icon: "briefcase", label: "Projects" },
  { href: "/automations", icon: "sparkles", label: "Automations" },
  { href: "/messages", icon: "message", label: "Messages" },
  { href: "/reports", icon: "chart", label: "Reports" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

type SidebarProps = {
  contactsLimit: number;
  contactsUsed: number;
  navigate: Navigate;
  ownerName: string;
  pathname: string;
};

function Sidebar({ contactsLimit, contactsUsed, navigate, ownerName, pathname }: SidebarProps) {
  const contactsProgress = Math.min((contactsUsed / contactsLimit) * 100, 100);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-surface px-4 py-4 md:min-h-screen md:w-60 md:border-r md:border-b-0 md:px-4 md:py-6">
      <div className="flex items-center justify-between md:px-2">
        <InternalLink
          aria-label="TELOS dashboard"
          className="text-title font-bold tracking-[-0.06em] text-ink no-underline"
          href="/"
          navigate={navigate}
        >
          TELOS<span className="text-primary">.</span>
        </InternalLink>
        <span className="hidden text-caption font-medium text-muted md:inline">WORKSPACE</span>
      </div>

      <nav
        aria-label="Main navigation"
        className="mt-4 flex gap-1 overflow-x-auto pb-1 md:mt-9 md:flex-col md:overflow-visible md:pb-0"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <InternalLink
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 shrink-0 items-center gap-3 rounded-control px-3 text-label font-medium no-underline transition-colors md:w-full ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
              href={item.href}
              key={item.href}
              navigate={navigate}
            >
              <Icon className="size-[18px]" name={item.icon} />
              <span>{item.label}</span>
            </InternalLink>
          );
        })}
      </nav>

      <div className="mt-5 hidden rounded-panel border border-line bg-canvas p-3 md:mt-auto md:block">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-caption font-semibold text-ink">Monthly contacts</span>
          <span className="text-caption text-muted">
            {contactsUsed.toLocaleString()} / {contactsLimit.toLocaleString()}
          </span>
        </div>
        <ProgressBar label="Monthly contacts used" value={contactsProgress} />
        <button
          className="mt-3 text-caption font-semibold text-primary hover:underline"
          disabled
          title="Plan upgrades will be available later"
          type="button"
        >
          Upgrade plan
        </button>
      </div>

      <div className="mt-4 hidden items-center gap-3 border-t border-line px-2 pt-4 md:flex">
        <Avatar name={ownerName} size="small" />
        <div className="min-w-0">
          <p className="truncate text-label font-semibold text-ink">{ownerName}</p>
          <p className="text-caption text-muted">Workspace owner</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
