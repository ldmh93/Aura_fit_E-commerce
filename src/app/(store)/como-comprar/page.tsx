import type { Metadata } from "next";
import { MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { BUSINESS, DELIVERY, WHATSAPP } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description:
    "Comprar en AURA FIT es simple: eliges tus prendas, envías el pedido por WhatsApp y acordamos un punto de encuentro para la entrega.",
  alternates: { canonical: "/como-comprar" },
};

const steps = [
  {
    icon: ShoppingBag,
    title: "Arma tu pedido",
    text: "Elige talla y color. El sistema solo te deja seleccionar lo que hay en existencia, así que no vas a pedir algo que no tenemos.",
  },
  {
    icon: MessageCircle,
    title: "Envíalo por WhatsApp",
    text: "Al terminar se abre WhatsApp con tu pedido ya escrito. Confirmamos disponibilidad, total y forma de pago.",
  },
  {
    icon: MapPin,
    title: "Nos vemos en el punto acordado",
    text: "Acordamos contigo día, hora y lugar. Sin envíos, sin paqueterías, sin costos extra por entrega.",
  },
];

export default function ComoComprarPage() {
  return (
    <div className="container-aura max-w-4xl py-16 md:py-20">
      <p className="eyebrow mb-3">Proceso de compra</p>
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-white md:text-5xl">
        Cómo comprar
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist md:text-base">
        Sin cuentas, sin formularios largos y sin pasarelas de pago. Tres pasos.
      </p>

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="surface p-6">
            <div className="flex items-center justify-between">
              <step.icon className="h-5 w-5 text-aura" aria-hidden />
              <span className="text-metal tabular text-2xl font-semibold">
                {index + 1}
              </span>
            </div>
            <h2 className="mt-5 text-sm font-medium uppercase tracking-[0.12em] text-white">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              {step.text}
            </p>
          </li>
        ))}
      </ol>

      <div className="hairline my-14" />

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-white">
            Entrega
          </h2>
          <p className="text-sm leading-relaxed text-mist">
            {DELIVERY.description}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            El punto de encuentro se define contigo según lo que a ambos nos
            quede bien. No hay costo adicional por la entrega.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-white">
            Pago
          </h2>
          <p className="text-sm leading-relaxed text-mist">
            Efectivo en el punto de encuentro o transferencia previa. Lo
            acordamos por WhatsApp antes de vernos.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Si la talla no queda, la cambiamos dentro de{" "}
            {BUSINESS.changeWindowDays} días.
          </p>
        </section>
      </div>

      <div className="surface mt-14 p-7 text-center">
        <h2 className="text-lg font-semibold uppercase tracking-tight text-white">
          ¿Listo para pedir?
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist">
          Escríbenos al {WHATSAPP.display}. Atendemos {BUSINESS.supportHours}.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/shop" variant="primary" size="lg">
            Ver productos
          </LinkButton>
          <LinkButton
            href={generalWhatsappUrl()}
            variant="secondary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
