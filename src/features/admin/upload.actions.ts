"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";
import { isAdmin } from "./guard";
import { slugify } from "@/utils";

/**
 * Subida de fotografía de producto a Supabase Storage.
 * Requiere el bucket `productos` (ver supabase/migrations/0002_storage.sql).
 */

const PRODUCT_BUCKET = "productos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  ok: boolean;
  urls: string[];
  error?: string;
}

export async function uploadProductImagesAction(
  formData: FormData,
): Promise<UploadResult> {
  // Sin esto, cualquiera podría llenar el bucket de archivos ajenos.
  if (!(await isAdmin())) {
    return {
      ok: false,
      urls: [],
      error: "Tu sesión expiró. Vuelve a iniciar sesión para subir fotos.",
    };
  }

  const supabase = createAdminClient();

  if (!supabase || !hasServiceRole) {
    return {
      ok: false,
      urls: [],
      error:
        "Falta configurar Supabase. Llena NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local para poder subir fotos.",
    };
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const folder = slugify(String(formData.get("folder") ?? "")) || "sin-clasificar";

  if (!files.length) {
    return { ok: false, urls: [], error: "No seleccionaste ninguna imagen." };
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return {
        ok: false,
        urls,
        error: `"${file.name}" no es un formato válido. Usa JPG, PNG, WebP o AVIF.`,
      };
    }
    if (file.size > MAX_BYTES) {
      return {
        ok: false,
        urls,
        error: `"${file.name}" pesa más de 5 MB. Comprime la imagen antes de subirla.`,
      };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      return {
        ok: false,
        urls,
        error: `No se pudo subir "${file.name}": ${error.message}`,
      };
    }

    const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { ok: true, urls };
}
