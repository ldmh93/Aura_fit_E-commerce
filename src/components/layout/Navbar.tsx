"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { LogoLink } from "@/components/shared/Logo";
import { NAV_LINKS } from "@/lib/config";
import { useCartStore } from "@/features/cart/store";
import { cn } from "@/utils";

export function Navbar({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  // El conteo solo se usa después de montar: el carrito vive en localStorage
  // y en el servidor siempre es cero.
  const count = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/8 bg-void/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {announcement ? (
        <div className="border-b border-white/6 bg-graphite/60 py-2 text-center">
          <p className="container-aura text-[11px] uppercase tracking-[0.16em] text-silver">
            {announcement}
          </p>
        </div>
      ) : null}

      <nav className="container-aura flex h-18 items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-10">
          <LogoLink />
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative text-[11px] font-medium uppercase tracking-[0.2em] transition-colors",
                      active ? "text-aura" : "text-mist hover:text-white",
                    )}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute -bottom-2 left-0 h-px w-full bg-aura" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            aria-label={
              count > 0 ? `Abrir pedido, ${count} artículos` : "Abrir pedido"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-white"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 ? (
              <span className="tabular absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-aura px-1 text-[10px] font-semibold text-void">
                {count}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="flex h-10 w-10 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-void transition-all duration-400 lg:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="container-aura flex h-18 items-center justify-between py-4">
          <LogoLink />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-10 w-10 items-center justify-center rounded-full text-mist hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="container-aura mt-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block border-b border-white/6 py-5 text-2xl font-semibold uppercase tracking-tight text-white transition-colors hover:text-aura"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
