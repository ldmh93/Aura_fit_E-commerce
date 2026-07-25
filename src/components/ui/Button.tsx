import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/utils";

type Variant = "primary" | "secondary" | "ghost" | "aura" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-silver text-void rounded-full hover:bg-white hover:shadow-[0_0_40px_-12px_rgba(94,168,255,0.7)] active:scale-[0.98]",
  aura: "bg-aura text-void rounded-full hover:brightness-110 hover:shadow-[0_0_40px_-10px_rgba(94,168,255,0.9)] active:scale-[0.98]",
  secondary:
    "border border-white/15 text-white rounded-full hover:border-aura/60 hover:text-aura hover:bg-aura/5 active:scale-[0.98]",
  ghost: "text-mist rounded-full hover:text-white hover:bg-white/5",
  danger:
    "border border-danger/40 text-danger rounded-full hover:bg-danger/10 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs uppercase tracking-[0.14em]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-9 text-sm uppercase tracking-[0.16em]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const isExternal = href.startsWith("http") || href.startsWith("mailto");

  if (isExternal) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
