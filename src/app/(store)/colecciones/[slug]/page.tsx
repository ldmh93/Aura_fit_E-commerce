import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getProducts } from "@/services/products.service";
import { COLLECTIONS, SITE } from "@/lib/config";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = COLLECTIONS.find((c) => c.slug === slug);

  if (!collection) return { title: "Colección no encontrada" };

  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: `/colecciones/${collection.slug}` },
    openGraph: {
      title: `${collection.name} | ${SITE.name}`,
      description: collection.description,
      images: [{ url: collection.image }],
    },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = COLLECTIONS.find((c) => c.slug === slug);

  if (!collection) notFound();

  const products = await getProducts({ collection: collection.slug });

  return (
    <>
      <header className="relative overflow-hidden">
        <div className="relative h-[46vh] min-h-80 w-full">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-linear-to-t from-void via-void/60 to-void/30" />
        </div>

        <div className="container-aura absolute inset-x-0 bottom-0 pb-10">
          <p className="eyebrow mb-3">{collection.tagline}</p>
          <h1 className="text-4xl font-semibold uppercase tracking-tight text-white md:text-6xl">
            {collection.name}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
            {collection.description}
          </p>
        </div>
      </header>

      <div className="container-aura py-14 md:py-20">
        <div className="mb-8 flex items-center justify-between border-b border-white/8 pb-5">
          <p className="tabular text-xs text-mist">
            {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <ProductGrid
          products={products}
          emptyMessage="Todavía no hay piezas publicadas en esta colección."
        />
      </div>
    </>
  );
}
