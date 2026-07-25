import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/config";
import { cn } from "@/utils";

/**
 * Wordmark tipográfico con acabado metálico.
 * Se usa donde el logotipo completo sería ilegible (navbar, admin).
 */
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <span className={cn("flex items-baseline gap-2 leading-none", className)}>
      <span
        className={cn(
          "text-metal font-semibold uppercase tracking-[0.22em]",
          scale,
        )}
      >
        Aura
      </span>
      <span
        className={cn(
          "text-aura font-light uppercase tracking-[0.42em]",
          size === "lg" ? "text-lg" : "text-[0.7em]",
        )}
      >
        Fit
      </span>
    </span>
  );
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — inicio`}
      className={cn("group inline-flex items-center", className)}
    >
      <Wordmark className="transition-opacity group-hover:opacity-80" />
    </Link>
  );
}

/** Logotipo completo (emblema + wordmark) tal como lo entregó la marca. */
export function LogoMark({
  className,
  size = 220,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={SITE.logo}
      alt={`${SITE.name} — ${SITE.tagline}`}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("h-auto w-full max-w-full select-none", className)}
    />
  );
}
