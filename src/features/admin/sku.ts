import { slugify } from "@/utils";

/**
 * Generación del SKU a partir del nombre y la categoría.
 *
 * Formato:  AF-M-CONJ-01
 *           │  │  │    └ consecutivo, evita repetidos
 *           │  │  └────── cuatro letras del nombre
 *           │  └───────── inicial de la categoría (Hombre / Mujer)
 *           └──────────── la marca
 *
 * Se lee de un vistazo y se dicta por teléfono sin confusiones. El
 * consecutivo lo asigna el servidor, que es el único que sabe qué códigos
 * ya existen.
 */

export const SKU_PREFIX = "AF";

/** Parte fija del código: todo menos el consecutivo. */
export function buildSkuBase(name: string, categoryName?: string): string {
  const limpio = (texto: string) =>
    slugify(texto).replace(/-/g, " ").trim().toUpperCase();

  const categoria = limpio(categoryName ?? "").charAt(0) || "X";

  // Palabras del nombre, sin las que no distinguen nada.
  const vacias = new Set(["DE", "DEL", "LA", "EL", "LOS", "LAS", "Y", "CON"]);
  const palabras = limpio(name)
    .split(/\s+/)
    .filter((p) => p && !vacias.has(p));

  // Cuatro letras: de la primera palabra, y si es corta se completa con la
  // siguiente. "Pants Oversize" -> PANT. "Top Short" -> TOPS.
  const letras = palabras.join("").slice(0, 4).padEnd(2, "X");

  return `${SKU_PREFIX}-${categoria}-${letras || "PROD"}`;
}

/**
 * Primer consecutivo libre para una base dada.
 * `usados` son los SKU que ya existen en el catálogo.
 */
export function nextSku(base: string, usados: string[]): string {
  const ocupados = new Set(
    usados
      .filter((sku) => sku.startsWith(`${base}-`))
      .map((sku) => Number(sku.slice(base.length + 1)))
      .filter((n) => Number.isFinite(n)),
  );

  let n = 1;
  while (ocupados.has(n)) n += 1;

  return `${base}-${String(n).padStart(2, "0")}`;
}
