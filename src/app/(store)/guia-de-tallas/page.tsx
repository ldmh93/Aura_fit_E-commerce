import type { Metadata } from "next";
import { InfoBlock, InfoPage } from "@/components/shared/InfoPage";
import { SIZE_GUIDES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Tabla de medidas AURA FIT en centímetros para parte superior e inferior.",
  alternates: { canonical: "/guia-de-tallas" },
};

export default function GuiaDeTallasPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Guía de tallas"
      intro="Todas las medidas están en centímetros y corresponden al cuerpo, no a la prenda."
    >
      {Object.values(SIZE_GUIDES).map((guide) => (
        <InfoBlock key={guide.label} title={guide.label}>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-md text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-graphite/60">
                  {guide.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-aura"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-white/5">
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={
                          index === 0
                            ? "px-4 py-3 font-medium text-white"
                            : "tabular px-4 py-3 text-mist"
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoBlock>
      ))}

      <InfoBlock title="¿Estás entre dos tallas?">
        <p>
          Elige la talla mayor si buscas un ajuste relajado y la menor si buscas
          compresión. Las prendas de la línea AURA PERFORMANCE están diseñadas
          para quedar ceñidas.
        </p>
      </InfoBlock>
    </InfoPage>
  );
}
