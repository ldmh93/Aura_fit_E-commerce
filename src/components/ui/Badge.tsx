import type { ReactNode } from "react";
import { cn } from "@/utils";

type Tone = "aura" | "silver" | "success" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  aura: "bg-aura/12 text-aura border-aura/30",
  silver: "bg-silver/10 text-silver border-silver/25",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  muted: "bg-white/5 text-mist border-white/10",
};

export function Badge({
  tone = "aura",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
