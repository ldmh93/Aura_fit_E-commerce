import { AdminPage, Panel } from "@/features/admin/components/AdminUI";
import { SettingsForm } from "@/features/admin/components/SettingsForm";
import { getSettings } from "@/services/settings.service";
import { formatDateTime } from "@/utils";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const saved = new Date(settings.updated_at).getTime() > 0;

  return (
    <AdminPage
      title="Ajustes de la tienda"
      description="Datos de contacto, aviso de entrega y umbral de inventario. Se aplican en toda la tienda."
    >
      <div className="max-w-3xl">
        <SettingsForm settings={settings} />

        <Panel title="Dónde se guardan" className="mt-6">
          <div className="space-y-2 p-5 text-sm leading-relaxed text-mist">
            <p>
              Por ahora los ajustes se guardan en un archivo local del proyecto
              (<code className="text-silver">.data/settings.json</code>). Al
              conectar Supabase pasarán a la base de datos sin que cambie esta
              pantalla.
            </p>
            <p>
              {saved
                ? `Última modificación: ${formatDateTime(settings.updated_at)}.`
                : "Todavía no se han guardado cambios: se están usando los valores por defecto."}
            </p>
          </div>
        </Panel>
      </div>
    </AdminPage>
  );
}
