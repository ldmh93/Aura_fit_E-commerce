"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Ticket,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/shared/Logo";
import { logoutAction } from "@/features/admin/auth.actions";
import { cn } from "@/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // El login se renderiza sin el shell.
  if (pathname === "/admin/login") return <>{children}</>;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/8 px-5">
        <Wordmark size="sm" />
        <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-aura">
          <BarChart3 className="h-3 w-3" />
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-aura/10 text-aura"
                  : "text-mist hover:bg-white/5 hover:text-white",
              )}
            >
              <link.icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/8 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist transition-colors hover:bg-white/5 hover:text-white"
        >
          <Store className="h-4 w-4" aria-hidden />
          Ver tienda
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-white/8 bg-graphite/40 lg:block">
        {sidebar}
      </aside>

      {/* Barra móvil */}
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-5 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de administración"
          className="text-mist hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Wordmark size="sm" />
      </div>

      {open ? (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-white/8 bg-void">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 z-10 text-mist hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
