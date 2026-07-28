"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cartTotals, useCartStore } from "@/features/cart/store";
import { applyCouponAction, checkoutAction } from "@/features/cart/actions";
import { buildOrderMessage, whatsappUrl } from "@/features/cart/whatsapp";
import { trackInitiateCheckout } from "@/lib/analytics";
import { DELIVERY } from "@/lib/config";
import { formatPrice } from "@/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    coupon,
    closeCart,
    removeItem,
    setQuantity,
    applyCoupon,
    removeCoupon,
    clear,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { subtotal, discount, total, count } = cartTotals(items, coupon);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  function handleCoupon() {
    startTransition(async () => {
      const result = await applyCouponAction(couponInput);
      setCouponMessage(result.message);
      if (result.valid) {
        applyCoupon(result.code, result.discount);
        setCouponInput("");
      }
    });
  }

  function handleCheckout() {
    setError(null);

    startTransition(async () => {
      const result = await checkoutAction({
        customerName: name,
        phone,
        // Solo la referencia: el servidor pone precios y nombres.
        items: items.map((item) => ({
          product_id: item.product_id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        couponCode: coupon?.code ?? null,
      });

      if (!result.ok || !result.items) {
        setError(result.error ?? "No pudimos procesar tu pedido.");
        return;
      }

      trackInitiateCheckout(items, result.total ?? total);

      const message = buildOrderMessage({
        items: result.items,
        subtotal: result.subtotal ?? subtotal,
        discount: result.discount ?? discount,
        total: result.total ?? total,
        couponCode: result.couponCode ?? null,
        customerName: name,
        orderNumber: result.orderNumber,
      });

      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
      clear();
      closeCart();
    });
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-label="Carrito de compras"
            className="fixed inset-y-0 right-0 z-60 flex w-full max-w-md flex-col border-l border-white/8 bg-void"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-aura" />
                <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-white">
                  Tu pedido
                </h2>
                {count > 0 ? (
                  <span className="tabular text-xs text-mist">({count})</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <ShoppingBag className="h-10 w-10 text-mist/40" />
                <p className="text-sm text-mist">
                  Tu pedido está vacío. Echa un ojo al catálogo y arma el tuyo.
                </p>
                <LinkButton
                  href="/shop"
                  variant="secondary"
                  size="sm"
                  onClick={closeCart}
                >
                  Ver productos
                </LinkButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {/* Cómo se entrega: visible antes de cualquier otra cosa */}
                  <div className="mb-5 flex gap-3 rounded-xl border border-aura/20 bg-aura/5 px-4 py-3">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                      aria-hidden
                    />
                    <p className="text-xs leading-relaxed text-silver">
                      <span className="font-medium text-white">
                        {DELIVERY.headline}.
                      </span>{" "}
                      {DELIVERY.description}
                    </p>
                  </div>

                  <ul className="space-y-5">
                    {items.map((item) => (
                      <li key={item.key} className="flex gap-4">
                        <div className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-graphite">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="88px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/producto/${item.slug}`}
                                onClick={closeCart}
                                className="block truncate text-sm font-medium text-white transition-colors hover:text-aura"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-1 text-xs text-mist">
                                Talla {item.size} · {item.color}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              aria-label={`Quitar ${item.name}`}
                              className="text-mist transition-colors hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                            <div className="flex items-center gap-1 rounded-full border border-white/10">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(item.key, item.quantity - 1)
                                }
                                aria-label="Quitar una unidad"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors hover:text-white"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="tabular w-6 text-center text-sm text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(item.key, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.max_quantity}
                                aria-label="Agregar una unidad"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors hover:text-white disabled:opacity-30"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="tabular text-sm font-medium text-silver">
                              {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="border-t border-white/8 px-6 py-5">
                  {/* Cupón */}
                  {coupon ? (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-success/25 bg-success/5 px-4 py-2.5">
                      <span className="flex items-center gap-2 text-xs text-success">
                        <Tag className="h-3.5 w-3.5" />
                        {coupon.code} · {coupon.discount}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon();
                          setCouponMessage(null);
                        }}
                        className="text-xs text-mist hover:text-white"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <Input
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          placeholder="Código de descuento"
                          aria-label="Código de descuento"
                          className="py-2.5 text-xs uppercase tracking-widest"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCoupon}
                          disabled={pending || !couponInput}
                        >
                          Aplicar
                        </Button>
                      </div>
                      {couponMessage ? (
                        <p className="mt-2 text-xs text-mist">{couponMessage}</p>
                      ) : null}
                    </div>
                  )}

                  {/* Datos del cliente */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      aria-label="Tu nombre"
                      autoComplete="name"
                      className="py-2.5 text-xs"
                    />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp (10 dígitos)"
                      aria-label="Tu WhatsApp"
                      inputMode="tel"
                      autoComplete="tel"
                      className="py-2.5 text-xs"
                    />
                  </div>

                  {/* Totales — sin envío */}
                  <dl className="space-y-2 text-sm">
                    {discount > 0 ? (
                      <>
                        <div className="flex justify-between text-mist">
                          <dt>Subtotal</dt>
                          <dd className="tabular">{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between text-success">
                          <dt>Descuento</dt>
                          <dd className="tabular">−{formatPrice(discount)}</dd>
                        </div>
                        <div className="hairline my-3" />
                      </>
                    ) : null}
                    <div className="flex justify-between text-base font-semibold text-white">
                      <dt>Total</dt>
                      <dd className="tabular">{formatPrice(total)}</dd>
                    </div>
                  </dl>

                  {error ? (
                    <p className="mt-3 text-xs text-danger">{error}</p>
                  ) : null}

                  <Button
                    variant="aura"
                    size="lg"
                    className="mt-5 w-full"
                    onClick={handleCheckout}
                    disabled={pending}
                  >
                    {pending ? "Procesando…" : "Pedir por WhatsApp"}
                  </Button>

                  <p className="mt-3 text-center text-[11px] leading-relaxed text-mist">
                    Confirmamos disponibilidad, forma de pago y punto de
                    encuentro por WhatsApp.
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
