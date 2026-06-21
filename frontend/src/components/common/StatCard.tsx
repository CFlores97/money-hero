import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  accentClass?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  hint,
  accentClass = "bg-mh-green/10 text-mh-green",
}: StatCardProps) {
  return (
    <div className="rounded-3xl border-2 border-mh-dark/5 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl p-3 ${accentClass}`}>{icon}</div>
      <p className="mt-4 text-sm font-semibold text-mh-dark/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-mh-dark">{value}</p>
      {hint ? <p className="mt-2 text-xs font-semibold text-mh-dark/45">{hint}</p> : null}
    </div>
  );
}
