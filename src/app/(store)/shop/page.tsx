import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductFilter } from "@/features/products/components/ProductFilter";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getProducts } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import type { Gender, ProductFilters, Size } from "@/types";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Explora toda la colección AURA FIT: playeras de compresión, leggings, shorts, hoodies y más. Ropa deportiva premium con envío a todo México.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const filters: ProductFilters = {
    category: first(params.category),
    collection: first(params.collection),
    gender: first(params.gender) as Gender | undefined,
    size: first(params.size) as Size | undefined,
    color: first(params.color),
    minPrice: params.min ? Number(first(params.min)) : undefined,
    maxPrice: params.max ? Number(first(params.max)) : undefined,
    inStock: first(params.stock) === "1",
    search: first(params.q),
    sort: first(params.sort) as ProductFilters["sort"],
  };

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="container-aura py-14 md:py-20">
      <header className="mb-10">
        <p className="eyebrow mb-3">Catálogo completo</p>
        <h1 className="text-4xl font-semibold uppercase tracking-tight text-white md:text-5xl">
          Tienda
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">
          Toda la colección AURA FIT en un solo lugar. Filtra por línea, talla,
          color o disponibilidad.
        </p>
      </header>

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[230px_1fr]">
        <Suspense fallback={<GridSkeleton />}>
          <ProductFilter categories={categories} total={products.length} />
        </Suspense>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="shimmer aspect-4/5 rounded-2xl bg-graphite" />
          <div className="shimmer h-3 w-2/3 rounded bg-graphite" />
          <div className="shimmer h-3 w-1/3 rounded bg-graphite" />
        </div>
      ))}
    </div>
  );
}
