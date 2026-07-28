import { adminDb, publicDb } from "@/services/db";
import { BUSINESS, SITE, WHATSAPP } from "@/lib/config";
import type { StoreSettings } from "@/types";

/**
 * Ajustes de la tienda, editables desde /admin/ajustes.
 * Viven en la tabla `store_settings`, que tiene una sola fila (id = 1).
 */

const ROW_ID = 1;

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

/** La tabla usa snake_case; el resto de la app, camelCase. */
interface Row {
  store_name: string;
  tagline: string;
  whatsapp_number: string;
  whatsapp_display: string;
  meeting_point_note: string;
  support_hours: string;
  announcement: string;
  announcement_active: boolean;
  low_stock_threshold: number;
  updated_at: string;
}

function fromRow(row: Row): StoreSettings {
  return {
    storeName: row.store_name || DEFAULT_SETTINGS.storeName,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    whatsappNumber: row.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
    whatsappDisplay: row.whatsapp_display || DEFAULT_SETTINGS.whatsappDisplay,
    meetingPointNote:
      row.meeting_point_note || DEFAULT_SETTINGS.meetingPointNote,
    supportHours: row.support_hours || DEFAULT_SETTINGS.supportHours,
    announcement: row.announcement,
    announcementActive: row.announcement_active,
    lowStockThreshold: row.low_stock_threshold,
    updated_at: row.updated_at,
  };
}

const SELECT =
  "store_name,tagline,whatsapp_number,whatsapp_display,meeting_point_note,support_hours,announcement,announcement_active,low_stock_threshold,updated_at";

/**
 * Nunca revienta: si la base no responde, la tienda sigue de pie con los
 * valores por defecto. Son textos de presentación, no datos críticos.
 */
export async function getSettings(): Promise<StoreSettings> {
  try {
    const db = await publicDb();
    const { data } = await db
      .from("store_settings")
      .select(SELECT)
      .eq("id", ROW_ID)
      .maybeSingle();

    return data ? fromRow(data as Row) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  input: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const db = adminDb();

  const payload: Partial<Row> = { updated_at: new Date().toISOString() };

  if (input.storeName !== undefined) payload.store_name = input.storeName;
  if (input.tagline !== undefined) payload.tagline = input.tagline;
  if (input.whatsappNumber !== undefined)
    payload.whatsapp_number = input.whatsappNumber;
  if (input.whatsappDisplay !== undefined)
    payload.whatsapp_display = input.whatsappDisplay;
  if (input.meetingPointNote !== undefined)
    payload.meeting_point_note = input.meetingPointNote;
  if (input.supportHours !== undefined)
    payload.support_hours = input.supportHours;
  if (input.announcement !== undefined) payload.announcement = input.announcement;
  if (input.announcementActive !== undefined)
    payload.announcement_active = input.announcementActive;
  if (input.lowStockThreshold !== undefined)
    payload.low_stock_threshold = input.lowStockThreshold;

  const { data, error } = await db
    .from("store_settings")
    .update(payload)
    .eq("id", ROW_ID)
    .select(SELECT)
    .single();

  if (error || !data) {
    throw new Error(`No se pudieron guardar los ajustes: ${error?.message}`);
  }

  return fromRow(data as Row);
}
