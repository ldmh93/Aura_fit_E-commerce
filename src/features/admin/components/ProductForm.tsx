"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ImageUploader } from "./ImageUploader";
import { StockGrid } from "./StockGrid";
import {
  createProductAction,
  suggestSkuAction,
  updateProductAction,
  type ActionState,
} from "@/features/admin/actions";
import { COLOR_GROUPS, ONE_SIZE, SIZES } from "@/lib/config";
import type { Category, InventoryEntry, Product, Size } from "@/types";

const initial: ActionState = { ok: false, message: "" };

/**
 * Alta y edición de producto.
 *
 * El orden sigue cómo se carga un producto en la vida real: primero las
 * fotos —que es lo que se tiene a la mano al terminar de fotografiar—,
 * luego los datos y al final tallas, colores y existencias juntas.
 *
 * Las tallas y colores se llevan en estado para poder mostrar la rejilla
 * de existencias en cuanto se marcan, sin guardar ni cambiar de pantalla.
 */
export function ProductForm({
  categories,
  product,
  inventory = [],
}: {
  categories: Category[];
  product?: Product;
  inventory?: InventoryEntry[];
}) {
  const isEdit = Boolean(product);
  const [state, formAction] = useActionState(
    isEdit ? updateProductAction : createProductAction,
    initial,
  );

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? categories[0]?.id ?? "",
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  // Si el usuario escribe su propio código, se deja de sugerir.
  const skuManual = useRef(Boolean(product?.sku));

  const [sizes, setSizes] = useState<Size[]>(product?.sizes ?? []);
  const [colors, setColors] = useState<string[]>(
    product?.colors.map((c) => c.name) ?? [],
  );

  // El código se propone solo, con una pausa para no consultar en cada
  // tecla. Solo mientras nadie lo haya escrito a mano.
  useEffect(() => {
    if (skuManual.current || name.trim().length < 2) return;

    const timer = setTimeout(async () => {
      const sugerido = await suggestSkuAction(name, categoryId);
      if (sugerido && !skuManual.current) setSku(sugerido);
    }, 500);

    return () => clearTimeout(timer);
  }, [name, categoryId]);

  const paleta = COLOR_GROUPS.flatMap((g) => g.colors);
  const coloresElegidos = paleta.filter((c) => colors.includes(c.name));

  function alternar<T>(lista: T[], valor: T): T[] {
    return lista.includes(valor)
      ? lista.filter((v) => v !== valor)
      : [...lista, valor];
  }

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {/* 1. Fotos — lo primero que se tiene al dar de alta una prenda */}
      <section className="surface p-5">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
          1 · Fotos
        </h2>
        <p className="mb-5 text-xs leading-relaxed text-mist">
          La primera es la que se ve en el catálogo. Con dos o más, la
          tarjeta cambia de imagen al pasar el cursor.
        </p>

        <ImageUploader
          folder={product?.slug ?? "nuevos"}
          initial={product?.images ?? []}
        />
      </section>

      {/* 2. Datos */}
      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          2 · Información
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Conjunto Top + Short"
              required
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <div className="flex gap-2">
              <Input
                id="sku"
                name="sku"
                value={sku}
                onChange={(e) => {
                  skuManual.current = true;
                  setSku(e.target.value.toUpperCase());
                }}
                placeholder="Se genera solo"
              />
              <button
                type="button"
                onClick={async () => {
                  skuManual.current = false;
                  const sugerido = await suggestSkuAction(name, categoryId);
                  if (sugerido) setSku(sugerido);
                }}
                title="Volver a generarlo"
                aria-label="Volver a generar el SKU"
                className="shrink-0 rounded-xl border border-white/12 px-3 text-mist transition-colors hover:border-aura hover:text-aura"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-mist">
              Se arma solo con el nombre y la categoría. Puedes escribir el
              tuyo si prefieres.
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              placeholder="Describe la prenda, su uso y para quién está pensada."
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="features">Características (una por línea)</Label>
            <Textarea
              id="features"
              name="features"
              defaultValue={product?.features.join("\n")}
              placeholder={"Secado rápido\nElasticidad en cuatro direcciones"}
            />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              name="material"
              defaultValue={product?.material}
              placeholder="78% Poliamida · 22% Elastano"
            />
          </div>

          <div>
            <Label htmlFor="slug">Dirección web</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="conjunto-top-short"
            />
            <p className="mt-1.5 text-xs text-mist">
              Se genera del nombre si lo dejas vacío.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Precio y clasificación */}
      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          3 · Precio y clasificación
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="price">Precio (MXN)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.price}
              required
            />
          </div>

          <div>
            <Label htmlFor="old_price">Precio anterior</Label>
            <Input
              id="old_price"
              name="old_price"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.old_price ?? ""}
              placeholder="Opcional"
            />
            <p className="mt-1.5 text-xs text-mist">
              Si lo llenas, se muestra el descuento.
            </p>
          </div>

          <div>
            <Label htmlFor="category_id">Categoría</Label>
            <Select
              id="category_id"
              name="category_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="fit">Tipo de prenda</Label>
            <Select id="fit" name="fit" defaultValue={product?.fit ?? "superior"}>
              <option value="superior">Parte superior</option>
              <option value="inferior">Parte inferior</option>
              <option value="conjunto">Conjunto (arriba y abajo)</option>
            </Select>
            <p className="mt-1.5 text-xs text-mist">
              Define qué tabla de medidas se muestra.
            </p>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              name="status"
              defaultValue={product?.status ?? "activo"}
            >
              <option value="activo">Activo</option>
              <option value="oculto">Oculto</option>
            </Select>
            <p className="mt-1.5 text-xs text-mist">
              &ldquo;Agotado&rdquo; se pone solo cuando el stock llega a cero.
            </p>
          </div>

          <div className="flex items-end pb-6 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-white">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured}
                className="h-4 w-4 accent-[#5EA8FF]"
              />
              Destacar en la portada
            </label>
          </div>
        </div>
      </section>

      {/* 4. Tallas, colores y existencias */}
      <section className="surface p-5">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
          4 · Tallas, colores y existencias
        </h2>
        <p className="mb-5 text-xs leading-relaxed text-mist">
          Marca lo que tengas y captura las piezas de cada combinación. Ya no
          hace falta pasar por Inventario después de guardar.
        </p>

        <fieldset>
          <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mist">
            Tallas
          </legend>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <label
                key={size}
                className="cursor-pointer rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white transition-colors has-checked:border-aura has-checked:bg-aura/10 has-checked:text-aura"
              >
                <input
                  type="checkbox"
                  name="sizes"
                  value={size}
                  checked={sizes.includes(size)}
                  onChange={() => setSizes((prev) => alternar(prev, size))}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-mist">
            &ldquo;{ONE_SIZE}&rdquo; va sola: si el producto no se talla, no
            marques ninguna otra.
          </p>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mist">
            Colores
          </legend>

          <div className="space-y-4">
            {COLOR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-mist/60">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.colors.map((color) => (
                    <label
                      key={color.name}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/12 py-2 pl-2 pr-3 text-sm text-white transition-colors has-checked:border-aura has-checked:bg-aura/10 has-checked:text-aura"
                    >
                      <input
                        type="checkbox"
                        name="colors"
                        value={color.name}
                        checked={colors.includes(color.name)}
                        onChange={() =>
                          setColors((prev) => alternar(prev, color.name))
                        }
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className="h-5 w-5 shrink-0 rounded-full border border-white/25"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 border-t border-white/8 pt-6">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-mist">
            Piezas disponibles
          </p>
          <StockGrid
            sizes={sizes}
            colors={coloresElegidos}
            inventory={inventory}
          />
        </div>
      </section>

      {/* 5. Video, opcional */}
      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          5 · Video (opcional)
        </h2>
        <Label htmlFor="video">URL del video</Label>
        <Input
          id="video"
          name="video"
          defaultValue={product?.video ?? ""}
          placeholder="Déjalo vacío si no tienes"
        />
      </section>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-xs text-success"
              : "rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-white/8 bg-void/95 px-5 py-4 backdrop-blur-xl sm:flex-row md:mx-0 md:rounded-2xl md:border md:px-5">
        <SubmitButton isEdit={isEdit} />
        <Link
          href="/admin/productos"
          className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-9 text-sm uppercase tracking-[0.16em] text-white transition-colors hover:border-white/35"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" size="lg" disabled={pending}>
      {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
    </Button>
  );
}
