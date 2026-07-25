import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS, WHATSAPP } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cambios",
  description:
    "Política de cambios de AURA FIT: 7 días para cambiar la talla, sin costo, en el punto de encuentro.",
  alternates: { canonical: "/cambios" },
};

export default function CambiosPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Cambios"
      intro={`Tienes ${BUSINESS.changeWindowDays} días desde la entrega para solicitar un cambio de talla.`}
    >
      <InfoBlock title="Condiciones">
        <p>
          La prenda debe estar sin uso, con sus etiquetas y en las mismas
          condiciones en que se entregó. No aceptamos prendas lavadas o
          modificadas.
        </p>
      </InfoBlock>

      <InfoBlock title="Cómo se hace el cambio">
        <p>
          Escríbenos al {WHATSAPP.display} con tu número de pedido y la talla
          que necesitas. Si hay existencia, acordamos un nuevo punto de
          encuentro para intercambiar la prenda. Sin costo, una vez por pedido.
        </p>
      </InfoBlock>

      <InfoBlock title="Devoluciones">
        <p>
          Si la prenda tiene un defecto de fabricación, la reponemos o
          devolvemos el importe completo. Para devoluciones por decisión propia,
          escríbenos y lo vemos caso por caso.
        </p>
      </InfoBlock>

      <InfoBlock title="Excepciones">
        <p>
          No se aceptan cambios en artículos comprados con un descuento mayor al
          30%.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
