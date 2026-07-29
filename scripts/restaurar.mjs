import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

/**
 * Restaura el catálogo desde un respaldo.
 *
 *   npm run restaurar                    usa el respaldo más reciente
 *   npm run restaurar -- <archivo.json>  usa uno concreto
 *
 * No borra nada: reinserta lo que falte y actualiza lo que exista, cruzando
 * por la columna única de cada tabla. Si un producto sigue ahí, se queda con
 * sus datos actualizados en vez de duplicarse.
 */

const ROOT = process.cwd();
const CARPETA = path.join(ROOT, "respaldos");

// Orden importante: las tablas hijas van después de sus padres.
const ORDEN = [
  { tabla: "categories", conflicto: "slug" },
  { tabla: "products", conflicto: "slug" },
  { tabla: "inventory", conflicto: "product_id,size,color" },
  { tabla: "coupons", conflicto: "code" },
  { tabla: "orders", conflicto: "order_number" },
  { tabla: "store_settings", conflicto: "id" },
];

function env() {
  const raw = readFileSync(path.join(ROOT, ".env.local"), "utf8");
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
}

const { NEXT_PUBLIC_SUPABASE_URL: URL_, SUPABASE_SERVICE_ROLE_KEY: KEY } = env();

const elegido = process.argv[2];
const copias = readdirSync(CARPETA).filter((f) => f.endsWith(".json")).sort();

if (!copias.length) {
  console.error("No hay respaldos en /respaldos. Ejecuta antes: npm run respaldo");
  process.exit(1);
}

const archivo = elegido ?? copias[copias.length - 1];
const datos = JSON.parse(readFileSync(path.join(CARPETA, archivo), "utf8"));

console.log(`Respaldo: ${archivo}`);
console.log(`Creado:   ${new Date(datos.creado).toLocaleString("es-MX")}\n`);
for (const { tabla } of ORDEN) {
  console.log(`  ${tabla}: ${datos.tablas[tabla]?.length ?? 0} filas`);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const respuesta = await rl.question("\n¿Restaurar estos datos? (escribe SI) ");
rl.close();

if (respuesta.trim().toUpperCase() !== "SI") {
  console.log("Cancelado. No se tocó nada.");
  process.exit(0);
}

for (const { tabla, conflicto } of ORDEN) {
  const filas = datos.tablas[tabla] ?? [];
  if (!filas.length) continue;

  // `stock` lo calcula un trigger desde el inventario: no se reinserta.
  const limpias =
    tabla === "products"
      ? filas.map(({ stock, ...resto }) => resto)
      : filas;

  const res = await fetch(
    `${URL_}/rest/v1/${tabla}?on_conflict=${conflicto}`,
    {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(limpias),
    },
  );

  console.log(
    res.ok
      ? `  ${tabla}: ${limpias.length} filas restauradas`
      : `  ${tabla}: FALLO ${res.status} ${(await res.text()).slice(0, 160)}`,
  );
}

console.log("\nListo. Revisa la tienda.");
