import { promises as fs } from "node:fs";
import path from "node:path";
import { BUSINESS, SITE, WHATSAPP } from "@/lib/config";
import type { StoreSettings } from "@/types";

/**
 * Ajustes de la tienda editables desde /admin/ajustes.
 *
 * Mientras no haya Supabase se guardan en `.data/settings.json`.
 * Al conectar Supabase, esta es la única función que hay que cambiar:
 * la UI y el resto de la app no se enteran. Ver .claude/architecture.md
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: SITE.name,
  tagline: SITE.tagline,
  whatsappNumber: WHATSAPP.number,
  whatsappDisplay: WHATSAPP.display,
  meetingPointNote:
    "Las entregas se realizan únicamente en un punto de encuentro previamente acordado por WhatsApp.",
  supportHours: BUSINESS.supportHours,
  announcement: "Entrega en punto de encuentro · Pide por WhatsApp",
  announcementActive: true,
  lowStockThreshold: BUSINESS.lowStockThreshold,
  updated_at: new Date(0).toISOString(),
};

export async function getSettings(): Promise<StoreSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreSettings>;
    // Merge: si se agrega un ajuste nuevo, los guardados no se rompen.
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  input: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const current = await getSettings();
  const next: StoreSettings = {
    ...current,
    ...input,
    updated_at: new Date().toISOString(),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");

  return next;
}
