import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
};

function Button({ className = "", type = "button", variant = "primary", ...props }: ButtonProps) {
  const variantClass = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "border border-line bg-surface text-ink hover:bg-canvas",
    quiet: "text-muted hover:bg-canvas hover:text-ink",
  }[variant];

  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-control px-3 text-label font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      type={type}
      {...props}
    />
  );
}

export default Button;
