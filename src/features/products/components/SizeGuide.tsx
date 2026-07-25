"use client";

import { useState } from "react";
import { Ruler, X } from "lucide-react";
import { SIZE_GUIDES } from "@/lib/config";

/** Guía de medidas en centímetros. Ver .claude/business-rules.md */
export function SizeGuide({
  type = "superior",
}: {
  type?: keyof typeof SIZE_GUIDES;
}) {
  const [open, setOpen] = useState(false);
  const guide = SIZE_GUIDES[type];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-mist underline-offset-4 transition-colors hover:text-aura hover:underline"
      >
        <Ruler className="h-3.5 w-3.5" />
        Tabla de medidas
      </button>

      {open ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Tabla de medidas"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-graphite"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <p className="eyebrow">{guide.label}</p>
                <h2 className="mt-1 text-sm font-medium text-white">
                  Tabla de medidas (cm)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-mist hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto px-6 py-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {guide.columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-aura"
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
                              ? "py-3 font-medium text-white"
                              : "tabular py-3 text-mist"
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-5 text-xs leading-relaxed text-mist">
                Medidas del cuerpo, no de la prenda. Si estás entre dos tallas,
                recomendamos la mayor para un ajuste relajado y la menor para un
                ajuste de compresión.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
