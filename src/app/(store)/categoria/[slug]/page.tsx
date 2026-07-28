import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductFilter } from "@/features/products/components/ProductFilter";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getCatalogFacets, getProducts } from "@/services/products.service";
import { getCategories, getCategoryBySlug } from "@/services/categories.service";
import { SITE } from "@/lib/config";
import type { ProductFilters, Size } from "@/types";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.name} | ${SITE.name}`,
      description: category.description,
      images: [{ url: category.image }],
    },
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category || !category.active) notFound();

  const filters: ProductFilters = {
    category: category.slug,
    size: first(query.size) as Size | undefined,
    color: first(query.color),
    inStock: first(query.stock) === "1",
    sort: first(query.sort) as ProductFilters["sort"],
  };

  const [products, categories, facets] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getCatalogFacets(category.slug),
  ]);

  return (
    <>
      <header className="relative overflow-hidden">
        <div className="relative h-56 w-full md:h-72">
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-t from-void via-void/70 to-void/40" />
        </div>

        <div className="container-aura absolute inset-x-0 bottom-0 pb-8">
          <h1 className="text-4xl font-semibold uppercase tracking-tight text-white md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
            {category.description}
          </p>
        </div>
      </header>

      <div className="container-aura py-12 md:py-16">
        <Suspense fallback={null}>
          <ProductFilter
            categories={categories}
            colors={facets.colors}
            sizes={facets.sizes}
            total={products.length}
            showCategories={false}
          />
        </Suspense>

        <ProductGrid
          products={products}
          emptyMessage="No hay productos con esos filtros en esta categoría."
        />
      </div>
    </>
  );
}
