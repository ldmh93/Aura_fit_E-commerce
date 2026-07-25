import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: `Aviso de privacidad de ${SITE.name}.`,
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Aviso de privacidad"
      intro={`${SITE.name} es responsable del tratamiento de los datos personales que nos proporcionas.`}
    >
      <InfoBlock title="Datos que recabamos">
        <p>
          Para procesar tu pedido recabamos únicamente tu nombre, número de
          WhatsApp y, cuando aplica, tu dirección de envío. No solicitamos datos
          bancarios a través del sitio.
        </p>
      </InfoBlock>

      <InfoBlock title="Uso de los datos">
        <p>
          Usamos tus datos exclusivamente para confirmar el pedido, coordinar el
          envío y darte seguimiento. No los vendemos ni los compartimos con
          terceros salvo la paquetería que realiza la entrega.
        </p>
      </InfoBlock>

      <InfoBlock title="Cookies y analítica">
        <p>
          Utilizamos Google Analytics y Meta Pixel para entender cómo se usa el
          sitio y mejorar la experiencia de compra. Puedes desactivar las
          cookies desde la configuración de tu navegador.
        </p>
      </InfoBlock>

      <InfoBlock title="Derechos ARCO">
        <p>
          Puedes solicitar el acceso, rectificación, cancelación u oposición al
          tratamiento de tus datos escribiéndonos por WhatsApp.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
