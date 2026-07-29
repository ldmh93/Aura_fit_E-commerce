/**
 * Reduce una foto en el navegador antes de subirla.
 *
 * Resuelve tres cosas a la vez:
 *
 * 1. El formato. Los iPhone graban en HEIC, que Supabase no acepta. Al
 *    dibujar la imagen en un canvas y volver a exportarla, sale siempre en
 *    un formato estándar sin importar cómo entró.
 * 2. El peso. Una foto de celular pesa entre 2 y 8 MB; después de esto
 *    ronda los 200 KB.
 * 3. La velocidad de la tienda. No hace falta servir 4000 píxeles de ancho
 *    para una ficha de producto.
 */

const MAX_SIDE = 1600;
const QUALITY = 0.85;

/** Carga el archivo como bitmap, con respaldo para navegadores viejos. */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Formato que este navegador no sabe decodificar por esa vía.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function exportBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export interface ResizedImage {
  blob: Blob;
  fileName: string;
  originalSize: number;
}

export async function resizeImage(file: File): Promise<ResizedImage> {
  const source = await decode(file);
  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;

  if (!width || !height) throw new Error("La imagen está vacía o dañada.");

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no permite procesar la imagen.");

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  // WebP pesa bastante menos; si el navegador no sabe exportarlo, JPEG.
  let blob = await exportBlob(canvas, "image/webp");
  let extension = "webp";

  if (!blob || blob.type !== "image/webp") {
    blob = await exportBlob(canvas, "image/jpeg");
    extension = "jpg";
  }

  if (!blob) throw new Error("No se pudo procesar la imagen.");

  const base =
    file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "-") || "foto";

  return {
    blob,
    fileName: `${base}.${extension}`,
    originalSize: file.size,
  };
}
