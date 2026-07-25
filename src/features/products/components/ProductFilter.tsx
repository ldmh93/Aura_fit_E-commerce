"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { COLOR_PALETTE, SIZES } from "@/lib/config";
import type { Category } from "@/types";
import { cn } from "@/utils";

/**
 * Filtros del catálogo.
 * Con pocos productos, seis grupos de filtros estorban más de lo que ayudan:
 * quedan categoría, talla y disponibilidad, más el orden.
 */

const SORTS = [
  { value: "nuevo", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
];

export function ProductFilter({
  categories,
  total,
  showCategories = true,
}: {
  categories: Category[];
  total: number;
  showCategories?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const activeCount = ["category", "size", "color", "stock"].filter((key) =>
    searchParams.get(key),
  ).length;

  return (
    <div className="mb-10 space-y-5 border-b border-white/8 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="tabular text-xs text-mist">
          {total} {total === 1 ? "producto" : "productos"}
        </p>

        <div className="flex items-center gap-3">
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="inline-flex items-center gap-1.5 text-xs text-mist transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar ({activeCount})
            </button>
          ) : null}

          <Select
            aria-label="Ordenar por"
            value={get("sort") || "nuevo"}
            onChange={(e) => setParam("sort", e.target.value)}
            className="w-auto py-2 text-xs"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {showCategories ? (
          <Group label="Categoría">
            <Chip
              active={!get("category")}
              onClick={() => setParam("category", null)}
            >
              Todo
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                active={get("category") === category.slug}
                onClick={() => setParam("category", category.slug)}
              >
                {category.name}
              </Chip>
            ))}
          </Group>
        ) : null}

        <Group label="Talla">
          {SIZES.map((size) => (
            <Chip
              key={size}
              active={get("size") === size}
              onClick={() => setParam("size", get("size") === size ? null : size)}
            >
              {size}
            </Chip>
          ))}
        </Group>

        <Group label="Color">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.name}
              type="button"
              aria-label={`Color ${color.name}`}
              aria-pressed={get("color") === color.name}
              onClick={() =>
                setParam("color", get("color") === color.name ? null : color.name)
              }
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all",
                get("color") === color.name
                  ? "scale-110 border-aura"
                  : "border-white/15 hover:border-white/40",
              )}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </Group>

        <Group label="Disponibilidad">
          <Chip
            active={get("stock") === "1"}
            onClick={() => setParam("stock", get("stock") === "1" ? null : "1")}
          >
            Solo con existencia
          </Chip>
        </Group>
      </div>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-mist">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-all duration-200",
        active
          ? "border-aura bg-aura/12 text-aura"
          : "border-white/10 text-mist hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
