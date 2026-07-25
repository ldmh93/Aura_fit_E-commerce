import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminPage,
  EmptyState,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import { SearchBox } from "@/features/admin/components/SearchBox";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import {
  deleteProductAction,
  toggleProductAction,
} from "@/features/admin/actions";
import { getAdminProducts } from "@/services/products.service";
import type { Product } from "@/types";
import { formatAmount } from "@/utils";

export const dynamic = "force-dynamic";

function statusTone(status: Product["status"]) {
  if (status === "activo") return "success" as const;
  if (status === "agotado") return "danger" as const;
  return "muted" as const;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getAdminProducts(q);

  return (
    <AdminPage
      title="Productos"
      description="Alta, edición y visibilidad del catálogo."
      action={
        <LinkButton href="/admin/productos/nuevo" variant="primary" size="md">
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo producto
        </LinkButton>
      }
    >
      <div className="mb-5">
        <SearchBox placeholder="Buscar por nombre, SKU o categoría…" />
      </div>

      <Panel>
        {products.length === 0 ? (
          <EmptyState
            message={
              q
                ? `Ningún producto coincide con “${q}”.`
                : "Todavía no hay productos. Crea el primero."
            }
            action={
              q ? null : (
                <LinkButton
                  href="/admin/productos/nuevo"
                  variant="secondary"
                  size="sm"
                >
                  Crear producto
                </LinkButton>
              )
            }
          />
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <ul className="divide-y divide-white/6 md:hidden">
              {products.map((product) => (
                <li key={product.id} className="flex gap-3 p-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-steel">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {product.name}
                    </p>
                    <p className="tabular truncate text-xs text-mist">
                      {product.sku} · {product.category_name ?? "Sin categoría"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="tabular text-sm text-white">
                        {formatAmount(product.price)}
                      </span>
                      <Badge tone={statusTone(product.status)}>
                        {product.status}
                      </Badge>
                      <span
                        className={
                          product.stock === 0
                            ? "tabular text-xs text-danger"
                            : product.stock <= 5
                              ? "tabular text-xs text-warning"
                              : "tabular text-xs text-mist"
                        }
                      >
                        {product.stock} pzas
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      aria-label={`Editar ${product.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-mist active:text-aura"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        aria-label={`Eliminar ${product.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-mist active:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-4xl">
                <thead className="border-b border-white/8">
                  <tr>
                    <Th>Producto</Th>
                    <Th>SKU</Th>
                    <Th>Categoría</Th>
                    <Th>Precio</Th>
                    <Th>Stock</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/2">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-steel">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {product.name}
                            </p>
                            {product.featured ? (
                              <p className="text-xs text-aura">Destacado</p>
                            ) : null}
                          </div>
                        </div>
                      </Td>
                      <Td className="tabular text-mist">{product.sku}</Td>
                      <Td className="text-mist">
                        {product.category_name ?? "—"}
                      </Td>
                      <Td className="tabular text-white">
                        {formatAmount(product.price)}
                      </Td>
                      <Td>
                        <span
                          className={
                            product.stock === 0
                              ? "tabular text-danger"
                              : product.stock <= 5
                                ? "tabular text-warning"
                                : "tabular text-white"
                          }
                        >
                          {product.stock}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={statusTone(product.status)}>
                          {product.status}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <form action={toggleProductAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={product.id}
                            />
                            <button
                              type="submit"
                              aria-label={
                                product.status === "oculto"
                                  ? `Mostrar ${product.name}`
                                  : `Ocultar ${product.name}`
                              }
                              title={
                                product.status === "oculto"
                                  ? "Mostrar en la tienda"
                                  : "Ocultar de la tienda"
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-mist transition-colors hover:bg-white/5 hover:text-aura"
                            >
                              {product.status === "oculto" ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </form>

                          <Link
                            href={`/admin/productos/${product.id}`}
                            aria-label={`Editar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-mist transition-colors hover:bg-white/5 hover:text-aura"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>

                          <form action={deleteProductAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={product.id}
                            />
                            <button
                              type="submit"
                              aria-label={`Eliminar ${product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-mist transition-colors hover:bg-danger/10 hover:text-danger"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </AdminPage>
  );
}
