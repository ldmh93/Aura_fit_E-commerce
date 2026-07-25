"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadProductImagesAction } from "@/features/admin/upload.actions";
import { cn } from "@/utils";

/**
 * Subida de fotos de producto.
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
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const formData = new FormData();
    formData.set("folder", folder || "productos");
    Array.from(files).forEach((file) => formData.append("files", file));

    startTransition(async () => {
      const result = await uploadProductImagesAction(formData);
      if (result.urls.length) setUrls((prev) => [...prev, ...result.urls]);
      if (!result.ok) setError(result.error ?? "No se pudieron subir las fotos.");
    });
  }

  function remove(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* El formulario sigue enviando una URL por línea */}
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
          upload(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border border-dashed p-6 text-center transition-colors",
          dragOver ? "border-aura bg-aura/5" : "border-white/15",
        )}
      >
        <ImagePlus className="mx-auto h-6 w-6 text-mist" aria-hidden />
        <p className="mt-3 text-sm text-white">
          Arrastra las fotos aquí o selecciónalas
        </p>
        <p className="mt-1 text-xs text-mist">
          JPG, PNG, WebP o AVIF · máximo 5 MB por imagen
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-xs uppercase tracking-[0.14em] text-white transition-colors hover:border-aura hover:text-aura disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Subiendo…
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

      {/* Alternativa sin Storage: pegar una URL ya alojada */}
      <div className="flex gap-2">
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
          className="shrink-0 rounded-xl border border-white/12 px-4 text-xs uppercase tracking-[0.12em] text-mist transition-colors hover:border-aura hover:text-aura disabled:opacity-40"
        >
          Agregar
        </button>
      </div>

      {urls.length ? (
        <>
          <p className="text-xs text-mist">
            El orden es el de la galería: 1) frontal · 2) trasera · 3) detalle de
            tela · 4) con modelo.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {urls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-steel"
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

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-void/85 px-2 py-1.5 backdrop-blur-sm">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover a la izquierda"
                      className="px-1 text-mist transition-colors hover:text-white disabled:opacity-25"
                    >
                      ‹
                    </button>
                    <GripVertical
                      className="h-3 w-3 text-mist/50"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === urls.length - 1}
                      aria-label="Mover a la derecha"
                      className="px-1 text-mist transition-colors hover:text-white disabled:opacity-25"
                    >
                      ›
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Quitar foto ${index + 1}`}
                    className="text-mist transition-colors hover:text-danger"
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
