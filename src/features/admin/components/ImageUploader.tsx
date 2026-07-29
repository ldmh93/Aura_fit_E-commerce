"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createSignedUploadAction } from "@/features/admin/upload.actions";
import { resizeImage } from "@/features/admin/image-resize";
import { cn } from "@/utils";

/**
 * Subida de fotos de producto.
 *
 * Cada archivo se reduce en el navegador y sube directo a Supabase Storage
 * con una URL firmada. No pasa por el servidor, así que no le aplican los
 * topes de tamaño de Next ni de Vercel: por eso ahora funcionan las fotos
 * tomadas con el celular.
 *
 * El orden de la lista es el orden de la galería:
 * 1) frontal · 2) trasera · 3) detalle de tela · 4) con modelo
 */
export function ImageUploader({
  name = "images",
  folder,
  initial = [],
}: {
  name?: string;
  folder: string;
  initial?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function subir(files: FileList | null) {
    if (!files?.length) return;

    setError(null);
    const lista = Array.from(files);
    setProgress({ done: 0, total: lista.length });

    const nuevas: string[] = [];

    for (let i = 0; i < lista.length; i += 1) {
      const file = lista[i]!;

      try {
        if (!file.type.startsWith("image/") && !/\.(hei[cf])$/i.test(file.name)) {
          throw new Error(`“${file.name}” no es una imagen.`);
        }

        const { blob, fileName } = await resizeImage(file);

        const signed = await createSignedUploadAction(fileName, folder);
        if (!signed.ok || !signed.signedUrl || !signed.publicUrl) {
          throw new Error(signed.error ?? "No se pudo preparar la subida.");
        }

        const res = await fetch(signed.signedUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": blob.type },
        });

        if (!res.ok) {
          throw new Error(`Falló la subida de “${file.name}”.`);
        }

        nuevas.push(signed.publicUrl);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : `No se pudo subir “${file.name}”.`,
        );
      }

      setProgress({ done: i + 1, total: lista.length });
    }

    if (nuevas.length) setUrls((prev) => [...prev, ...nuevas]);
    setProgress(null);
  }

  function quitar(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function mover(index: number, direccion: -1 | 1) {
    setUrls((prev) => {
      const next = [...prev];
      const destino = index + direccion;
      if (destino < 0 || destino >= next.length) return prev;
      [next[index], next[destino]] = [next[destino]!, next[index]!];
      return next;
    });
  }

  const subiendo = progress !== null;

  return (
    <div className="space-y-4">
      {/* El formulario envía una URL por línea */}
      <input type="hidden" name={name} value={urls.join("\n")} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          subir(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border border-dashed px-4 py-6 text-center transition-colors sm:px-6",
          dragOver ? "border-aura bg-aura/5" : "border-white/15",
        )}
      >
        <ImagePlus className="mx-auto h-6 w-6 text-mist" aria-hidden />
        <p className="mt-3 text-sm text-white">
          Toca para elegir fotos o arrástralas aquí
        </p>
        <p className="mt-1 text-xs leading-relaxed text-mist">
          Desde el celular puedes usar la cámara o la galería. Se reducen
          solas antes de subir.
        </p>

        <input
          ref={inputRef}
          type="file"
          // `image/*` a secas: así el iPhone ofrece la galería completa y no
          // deja fuera las fotos en HEIC.
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            subir(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-xs uppercase tracking-[0.14em] text-white transition-colors hover:border-aura hover:text-aura disabled:opacity-50 sm:w-auto"
        >
          {subiendo ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Subiendo {progress.done} de {progress.total}…
            </>
          ) : (
            "Seleccionar fotos"
          )}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {error}
        </p>
      ) : null}

      {/* Alternativa: pegar una URL ya alojada */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="…o pega la URL de una imagen"
          aria-label="Agregar imagen por URL"
          className="w-full rounded-xl border border-white/10 bg-steel px-4 py-2.5 text-xs text-white placeholder:text-mist/70 focus:border-aura/60 focus:outline-none"
        />
        <button
          type="button"
          disabled={!urlInput.trim()}
          onClick={() => {
            setUrls((prev) => [...prev, urlInput.trim()]);
            setUrlInput("");
          }}
          className="h-11 shrink-0 rounded-xl border border-white/12 px-4 text-xs uppercase tracking-[0.12em] text-mist transition-colors hover:border-aura hover:text-aura disabled:opacity-40 sm:h-auto"
        >
          Agregar
        </button>
      </div>

      {urls.length ? (
        <>
          <p className="text-xs leading-relaxed text-mist">
            El orden es el de la galería: 1) frontal · 2) trasera · 3) detalle
            de tela · 4) con modelo.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {urls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-steel"
              >
                <div className="relative aspect-4/5">
                  <Image
                    src={url}
                    alt={`Foto ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                </div>

                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-void/85 text-[11px] font-medium text-aura">
                  {index + 1}
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-void/85 px-2 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => mover(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover a la izquierda"
                      className="flex h-8 w-8 items-center justify-center text-mist transition-colors hover:text-white disabled:opacity-25"
                    >
                      ‹
                    </button>
                    <GripVertical className="h-3 w-3 text-mist/50" aria-hidden />
                    <button
                      type="button"
                      onClick={() => mover(index, 1)}
                      disabled={index === urls.length - 1}
                      aria-label="Mover a la derecha"
                      className="flex h-8 w-8 items-center justify-center text-mist transition-colors hover:text-white disabled:opacity-25"
                    >
                      ›
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => quitar(index)}
                    aria-label={`Quitar foto ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center text-mist transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
