"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ImageUploader } from "./ImageUploader";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "@/features/admin/actions";
import { COLOR_PALETTE, SIZES } from "@/lib/config";
import type { Category, Product } from "@/types";

const initial: ActionState = { ok: false, message: "" };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const isEdit = Boolean(product);
  const [state, formAction] = useActionState(
    isEdit ? updateProductAction : createProductAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Información básica
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              placeholder="Playera Compression AURA"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Dirección web</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="playera-compression-aura"
            />
            <p className="mt-1.5 text-xs text-mist">
              Se genera del nombre si lo dejas vacío.
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
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku}
              placeholder="AF-001"
              required
            />
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Precio y clasificación
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
              defaultValue={product?.category_id}
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

      <section className="surface p-5">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Tallas y colores
        </h2>
        <p className="mb-5 text-xs leading-relaxed text-mist">
          Cada combinación de talla y color se convierte en una entrada de
          inventario. Si quitas una, se borra su existencia.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
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
                    defaultChecked={product?.sizes.includes(size)}
                    className="sr-only"
                  />
                  {size}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mist">
              Colores
            </legend>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <label
                  key={color.name}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/12 px-3 py-2.5 text-sm text-white transition-colors has-checked:border-aura has-checked:bg-aura/10 has-checked:text-aura"
                >
                  <input
                    type="checkbox"
                    name="colors"
                    value={color.name}
                    defaultChecked={product?.colors.some(
                      (c) => c.name === color.name,
                    )}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {isEdit ? (
          <p className="mt-5 text-xs text-mist">
            Ajusta las existencias desde{" "}
            <Link
              href="/admin/inventario"
              className="text-aura hover:underline"
            >
              Inventario
            </Link>
            .
          </p>
        ) : null}
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Fotos
        </h2>

        <div className="space-y-6">
          <ImageUploader
            folder={product?.slug ?? "nuevos"}
            initial={product?.images ?? []}
          />

          <div>
            <Label htmlFor="video">Video (URL)</Label>
            <Input
              id="video"
              name="video"
              defaultValue={product?.video ?? ""}
              placeholder="Opcional"
            />
          </div>
        </div>
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

      <div className="flex flex-col gap-3 sm:flex-row">
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
