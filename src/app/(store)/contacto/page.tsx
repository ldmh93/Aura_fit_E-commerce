import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { LinkButton } from "@/components/ui/Button";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp. Atendemos pedidos, dudas de talla y seguimiento de envíos.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <InfoPage
      eyebrow="Atención a clientes"
      title="Contacto"
      intro="Atendemos por WhatsApp. Es el canal más rápido para resolver dudas de talla, disponibilidad o seguimiento de tu pedido."
    >
      <InfoBlock title="Horario">
        <p>{BUSINESS.supportHours}</p>
        <p>Respondemos en menos de 2 horas dentro del horario de atención.</p>
      </InfoBlock>

      <InfoBlock title="Escríbenos">
        <div className="pt-1">
          <LinkButton
            href={generalWhatsappUrl()}
            variant="aura"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </LinkButton>
        </div>
      </InfoBlock>

      <InfoBlock title="Mayoreo y equipos">
        <p>
          Si representas un gimnasio, box o equipo deportivo y buscas pedidos por
          volumen, escríbenos con el detalle de tallas y cantidades para armar
          una cotización.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
