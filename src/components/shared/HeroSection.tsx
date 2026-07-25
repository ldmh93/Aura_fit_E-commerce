"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { LogoMark } from "@/components/shared/Logo";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { DELIVERY, SITE } from "@/lib/config";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, delay, ease },
  });

  return (
    <section className="relative flex min-h-[78svh] items-center overflow-hidden md:min-h-[82vh]">
      <div className="aura-glow left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_80%)]"
      />

      <div className="container-aura relative z-10 py-14 text-center md:py-20">
        <motion.div {...rise(0)} className="mx-auto w-44 md:w-56">
          <LogoMark size={224} priority />
        </motion.div>

        <motion.p {...rise(0.1)} className="eyebrow mt-1">
          {SITE.tagline}
        </motion.p>

        <motion.h1
          {...rise(0.18)}
          className="mx-auto mt-6 max-w-3xl text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-white md:text-6xl"
        >
          Eleva tu rendimiento.
          <br />
          <span className="text-metal">Supera tus límites.</span>
        </motion.h1>

        <motion.p
          {...rise(0.26)}
          className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-mist md:text-base"
        >
          Selección corta y cuidada de ropa deportiva. Pides por WhatsApp y te
          la entregamos en un punto de encuentro.
        </motion.p>

        <motion.div
          {...rise(0.34)}
          className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <LinkButton href="/shop" variant="primary" size="lg">
            Ver productos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
          <LinkButton
            href={generalWhatsappUrl()}
            variant="secondary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Escríbenos
          </LinkButton>
        </motion.div>

        <motion.p
          {...rise(0.42)}
          className="mt-8 text-xs text-mist"
        >
          {DELIVERY.short} · Sin envíos a domicilio
        </motion.p>
      </div>
    </section>
  );
}
