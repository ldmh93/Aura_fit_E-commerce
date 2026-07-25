"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { saveCategoryAction, type ActionState } from "@/features/admin/actions";
import type { Category } from "@/types";

const initial: ActionState = { ok: false, message: "" };

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState(saveCategoryAction, initial);
  const isEdit = Boolean(category);

  return (
    <form action={formAction} className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <div>
        <Label htmlFor={`name-${category?.id ?? "new"}`}>Nombre</Label>
        <Input
          id={`name-${category?.id ?? "new"}`}
          name="name"
          defaultValue={category?.name}
          placeholder="Hombre"
          required
        />
      </div>

      <div>
        <Label htmlFor={`slug-${category?.id ?? "new"}`}>Dirección web</Label>
        <Input
          id={`slug-${category?.id ?? "new"}`}
          name="slug"
          defaultValue={category?.slug}
          placeholder="hombre"
        />
      </div>

      <div>
        <Label htmlFor={`description-${category?.id ?? "new"}`}>
          Descripción
        </Label>
        <Textarea
          id={`description-${category?.id ?? "new"}`}
          name="description"
          defaultValue={category?.description}
          placeholder="Qué encuentra el cliente en esta categoría."
          className="min-h-20"
        />
      </div>

      <div>
        <Label htmlFor={`image-${category?.id ?? "new"}`}>
          Imagen de portada (URL)
        </Label>
        <Input
          id={`image-${category?.id ?? "new"}`}
          name="image"
          defaultValue={category?.image}
          placeholder="https://…"
        />
      </div>

      <div className="flex items-end gap-4">
        <div className="w-28">
          <Label htmlFor={`sort-${category?.id ?? "new"}`}>Orden</Label>
          <Input
            id={`sort-${category?.id ?? "new"}`}
            name="sort_order"
            type="number"
            min={1}
            defaultValue={category?.sort_order ?? 1}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 pb-3 text-sm text-white">
          <input
            type="checkbox"
            name="active"
            defaultChecked={category?.active ?? true}
            className="h-4 w-4 accent-[#5EA8FF]"
          />
          Visible en la tienda
        </label>
      </div>

      {state.message ? (
        <p className={state.ok ? "text-xs text-success" : "text-xs text-danger"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton isEdit={isEdit} />
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending
        ? "Guardando…"
        : isEdit
          ? "Guardar cambios"
          : "Crear categoría"}
    </Button>
  );
}
