import type { ReactNode } from "react";

/** Plantilla para páginas de contenido: envíos, cambios, legales. */
export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-aura max-w-3xl py-16 md:py-24">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-white md:text-5xl">
        {title}
      </h1>
      {intro ? (
        <p className="mt-5 text-sm leading-relaxed text-mist md:text-base">
          {intro}
        </p>
      ) : null}
      <div className="hairline my-10" />
      <div className="space-y-8 text-sm leading-relaxed text-mist">
        {children}
      </div>
    </div>
  );
}

export function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-white">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
