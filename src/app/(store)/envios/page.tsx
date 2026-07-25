import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS } from "@/lib/config";
import { formatPrice } from "@/utils";

export const metadata: Metadata = {
  title: "Envíos y entregas",
  description:
    "Costos, tiempos y cobertura de envío de AURA FIT en toda la República Mexicana.",
  alternates: { canonical: "/envios" },
};

export default function EnviosPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Envíos y entregas"
      intro="Enviamos a toda la República Mexicana con paqueterías de cobertura nacional."
    >
      <InfoBlock title="Costo">
        <p>
          Envío estándar nacional: {formatPrice(BUSINESS.shippingCost)}. Envío
          gratis en pedidos superiores a{" "}
          {formatPrice(BUSINESS.freeShippingThreshold)}.
        </p>
        <p>
          Algunas zonas extendidas pueden tener un costo adicional. Si ese es tu
          caso te lo confirmamos por WhatsApp antes de procesar el pedido.
        </p>
      </InfoBlock>

      <InfoBlock title="Tiempo de entrega">
        <p>
          El tiempo estimado es de {BUSINESS.deliveryEstimate} una vez
          confirmado el pago. Los pedidos confirmados antes de las 14:00 h se
          preparan el mismo día.
        </p>
      </InfoBlock>

      <InfoBlock title="Seguimiento">
        <p>
          Cuando tu pedido sale a paquetería te enviamos el número de guía por
          WhatsApp. Desde ahí puedes rastrearlo en tiempo real.
        </p>
      </InfoBlock>

      <InfoBlock title="Pedidos pendientes">
        <p>
          Los pedidos sin confirmar por más de 48 horas se cancelan
          automáticamente y el inventario se libera. Si necesitas más tiempo,
          avísanos y lo apartamos.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
