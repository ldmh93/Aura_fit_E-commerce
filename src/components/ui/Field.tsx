import type {
  ComponentPropsWithoutRef,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/utils";

const control =
  "w-full rounded-xl border border-white/10 bg-steel px-4 py-3 text-sm text-white placeholder:text-mist/70 transition-colors focus:border-aura/60 focus:outline-none focus:ring-1 focus:ring-aura/40 disabled:opacity-50";

export function Label({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-mist",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea className={cn(control, "min-h-28 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(control, "appearance-none bg-steel pr-10", className)}
      {...props}
    >
      {children}
    </select>
  );
}
