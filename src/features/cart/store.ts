"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { variantKey } from "@/utils";

/**
 * Carrito sin cuenta de usuario, persistido en localStorage.
 * Ver .claude/project-context.md → Modelo de ecommerce
 */

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: { code: string; discount: number } | null;

  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (item) =>
        set((state) => {
          const key = variantKey(item.product_id, item.size, item.color);
          const existing = state.items.find((i) => i.key === key);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + item.quantity,
                        i.max_quantity,
                      ),
                    }
                  : i,
              ),
              isOpen: true,
            };
          }

          return {
            items: [...state.items, { ...item, key }],
            isOpen: true,
          };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.key === key
                ? { ...i, quantity: Math.min(quantity, i.max_quantity) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [], coupon: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: (code, discount) => set({ coupon: { code, discount } }),
      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: "aura-fit-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    },
  ),
);

/** Totales derivados del carrito. */
export function cartTotals(
  items: CartItem[],
  coupon: { discount: number } | null,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const discount = coupon ? Math.round((subtotal * coupon.discount) / 100) : 0;
  const total = subtotal - discount;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discount, total, count };
}
