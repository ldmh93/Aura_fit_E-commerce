"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/features/cart/store";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/types";
import { cn, discountPercent, formatPrice } from "@/utils";

/**
 * Tarjeta de producto del catálogo.
 * El agregado rápido pide talla — nunca se asume por el cliente.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quickOpen, setQuickOpen] = useState(false);

  const soldOut = product.stock <= 0 || product.status === "agotado";
  const discount = discountPercent(product.price, product.old_price);
  const cover = product.images[0] ?? "";
  const back = product.images[1] ?? cover;
  const firstColor = product.colors[0];

  function handleQuickAdd(size: string) {
    if (!firstColor) return;

    const item = {
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: cover,
      size: size as Product["sizes"][number],
      color: firstColor.name,
      quantity: 1,
      unit_price: product.price,
      max_quantity: Math.max(1, Math.min(product.stock, 10)),
    };

    addItem(item);
    trackAddToCart(item);
    setQuickOpen(false);
  }

  return (
    <article className="group relative">
      <Link
        href={`/producto/${product.slug}`}
        className="block overflow-hidden rounded-2xl border border-white/7 bg-graphite transition-all duration-500 group-hover:border-aura/35 group-hover:shadow-[0_0_50px_-18px_rgba(94,168,255,0.6)]"
      >
        <div className="relative aspect-4/5 overflow-hidden bg-steel">
          <Image
            src={cover}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "group-hover:scale-105 group-hover:opacity-0",
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
            {product.collection === "limited-edition" && !soldOut ? (
              <Badge tone="silver">Limited</Badge>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-graphite to-transparent" />
        </div>
      </Link>

      {/* Agregado rápido — solo escritorio: en móvil no cabe el selector de tallas */}
      {!soldOut ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-24 z-10 hidden opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 md:block">
          {quickOpen ? (
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-void/90 p-2 backdrop-blur-md">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleQuickAdd(size)}
                  className="min-w-9 rounded-lg border border-white/10 px-2 py-1.5 text-xs font-medium text-silver transition-colors hover:border-aura hover:bg-aura/10 hover:text-aura"
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="w-full rounded-full border border-white/12 bg-void/85 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors hover:border-aura hover:text-aura"
            >
              Agregar
            </button>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/producto/${product.slug}`}>
            <h3 className="truncate text-sm font-medium text-white transition-colors hover:text-aura">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-mist">
            {soldOut ? (
              "Sin existencia"
            ) : product.stock <= 5 ? (
              <span className="text-warning">
                Últimas {product.stock} piezas
              </span>
            ) : (
              `${product.colors.length} colores · ${product.sizes.length} tallas`
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

      {/* CTA de móvil: en pantallas chicas el selector flotante no cabe */}
      {!soldOut ? (
        <Link
          href={`/producto/${product.slug}`}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-white/12 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors active:border-aura active:text-aura md:hidden"
        >
          Elegir talla
        </Link>
      ) : null}
    </article>
  );
}
