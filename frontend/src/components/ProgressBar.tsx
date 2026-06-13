interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  trackClass?: string;
  heightClass?: string;
}

export default function ProgressBar({
  value,
  max,
  colorClass = "bg-mh-gold",
  trackClass = "bg-mh-dark/10",
  heightClass = "h-3",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClass} ${heightClass}`}>
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
