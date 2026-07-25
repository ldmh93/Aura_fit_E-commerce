import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Términos y condiciones de compra en ${SITE.name}.`,
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Términos y condiciones"
      intro="Al realizar un pedido en este sitio aceptas los siguientes términos."
    >
      <InfoBlock title="Precios">
        <p>
          Todos los precios están expresados en pesos mexicanos (MXN) e incluyen
          IVA. Los precios pueden cambiar sin previo aviso, pero el precio
          confirmado al momento de tu pedido es el que se respeta.
        </p>
      </InfoBlock>

      <InfoBlock title="Disponibilidad">
        <p>
          El inventario mostrado es en tiempo real, pero puede haber diferencias
          si dos personas compran la misma pieza al mismo tiempo. Confirmamos
          disponibilidad por WhatsApp antes de procesar el pago.
        </p>
      </InfoBlock>

      <InfoBlock title="Cupones">
        <p>
          Los cupones no son acumulables. Solo se puede aplicar un código por
          pedido y el descuento máximo es de {BUSINESS.maxCouponDiscount}%. Los
          códigos vencidos o inactivos se rechazan automáticamente.
        </p>
      </InfoBlock>

      <InfoBlock title="Proceso de compra">
        <p>
          El pedido se envía por WhatsApp y queda en estado pendiente hasta que
          confirmamos disponibilidad y recibimos el pago. Los pedidos sin
          respuesta por más de 48 horas se cancelan y el inventario se libera.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
