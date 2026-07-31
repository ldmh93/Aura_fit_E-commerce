"use client";

import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { sortSizes } from "@/lib/config";
import type { InventoryEntry, ProductColor, Size } from "@/types";

/**
 * Captura de existencias dentro del formulario del producto.
 *
 * Antes había que guardar el producto, salir a Inventario y volver. Aquí
 * aparece sola en cuanto hay tallas y colores marcados, con un campo por
 * combinación y un atajo para llenar todas de golpe.
 */
export function StockGrid({
  sizes,
  colors,
  inventory = [],
}: {
  sizes: Size[];
  colors: ProductColor[];
  /** Existencias actuales, al editar un producto. */
  inventory?: InventoryEntry[];
}) {
  const [todas, setTodas] = useState("");

  const actual = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const entry of inventory) {
      mapa.set(`${entry.size}__${entry.color}`, entry.quantity);
    }
    return mapa;
  }, [inventory]);

  const ordenadas = sortSizes(sizes);

  if (!ordenadas.length || !colors.length) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/12 px-4 py-5 text-xs leading-relaxed text-mist">
        <Boxes className="h-4 w-4 shrink-0" aria-hidden />
        Marca al menos una talla y un color y aquí aparecerán las casillas
        para capturar cuántas piezas tienes de cada combinación.
      </div>
    );
  }

  const total = ordenadas.length * colors.length;

  function llenarTodas(valor: string) {
    setTodas(valor);
    const n = Math.max(0, Math.floor(Number(valor) || 0));
    for (const size of ordenadas) {
      for (const color of colors) {
        const campo = document.querySelector<HTMLInputElement>(
          `input[name="stock__${CSS.escape(size)}__${CSS.escape(color.name)}"]`,
        );
        if (campo) campo.value = String(n);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="llenar-todas"
            className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-mist"
          >
            Llenar todas con
          </label>
          <div className="flex gap-2">
            <input
              id="llenar-todas"
              type="number"
              min={0}
              value={todas}
              onChange={(e) => setTodas(e.target.value)}
              placeholder="0"
              className="tabular w-24 rounded-xl border border-white/10 bg-steel px-3 py-2.5 text-sm text-white focus:border-aura/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => llenarTodas(todas)}
              className="rounded-xl border border-white/12 px-4 text-xs uppercase tracking-[0.12em] text-mist transition-colors hover:border-aura hover:text-aura"
            >
              Aplicar
            </button>
          </div>
        </div>

        <p className="pb-3 text-xs text-mist">
          {total} {total === 1 ? "combinación" : "combinaciones"}
        </p>
      </div>

      <div className="space-y-4">
        {ordenadas.map((size) => (
          <div key={size}>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-silver">
              Talla {size}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {colors.map((color) => {
                const key = `${size}__${color.name}`;
                return (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-steel/60 px-3 py-2"
                  >
                    <span
                      aria-hidden
                      className="h-4 w-4 shrink-0 rounded-full border border-white/25"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-mist">
                      {color.name}
                    </span>
                    <input
                      type="number"
                      name={`stock__${key}`}
                      min={0}
                      defaultValue={actual.get(key) ?? 0}
                      aria-label={`Piezas de talla ${size} color ${color.name}`}
                      className="tabular w-14 rounded-lg border border-white/10 bg-void px-2 py-1.5 text-center text-sm text-white focus:border-aura/60 focus:outline-none"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-mist">
        Puedes dejarlas en cero y ajustarlas después desde Inventario. Un
        producto sin piezas aparece como agotado en la tienda.
      </p>
    </div>
  );
}
