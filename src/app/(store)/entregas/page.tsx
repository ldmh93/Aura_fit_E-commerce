import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS, DELIVERY, WHATSAPP } from "@/lib/config";

export const metadata: Metadata = {
  title: "Entregas",
  description:
    "AURA FIT entrega en punto de encuentro acordado por WhatsApp. No manejamos envíos a domicilio ni paqueterías.",
  alternates: { canonical: "/entregas" },
};

export default function EntregasPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Entregas"
      intro={DELIVERY.description}
    >
      <InfoBlock title="Cómo se acuerda">
        <p>
          Una vez que confirmamos tu pedido por WhatsApp, definimos juntos el
          día, la hora y el lugar. Buscamos un punto que le quede bien a ambos.
        </p>
        <p>
          No hay costo adicional por la entrega: el precio que ves es el precio
          final.
        </p>
      </InfoBlock>

      <InfoBlock title="No manejamos envíos">
        <p>
          No enviamos a domicilio ni trabajamos con paqueterías. Toda entrega es
          en persona, en el punto de encuentro acordado.
        </p>
      </InfoBlock>

      <InfoBlock title="Si no puedes asistir">
        <p>
          Avísanos con tiempo por WhatsApp y reprogramamos sin problema. Los
          pedidos confirmados se apartan del inventario durante 48 horas; pasado
          ese plazo sin respuesta, se liberan.
        </p>
      </InfoBlock>

      <InfoBlock title="Al momento de la entrega">
        <p>
          Puedes revisar la prenda antes de pagar. Si algo no está bien, no hay
          problema: lo resolvemos ahí mismo.
        </p>
        <p>
          Si después necesitas cambiar la talla, tienes{" "}
          {BUSINESS.changeWindowDays} días. Escríbenos al {WHATSAPP.display}.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
