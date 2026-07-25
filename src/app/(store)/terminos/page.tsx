import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { BUSINESS, DELIVERY, SITE } from "@/lib/config";

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
          Todos los precios están en pesos mexicanos (MXN) e incluyen IVA. No se
          cobra ningún costo adicional por la entrega. Los precios pueden
          cambiar sin previo aviso, pero se respeta el confirmado al momento de
          tu pedido.
        </p>
      </InfoBlock>

      <InfoBlock title="Entrega">
        <p>{DELIVERY.description}</p>
        <p>
          El punto y el horario se acuerdan por WhatsApp. Los pedidos
          confirmados se apartan durante 48 horas; pasado ese plazo sin
          respuesta, el inventario se libera.
        </p>
      </InfoBlock>

      <InfoBlock title="Disponibilidad">
        <p>
          El inventario mostrado es el real, pero puede haber diferencias si dos
          personas piden la misma pieza al mismo tiempo. Confirmamos
          disponibilidad por WhatsApp antes de cerrar la venta.
        </p>
      </InfoBlock>

      <InfoBlock title="Cupones">
        <p>
          Los cupones no son acumulables. Solo se aplica un código por pedido y
          el descuento máximo es de {BUSINESS.maxCouponDiscount}%. Los códigos
          vencidos o inactivos se rechazan automáticamente.
        </p>
      </InfoBlock>

      <InfoBlock title="Cambios">
        <p>
          Cambio de talla sin costo dentro de {BUSINESS.changeWindowDays} días,
          una vez por pedido, siempre que la prenda esté sin uso y con
          etiquetas.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
