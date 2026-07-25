import Image from "next/image";
import { Layers } from "lucide-react";
import {
  AdminPage,
  EmptyState,
  Panel,
} from "@/features/admin/components/AdminUI";
import { CategoryForm } from "@/features/admin/components/CategoryForm";
import { Badge } from "@/components/ui/Badge";
import { deleteCategoryAction } from "@/features/admin/actions";
import { getCategoriesWithCount } from "@/services/categories.service";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCount();

  return (
    <AdminPage
      title="Categorías"
      description="La tienda usa una sola taxonomía. Arranca con Hombre y Mujer; puedes agregar más si el catálogo crece."
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Panel title="Nueva categoría">
            <div className="p-5">
              <CategoryForm />
            </div>
          </Panel>
        </div>

        <Panel title={`${categories.length} categorías`}>
          {categories.length === 0 ? (
            <EmptyState message="No hay categorías. Crea la primera." />
          ) : (
            <ul className="divide-y divide-white/6">
              {categories.map((category) => (
                <li key={category.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-steel">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <Layers
                          className="absolute inset-0 m-auto h-5 w-5 text-mist/40"
                          aria-hidden
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-white">
                          {category.name}
                        </h3>
                        {category.active ? (
                          <Badge tone="success">Visible</Badge>
                        ) : (
                          <Badge tone="muted">Oculta</Badge>
                        )}
                        <Badge tone="silver">
                          {category.product_count}{" "}
                          {category.product_count === 1
                            ? "producto"
                            : "productos"}
                        </Badge>
                      </div>
                      <p className="tabular mt-1 text-xs text-mist">
                        /categoria/{category.slug} · orden{" "}
                        {category.sort_order}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-mist">
                        {category.description || "Sin descripción."}
                      </p>
                    </div>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-aura hover:underline">
                      Editar
                    </summary>
                    <div className="mt-4 rounded-xl border border-white/8 p-4">
                      <CategoryForm category={category} />

                      {category.product_count === 0 ? (
                        <form
                          action={deleteCategoryAction}
                          className="mt-4 border-t border-white/8 pt-4"
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={category.id}
                          />
                          <button
                            type="submit"
                            className="text-xs text-mist transition-colors hover:text-danger"
                          >
                            Eliminar categoría
                          </button>
                        </form>
                      ) : (
                        <p className="mt-4 border-t border-white/8 pt-4 text-xs text-mist">
                          No se puede eliminar mientras tenga productos
                          asignados.
                        </p>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
