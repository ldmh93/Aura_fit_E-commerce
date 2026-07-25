"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SizeGuide } from "./SizeGuide";
import { useCartStore } from "@/features/cart/store";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import { BUSINESS } from "@/lib/config";
import type { ProductWithInventory, Size } from "@/types";
import { cn, formatPrice } from "@/utils";

/**
 * Selección de variante y agregado al carrito.
 * El stock mostrado es el real de la variante (producto + talla + color).
 */
export function ProductPurchase({
  product,
  guideType,
}: {
  product: ProductWithInventory;
  guideType: "superior" | "inferior";
}) {
  const addItem = useCartStore((state) => state.addItem);

  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackViewContent(product);
  }, [product]);

  // Marca el body para que el botón flotante de WhatsApp suba y no tape
  // la barra de compra fija de móvil. Ver globals.css
  useEffect(() => {
    document.body.dataset.stickyCta = "1";
    return () => {
      delete document.body.dataset.stickyCta;
    };
  }, []);

  /** Existencia por talla para el color seleccionado. */
  const stockBySize = useMemo(() => {
    const map = new Map<Size, number>();
    for (const entry of product.inventory) {
      if (entry.color !== color) continue;
      map.set(entry.size, (map.get(entry.size) ?? 0) + entry.quantity);
    }
    return map;
  }, [product.inventory, color]);

  const availableForVariant = size ? (stockBySize.get(size) ?? 0) : 0;
  const colorHasStock = [...stockBySize.values()].some((q) => q > 0);
  const soldOut = product.stock <= 0 || product.status === "agotado";

  useEffect(() => {
    setSize(null);
    setQuantity(1);
  }, [color]);

  function handleAdd() {
    setError(null);

    if (!size) {
      setError("Selecciona una talla.");
      // En móvil la barra de compra está fija abajo: lleva al selector.
      sizeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (availableForVariant < 1) {
      setError("Esa combinación está agotada.");
      return;
    }

    const item = {
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0] ?? "",
      size,
      color,
      quantity,
      unit_price: product.price,
      max_quantity: availableForVariant,
    };

    addItem(item);
    trackAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="space-y-7">
      {/* Color */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="eyebrow">Color</h2>
          <span className="text-xs text-mist">{color}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => setColor(option.name)}
              aria-label={`Color ${option.name}`}
              aria-pressed={color === option.name}
              className={cn(
                "relative h-10 w-10 rounded-full border-2 transition-all duration-200",
                color === option.name
                  ? "border-aura scale-105"
                  : "border-white/15 hover:border-white/40",
              )}
              style={{ backgroundColor: option.hex }}
            >
              {color === option.name ? (
                <Check
                  className="absolute inset-0 m-auto h-4 w-4 text-white mix-blend-difference"
                  aria-hidden
                />
              ) : null}
            </button>
          ))}
        </div>
        {!colorHasStock && !soldOut ? (
          <p className="mt-3 text-xs text-warning">
            Este color está agotado por ahora. Prueba con otro.
          </p>
        ) : null}
      </div>

      {/* Talla */}
      <div ref={sizeRef} className="scroll-mt-24">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="eyebrow">Talla</h2>
          <SizeGuide type={guideType} />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((option) => {
            const stock = stockBySize.get(option) ?? 0;
            const disabled = stock <= 0;

            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                className={cn(
                  "relative min-w-14 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                  disabled &&
                    "cursor-not-allowed border-white/6 text-mist/35 line-through",
                  !disabled &&
                    size === option &&
                    "border-aura bg-aura/10 text-aura",
                  !disabled &&
                    size !== option &&
                    "border-white/12 text-white hover:border-white/35",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        {size ? (
          <p className="mt-3 text-xs">
            {availableForVariant > BUSINESS.lowStockThreshold ? (
              <span className="text-success">
                Disponible · {availableForVariant} en existencia
              </span>
            ) : availableForVariant > 0 ? (
              <span className="text-warning">
                Últimas {availableForVariant} piezas en {size} / {color}
              </span>
            ) : (
              <span className="text-danger">Sin existencia</span>
            )}
          </p>
        ) : null}
      </div>

      {/* Cantidad + agregar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center gap-1 rounded-full border border-white/12 px-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Quitar una unidad"
            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="tabular w-8 text-center text-sm text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(availableForVariant || 1, q + 1))
            }
            disabled={!size || quantity >= availableForVariant}
            aria-label="Agregar una unidad"
            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:text-white disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button
          variant={added ? "secondary" : "primary"}
          size="lg"
          onClick={handleAdd}
          disabled={soldOut}
          className="flex-1"
        >
          {soldOut ? (
            "Agotado"
          ) : added ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Agregar · {formatPrice(product.price * quantity)}
            </>
          )}
        </Button>
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Badge tone="muted">SKU {product.sku}</Badge>
        <Badge tone="muted">{product.material}</Badge>
        {product.price >= BUSINESS.freeShippingThreshold ? (
          <Badge tone="success">Envío gratis</Badge>
        ) : null}
      </div>

      {/* Barra de compra fija — solo móvil */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="min-w-0 flex-1">
            <p className="tabular text-base font-semibold text-silver">
              {formatPrice(product.price * quantity)}
            </p>
            <p className="truncate text-[11px] text-mist">
              {size ? `Talla ${size} · ${color}` : "Selecciona una talla"}
            </p>
          </div>
          <Button
            variant={added ? "secondary" : "primary"}
            size="md"
            onClick={handleAdd}
            disabled={soldOut}
            className="shrink-0 px-7"
          >
            {soldOut ? (
              "Agotado"
            ) : added ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Agregado
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
