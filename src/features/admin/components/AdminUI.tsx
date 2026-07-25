import type { ReactNode } from "react";
import { cn } from "@/utils";

export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-mist">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function DashboardCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "aura" | "warning" | "danger" | "success";
  icon?: ReactNode;
}) {
  const tones = {
    default: "text-white",
    aura: "text-aura",
    warning: "text-warning",
    danger: "text-danger",
    success: "text-success",
  };

  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-mist">
          {label}
        </p>
        {icon ? <span className="text-mist">{icon}</span> : null}
      </div>
      <p className={cn("tabular mt-3 text-2xl font-semibold", tones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-mist">{hint}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface overflow-hidden", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-white">
            {title}
          </h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.16em] text-mist"
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 align-middle text-sm", className)}>
      {children}
    </td>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-16 text-center text-sm text-mist">{message}</div>
  );
}
