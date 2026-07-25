"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { COLLECTIONS, SIZES } from "@/lib/config";
import type { Category } from "@/types";
import { cn } from "@/utils";

const GENDERS = [
  { value: "hombre", label: "Hombre" },
  { value: "mujer", label: "Mujer" },
  { value: "unisex", label: "Unisex" },
];

const PRICE_RANGES = [
  { value: "0-500", label: "Hasta $500" },
  { value: "500-800", label: "$500 – $800" },
  { value: "800-1200", label: "$800 – $1,200" },
  { value: "1200-99999", label: "Más de $1,200" },
];

const COLORS = ["Negro", "Gris", "Azul", "Plata"];

const SORTS = [
  { value: "nuevo", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
];

export function ProductFilter({
  categories,
  total,
}: {
  categories: Category[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const get = (key: string) => searchParams.get(key) ?? "";
  const activeCount = [
    "category",
    "collection",
    "gender",
    "size",
    "color",
    "price",
    "stock",
  ].filter((key) => searchParams.get(key)).length;

  const priceValue =
    get("min") && get("max") ? `${get("min")}-${get("max")}` : "";

  function setPrice(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("min");
      params.delete("max");
    } else {
      const [min, max] = value.split("-");
      params.set("min", min ?? "0");
      params.set("max", max ?? "999999");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const filters = (
    <div className="space-y-6">
      <FilterBlock label="Categoría">
        <Chip
          active={!get("category")}
          onClick={() => setParam("category", null)}
        >
          Todas
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
      </FilterBlock>

      <FilterBlock label="Colección">
        <Chip
          active={!get("collection")}
          onClick={() => setParam("collection", null)}
        >
          Todas
        </Chip>
        {COLLECTIONS.map((collection) => (
          <Chip
            key={collection.slug}
            active={get("collection") === collection.slug}
            onClick={() => setParam("collection", collection.slug)}
          >
            {collection.name.replace("AURA ", "")}
          </Chip>
        ))}
      </FilterBlock>

      <FilterBlock label="Género">
        <Chip active={!get("gender")} onClick={() => setParam("gender", null)}>
          Todos
        </Chip>
        {GENDERS.map((gender) => (
          <Chip
            key={gender.value}
            active={get("gender") === gender.value}
            onClick={() => setParam("gender", gender.value)}
          >
            {gender.label}
          </Chip>
        ))}
      </FilterBlock>

      <FilterBlock label="Talla">
        <Chip active={!get("size")} onClick={() => setParam("size", null)}>
          Todas
        </Chip>
        {SIZES.map((size) => (
          <Chip
            key={size}
            active={get("size") === size}
            onClick={() => setParam("size", size)}
          >
            {size}
          </Chip>
        ))}
      </FilterBlock>

      <FilterBlock label="Color">
        <Chip active={!get("color")} onClick={() => setParam("color", null)}>
          Todos
        </Chip>
        {COLORS.map((color) => (
          <Chip
            key={color}
            active={get("color") === color}
            onClick={() => setParam("color", color)}
          >
            {color}
          </Chip>
        ))}
      </FilterBlock>

      <FilterBlock label="Precio">
        <Chip active={!priceValue} onClick={() => setPrice("")}>
          Todos
        </Chip>
        {PRICE_RANGES.map((range) => (
          <Chip
            key={range.value}
            active={priceValue === range.value}
            onClick={() => setPrice(range.value)}
          >
            {range.label}
          </Chip>
        ))}
      </FilterBlock>

      <FilterBlock label="Disponibilidad">
        <Chip
          active={get("stock") === "1"}
          onClick={() => setParam("stock", get("stock") === "1" ? null : "1")}
        >
          Solo con stock
        </Chip>
      </FilterBlock>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-2 text-xs text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros ({activeCount})
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Barra superior */}
      <div className="col-span-full mb-2 flex items-center justify-between gap-4 border-b border-white/8 pb-5">
        <p className="tabular text-xs text-mist">
          {total} {total === 1 ? "producto" : "productos"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:border-aura hover:text-aura lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {activeCount ? (
              <span className="tabular text-aura">({activeCount})</span>
            ) : null}
          </button>

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

      {/* Escritorio */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filters}</div>
      </aside>

      {/* Móvil */}
      {open ? (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col border-r border-white/8 bg-void">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.24em]">
                Filtros
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar filtros"
                className="text-mist hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="eyebrow mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
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
