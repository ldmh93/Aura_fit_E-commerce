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
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Ticket,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/shared/Logo";
import { logoutAction } from "@/features/admin/auth.actions";
import { cn } from "@/utils";

const groups = [
  {
    label: "General",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
    ],
  },
  {
    label: "Catálogo",
    links: [
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: Tags },
      { href: "/admin/inventario", label: "Inventario", icon: Boxes },
    ],
  },
  {
    label: "Ventas",
    links: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/cupones", label: "Cupones", icon: Ticket },
    ],
  },
  {
    label: "Tienda",
    links: [{ href: "/admin/ajustes", label: "Ajustes", icon: Settings }],
  },
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
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-aura">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-mist/60">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.links.map((link) => {
                const active =
                  "exact" in link && link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);

                return (
                  <li key={link.href}>
                    <Link
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
