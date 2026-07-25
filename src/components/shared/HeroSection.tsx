"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { LogoMark } from "@/components/shared/Logo";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { SITE } from "@/lib/config";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden md:min-h-[92vh]">
      {/* Iluminación de fondo */}
      <div className="aura-glow left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2" />
      <div className="aura-glow -left-40 bottom-0 h-96 w-96" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050505_78%)]"
      />

      <div className="container-aura relative z-10 py-16 text-center md:py-24">
        <motion.div
          {...rise(0)}
          className="mx-auto w-52 md:w-64 lg:w-72"
        >
          <LogoMark size={288} priority />
        </motion.div>

        <motion.p
          {...rise(0.12)}
          className="eyebrow mt-2 flex items-center justify-center gap-2"
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          {SITE.tagline}
        </motion.p>

        <motion.h1
          {...rise(0.2)}
          className="mx-auto mt-6 max-w-4xl text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Eleva tu rendimiento.
          <br />
          <span className="text-metal">Supera tus límites.</span>
        </motion.h1>

        <motion.p
          {...rise(0.3)}
          className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-mist md:text-base"
        >
          Ingeniería textil de alto rendimiento para quienes entrenan en serio.
          Cada prenda AURA FIT está construida para moverse contigo, no contra
          ti.
        </motion.p>

        <motion.div
          {...rise(0.4)}
          className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-11 sm:w-auto sm:flex-row sm:items-center"
        >
          <LinkButton href="/shop" variant="primary" size="lg">
            Comprar colección
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
          <LinkButton
            href="/colecciones/limited-edition"
            variant="secondary"
            size="lg"
          >
            Nuevos lanzamientos
          </LinkButton>
          <LinkButton
            href={generalWhatsappUrl()}
            variant="ghost"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </LinkButton>
        </motion.div>

        <motion.div
          {...rise(0.55)}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/8 pt-8 sm:gap-6 md:mt-20"
        >
          {[
            { value: "4-Way", label: "Elasticidad" },
            { value: "Dry-Aura", label: "Secado rápido" },
            { value: "48 h", label: "Envío nacional" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-metal text-lg font-semibold tracking-tight md:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-mist">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
