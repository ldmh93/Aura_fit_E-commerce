import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductFilter } from "@/features/products/components/ProductFilter";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getProducts } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import { DELIVERY } from "@/lib/config";
import type { ProductFilters, Size } from "@/types";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo completo de AURA FIT. Ropa deportiva para hombre y mujer. Pide por WhatsApp y recoge en punto de encuentro.",
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
    size: first(params.size) as Size | undefined,
    color: first(params.color),
    inStock: first(params.stock) === "1",
    search: first(params.q),
    sort: first(params.sort) as ProductFilters["sort"],
  };

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="container-aura py-12 md:py-16">
      <header className="mb-10">
        <p className="eyebrow mb-3">Catálogo</p>
        <h1 className="text-4xl font-semibold uppercase tracking-tight text-white md:text-5xl">
          Productos
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">
          {DELIVERY.description}
        </p>
      </header>

      <Suspense fallback={null}>
        <ProductFilter categories={categories} total={products.length} />
      </Suspense>

      <ProductGrid products={products} />
    </div>
  );
}
