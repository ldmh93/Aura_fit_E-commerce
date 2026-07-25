import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types";
import { cn, discountPercent, formatPrice } from "@/utils";

/**
 * Tarjeta de producto.
 *
 * Es un Server Component a propósito: la talla y el color se eligen en la
 * página de producto, donde se conoce el inventario real de cada variante.
 * Agregar desde la tarjeta obligaría a adivinar la existencia.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const soldOut = product.stock <= 0 || product.status === "agotado";
  const discount = discountPercent(product.price, product.old_price);
  const cover = product.images[0] ?? "";
  const back = product.images[1] ?? cover;

  return (
    <article className="group">
      <Link
        href={`/producto/${product.slug}`}
        className="block focus-visible:outline-none"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/7 bg-graphite transition-all duration-500 group-hover:border-aura/35 group-hover:shadow-[0_0_50px_-18px_rgba(94,168,255,0.6)]">
          <div className="relative aspect-4/5 overflow-hidden bg-steel">
            <Image
              src={cover}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-0",
                soldOut && "opacity-45 grayscale",
              )}
            />
            <Image
              src={back}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-100"
            />

            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {soldOut ? (
                <Badge tone="muted">Agotado</Badge>
              ) : discount > 0 ? (
                <Badge tone="aura">−{discount}%</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-white transition-colors group-hover:text-aura">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-mist">
              {soldOut ? (
                "Sin existencia"
              ) : product.stock <= 3 ? (
                <span className="text-warning">
                  Últimas {product.stock} piezas
                </span>
              ) : (
                `${product.sizes.length} tallas · ${product.colors.length} colores`
              )}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="tabular text-sm font-semibold text-silver">
              {formatPrice(product.price)}
            </p>
            {product.old_price ? (
              <p className="tabular text-xs text-mist line-through">
                {formatPrice(product.old_price)}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
