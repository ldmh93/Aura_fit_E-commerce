"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { saveSettingsAction, type ActionState } from "@/features/admin/actions";
import type { StoreSettings } from "@/types";

const initial: ActionState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction] = useActionState(saveSettingsAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Identidad
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="storeName">Nombre de la tienda</Label>
            <Input
              id="storeName"
              name="storeName"
              defaultValue={settings.storeName}
              required
            />
          </div>
          <div>
            <Label htmlFor="tagline">Descriptor</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={settings.tagline}
              placeholder="Performance Wear"
            />
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Contacto y entrega
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp (con código de país)</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber}
              placeholder="524171279042"
              inputMode="tel"
              required
            />
            <p className="mt-1.5 text-xs text-mist">
              Solo dígitos. México: 52 + tus 10 números.
            </p>
          </div>

          <div>
            <Label htmlFor="whatsappDisplay">Cómo se muestra en pantalla</Label>
            <Input
              id="whatsappDisplay"
              name="whatsappDisplay"
              defaultValue={settings.whatsappDisplay}
              placeholder="417 127 9042"
            />
          </div>

          <div>
            <Label htmlFor="supportHours">Horario de atención</Label>
            <Input
              id="supportHours"
              name="supportHours"
              defaultValue={settings.supportHours}
              placeholder="Lunes a sábado, 10:00 – 20:00"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="meetingPointNote">Aviso de entrega</Label>
            <Textarea
              id="meetingPointNote"
              name="meetingPointNote"
              defaultValue={settings.meetingPointNote}
              className="min-h-20"
            />
            <p className="mt-1.5 text-xs text-mist">
              Aparece en el carrito, en la ficha de producto y en el pie de
              página.
            </p>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Aviso superior
        </h2>

        <div className="space-y-5">
          <div>
            <Label htmlFor="announcement">Mensaje</Label>
            <Input
              id="announcement"
              name="announcement"
              defaultValue={settings.announcement}
              placeholder="Entrega en punto de encuentro · Pide por WhatsApp"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-white">
            <input
              type="checkbox"
              name="announcementActive"
              defaultChecked={settings.announcementActive}
              className="h-4 w-4 accent-[#5EA8FF]"
            />
            Mostrar la barra de aviso en la tienda
          </label>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white">
          Inventario
        </h2>

        <div className="w-48">
          <Label htmlFor="lowStockThreshold">Alerta de stock bajo</Label>
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={1}
            max={50}
            defaultValue={settings.lowStockThreshold}
          />
          <p className="mt-1.5 text-xs text-mist">
            Piezas o menos para marcar una variante como &ldquo;por
            reponer&rdquo;.
          </p>
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

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" size="lg" disabled={pending}>
      {pending ? "Guardando…" : "Guardar ajustes"}
    </Button>
  );
}
