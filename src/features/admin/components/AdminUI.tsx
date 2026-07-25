import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
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
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}

const tones = {
  default: "text-white",
  aura: "text-aura",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

export function DashboardCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
  /** Variación porcentual contra el periodo anterior. */
  delta,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  delta?: number | null;
}) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;

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

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {showDelta ? (
          <span
            className={cn(
              "tabular inline-flex items-center gap-1 text-xs",
              positive ? "text-success" : "text-danger",
            )}
          >
            {positive ? (
              <TrendingUp className="h-3 w-3" aria-hidden />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden />
            )}
            {positive ? "+" : ""}
            {delta}%
          </span>
        ) : null}
        {hint ? <span className="text-xs text-mist">{hint}</span> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface overflow-hidden", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs text-mist">{description}</p>
            ) : null}
          </div>
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

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
      <p className="text-sm text-mist">{message}</p>
      {action}
    </div>
  );
}

/** Barra horizontal para rankings — más legible que un gráfico en tablas. */
export function MiniBar({
  value,
  max,
  tone = "aura",
}: {
  value: number;
  max: number;
  tone?: "aura" | "silver";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
      <div
        className={cn(
          "h-full rounded-full",
          tone === "aura" ? "bg-aura" : "bg-silver",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
