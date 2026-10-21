export type IconName =
  | "arrow-right"
  | "bell"
  | "briefcase"
  | "calendar"
  | "chart"
  | "check"
  | "clock"
  | "grid"
  | "message"
  | "plus"
  | "search"
  | "settings"
  | "sparkles"
  | "tag"
  | "users";

const iconPaths: Record<IconName, string> = {
  "arrow-right": "M5 12h14m-7-7 7 7-7 7",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4",
  briefcase: "M3 7h18v13H3zM8 7V4h8v3M3 12h18m-11 0v2h4v-2",
  calendar: "M4 5h16v16H4zM8 3v4m8-4v4M4 10h16",
  chart: "M4 19V5m0 14h16M8 15l3-4 3 2 5-7",
  check: "m5 12 4 4L19 6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m0-16v6l4 2",
  grid: "M3 3h8v8H3zm10 0h8v5h-8zm0 7h8v11h-8zM3 13h8v8H3z",
  message: "M4 5h16v12H9l-5 4zM8 9h8m-8 4h5",
  plus: "M12 5v14m-7-7h14",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64",
  sparkles:
    "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z",
  tag: "M20 12 12 20 3 11V4h7l10 8zm-12-5h.01",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m7-7a4 4 0 0 1 0 8m3 4a4 4 0 0 1 2 3v2",
};

type IconProps = {
  className?: string;
  name: IconName;
};

function Icon({ className = "size-4", name }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default Icon;
