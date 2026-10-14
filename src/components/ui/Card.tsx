import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-panel border border-line bg-surface shadow-panel ${className}`}
      {...props}
    />
  );
}

export default Card;
