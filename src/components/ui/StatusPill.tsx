type StatusPillProps = {
  status: "Due today" | "In progress" | "On track" | "Tomorrow";
};

function StatusPill({ status }: StatusPillProps) {
  const tone = status === "Tomorrow" ? "warm" : "success";
  const toneClass = tone === "warm" ? "bg-warm-soft text-warm" : "bg-success-soft text-success";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium ${toneClass}`}
    >
      {status}
    </span>
  );
}

export default StatusPill;
