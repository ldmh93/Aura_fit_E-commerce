import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ImageGallery } from "@/features/products/components/ImageGallery";
import { ProductPurchase } from "@/features/products/components/ProductPurchase";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/services/products.service";
import { BUSINESS, COLLECTIONS, SITE } from "@/lib/config";
import { discountPercent, formatPrice } from "@/utils";

export const revalidate = 120;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Producto no encontrado" };

  const title = product.name;
  const description = product.description.slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE.name}`,
      description,
      url: `${SITE.url}/producto/${product.slug}`,
      images: product.images.slice(0, 2).map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

/** Prendas inferiores usan otra tabla de medidas. */
function guideTypeFor(categoryName?: string): "superior" | "inferior" {
  const lower = (categoryName ?? "").toLowerCase();
  return ["shorts", "leggings", "joggers", "pants"].some((word) =>
    lower.includes(word),
  )
    ? "inferior"
    : "superior";
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status === "oculto") notFound();

  const related = await getRelatedProducts(product, 4);
  const collection = COLLECTIONS.find((c) => c.slug === product.collection);
  const discount = discountPercent(product.price, product.old_price);
  const soldOut = product.stock <= 0 || product.status === "agotado";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/producto/${product.slug}`,
      priceCurrency: "MXN",
      price: product.price,
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* pb extra en móvil: la barra de compra fija ocupa la parte baja */}
      <div className="container-aura py-10 pb-28 md:py-14 md:pb-14">
        {/* Migas */}
        <nav aria-label="Ruta de navegación" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Inicio
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <li>
              <Link href="/shop" className="transition-colors hover:text-white">
                Tienda
              </Link>
            </li>
            {collection ? (
              <>
                <ChevronRight className="h-3 w-3" aria-hidden />
                <li>
                  <Link
                    href={`/colecciones/${collection.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {collection.name}
                  </Link>
                </li>
              </>
            ) : null}
            <ChevronRight className="h-3 w-3" aria-hidden />
            <li className="text-silver">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ImageGallery
            images={product.images}
            video={product.video}
            name={product.name}
          />

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {collection ? (
                <Badge tone="silver">{collection.name}</Badge>
              ) : null}
              {discount > 0 ? <Badge tone="aura">−{discount}%</Badge> : null}
              {soldOut ? <Badge tone="muted">Agotado</Badge> : null}
            </div>

            <h1 className="text-3xl font-semibold uppercase tracking-tight text-white md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="tabular text-2xl font-semibold text-silver">
                {formatPrice(product.price)}
              </p>
              {product.old_price ? (
                <p className="tabular text-base text-mist line-through">
                  {formatPrice(product.old_price)}
                </p>
              ) : null}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-mist">
              {product.description}
            </p>

            <div className="hairline my-8" />

            <ProductPurchase
              product={product}
              guideType={guideTypeFor(product.category_name)}
            />

            <div className="hairline my-8" />

            {/* Características técnicas */}
            <div>
              <h2 className="eyebrow mb-4">Características técnicas</h2>
              <ul className="space-y-2.5">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm leading-relaxed text-mist"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aura"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Servicio */}
            <div className="mt-8 grid gap-4 rounded-2xl border border-white/8 bg-graphite/50 p-5 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Envío",
                  text: BUSINESS.deliveryEstimate,
                },
                {
                  icon: RefreshCw,
                  title: "Cambios",
                  text: `${BUSINESS.returnWindowDays} días`,
                },
                {
                  icon: ShieldCheck,
                  title: "Garantía",
                  text: "Contra defectos",
                },
              ].map((service) => (
                <div key={service.title} className="flex gap-3">
                  <service.icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                    aria-hidden
                  />
                  <div>
                    <p className="text-xs font-medium text-white">
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-xs text-mist">{service.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length ? (
          <section className="mt-24">
            <Reveal>
              <SectionHeading
                eyebrow="También te puede interesar"
                title="Completa tu equipo"
              />
            </Reveal>
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
