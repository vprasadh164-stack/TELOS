type AvatarProps = {
  name: string;
  size?: "small" | "medium";
};

function Avatar({ name, size = "medium" }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-label={`${name} avatar`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary ${
        size === "small" ? "size-8 text-caption" : "size-9 text-label"
      }`}
      role="img"
    >
      {initials}
    </span>
  );
}

export default Avatar;
