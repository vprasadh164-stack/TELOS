import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";

function Topbar() {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(now);
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6 lg:px-9">
      <div className="flex min-w-0 items-center gap-2 text-label text-muted">
        <Icon className="hidden size-4 sm:block" name="calendar" />
        <time dateTime={localDate}>{today}</time>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          aria-label="Search is planned for a later phase"
          className="hidden h-9 min-w-56 items-center gap-2 rounded-control border border-line bg-canvas px-3 text-left text-label text-muted sm:flex"
          disabled
          type="button"
        >
          <Icon className="size-4" name="search" />
          <span className="flex-1">Search your workspace</span>
          <span className="rounded border border-line bg-surface px-1.5 py-0.5 text-caption">
            ⌘ K
          </span>
        </button>
        <button
          aria-label="Notifications are planned for a later phase"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-canvas"
          disabled
          type="button"
        >
          <Icon className="size-[18px]" name="bell" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name="Alex Morgan" size="small" />
          <span className="hidden text-label font-medium text-ink lg:inline">Alex Morgan</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
