import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description:
    "Política de cambios y devoluciones de AURA FIT: 30 días, cambio de talla sin costo.",
  alternates: { canonical: "/cambios" },
};

export default function CambiosPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Cambios y devoluciones"
      intro={`Tienes ${BUSINESS.returnWindowDays} días naturales desde la entrega para solicitar un cambio o devolución.`}
    >
      <InfoBlock title="Condiciones">
        <p>
          La prenda debe estar sin uso, con todas sus etiquetas y en su empaque
          original. No aceptamos prendas lavadas, modificadas o con olor a
          perfume o desodorante.
        </p>
      </InfoBlock>

      <InfoBlock title="Cambio de talla">
        <p>
          El primer cambio de talla por pedido es sin costo. Solo escríbenos por
          WhatsApp con tu número de pedido y te enviamos la guía de retorno.
        </p>
      </InfoBlock>

      <InfoBlock title="Excepciones">
        <p>
          No se aceptan cambios en productos de la colección LIMITED EDITION ni
          en artículos comprados con un descuento mayor al 30%.
        </p>
      </InfoBlock>

      <InfoBlock title="Reembolsos">
        <p>
          El reembolso se realiza por el mismo medio de pago en un plazo de 5 a
          10 días hábiles a partir de que recibimos la prenda y verificamos su
          estado.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
