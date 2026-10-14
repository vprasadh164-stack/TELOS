type ProgressBarProps = {
  label: string;
  value: number;
  valueLabel?: string;
};

function ProgressBar({ label, value, valueLabel }: ProgressBarProps) {
  const boundedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={boundedValue}
      className="h-2 overflow-hidden rounded-full bg-primary-soft"
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${boundedValue}%` }}
      >
        <span className="sr-only">{valueLabel ?? `${boundedValue}%`}</span>
      </div>
    </div>
  );
}

export default ProgressBar;
