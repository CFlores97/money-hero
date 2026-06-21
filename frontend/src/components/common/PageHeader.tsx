import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-mh-dark">{title}</h1>
        <p className="mt-1 text-sm text-mh-dark/60">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
