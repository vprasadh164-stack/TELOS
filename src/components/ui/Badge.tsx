import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warm";
};

function Badge({ children, tone = "neutral" }: BadgeProps) {
  const toneClass = {
    neutral: "bg-canvas text-muted",
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warm: "bg-warm-soft text-warm",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default Badge;
