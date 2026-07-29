"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";
import { isAdmin } from "./guard";
import { slugify } from "@/utils";

/**
 * Subida de fotografía de producto.
 *
 * El archivo NO pasa por el servidor: se pide una URL firmada y el navegador
 * sube directo a Supabase Storage. Antes se enviaba como Server Action y
 * fallaba con cualquier foto de celular, porque se acumulaban tres topes:
 * el de las Server Actions de Next (1 MB), el de las funciones de Vercel
 * (4.5 MB) y el del bucket. Yendo directo no aplica ninguno de los dos
 * primeros.
 */

const PRODUCT_BUCKET = "productos";

export interface SignedUpload {
  ok: boolean;
  /** Destino temporal al que el navegador sube el archivo. */
  signedUrl?: string;
  /** URL definitiva y pública de la imagen. */
  publicUrl?: string;
  error?: string;
}

export async function createSignedUploadAction(
  fileName: string,
  folder: string,
): Promise<SignedUpload> {
  // Sin esto, cualquiera podría llenar el bucket con archivos ajenos.
  if (!(await isAdmin())) {
    return {
      ok: false,
      error: "Tu sesión expiró. Vuelve a iniciar sesión para subir fotos.",
    };
  }

  const supabase = createAdminClient();
  if (!supabase || !hasServiceRole) {
    return { ok: false, error: "Supabase no está configurado." };
  }

  const extension = (fileName.split(".").pop() ?? "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);

  const safeFolder = slugify(folder) || "sin-clasificar";
  const path = `${safeFolder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension || "webp"}`;

  const { data, error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false, error: `No se pudo preparar la subida: ${error?.message}` };
  }

  const { data: publicData } = supabase.storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(path);

  return {
    ok: true,
    signedUrl: data.signedUrl,
    publicUrl: publicData.publicUrl,
  };
}
