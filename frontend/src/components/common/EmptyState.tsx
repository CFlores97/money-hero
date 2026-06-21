import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-mh-dark/10 bg-white/70 px-6 py-10 text-center">
      <h3 className="font-display text-xl font-extrabold text-mh-dark">{title}</h3>
      <p className="mt-2 text-sm text-mh-dark/55">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
