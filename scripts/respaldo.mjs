import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

/**
 * Respaldo del catálogo.
 *
 * El plan gratuito de Supabase no hace respaldos automáticos, así que esto
 * los cubre: descarga todas las tablas a un archivo JSON con fecha.
 *
 *   npm run respaldo            guarda una copia
 *   npm run respaldo -- --ver   lista las copias que existen
 *
 * Para restaurar:  npm run restaurar
 */

const ROOT = process.cwd();
const CARPETA = path.join(ROOT, "respaldos");
const CONSERVAR = 20;

const TABLAS = [
  "categories",
  "products",
  "inventory",
  "orders",
  "coupons",
  "store_settings",
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

if (!URL_ || !KEY) {
  console.error("Faltan las credenciales de Supabase en .env.local");
  process.exit(1);
}

async function leer(tabla) {
  const res = await fetch(`${URL_}/rest/v1/${tabla}?select=*`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${tabla}: ${res.status} ${await res.text()}`);
  return res.json();
}

/* ── Listar ──────────────────────────────────────────────────── */

if (process.argv.includes("--ver")) {
  mkdirSync(CARPETA, { recursive: true });
  const copias = readdirSync(CARPETA).filter((f) => f.endsWith(".json")).sort().reverse();

  if (!copias.length) {
    console.log("Todavía no hay respaldos. Ejecuta: npm run respaldo");
    process.exit(0);
  }

  console.log(`${copias.length} respaldos en /respaldos:\n`);
  for (const f of copias) {
    const datos = JSON.parse(readFileSync(path.join(CARPETA, f), "utf8"));
    const resumen = TABLAS.map((t) => `${t}: ${datos.tablas[t]?.length ?? 0}`).join("  ");
    console.log(`  ${f}`);
    console.log(`    ${resumen}`);
  }
  process.exit(0);
}

/* ── Respaldar ───────────────────────────────────────────────── */

mkdirSync(CARPETA, { recursive: true });

const tablas = {};
for (const t of TABLAS) {
  tablas[t] = await leer(t);
  console.log(`  ${t}: ${tablas[t].length} filas`);
}

const sello = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .slice(0, 19);

const archivo = path.join(CARPETA, `respaldo-${sello}.json`);
writeFileSync(
  archivo,
  JSON.stringify({ creado: new Date().toISOString(), tablas }, null, 2),
  "utf8",
);

const kb = (readFileSync(archivo).length / 1024).toFixed(0);
console.log(`\nGuardado: respaldos/respaldo-${sello}.json  (${kb} KB)`);

// Deja solo las copias más recientes para que la carpeta no crezca sin fin.
const copias = readdirSync(CARPETA).filter((f) => f.endsWith(".json")).sort();
for (const viejo of copias.slice(0, Math.max(0, copias.length - CONSERVAR))) {
  unlinkSync(path.join(CARPETA, viejo));
  console.log(`Eliminado respaldo antiguo: ${viejo}`);
}
