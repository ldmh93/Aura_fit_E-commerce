import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, MessageCircle, RefreshCw } from "lucide-react";
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
import { BUSINESS, DELIVERY, SITE } from "@/lib/config";
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

  const description = product.description.slice(0, 155);

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${SITE.name}`,
      description,
      url: `${SITE.url}/producto/${product.slug}`,
      images: product.images.slice(0, 2).map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE.name}`,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status === "oculto") notFound();

  const related = await getRelatedProducts(product, 4);
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
      {/*
        `JSON.stringify` no escapa "<": un nombre de producto que contuviera
        "</script>" cerraría la etiqueta e inyectaría HTML en la página.
        Escapar el carácter deja el JSON válido y cierra esa puerta.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* pb extra en móvil: la barra de compra fija ocupa la parte baja */}
      <div className="container-aura py-10 pb-28 md:py-14 md:pb-14">
        <nav aria-label="Ruta de navegación" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-mist">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Inicio
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" aria-hidden />
            {product.category_slug ? (
              <>
                <li>
                  <Link
                    href={`/categoria/${product.category_slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {product.category_name}
                  </Link>
                </li>
                <ChevronRight className="h-3 w-3" aria-hidden />
              </>
            ) : null}
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
              {product.category_name ? (
                <Badge tone="silver">{product.category_name}</Badge>
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

            <ProductPurchase product={product} />

            <div className="hairline my-8" />

            <div>
              <h2 className="eyebrow mb-4">Características</h2>
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

            {/* Cómo se entrega — sin envíos ni paqueterías */}
            <div className="mt-8 space-y-4 rounded-2xl border border-white/8 bg-graphite/50 p-5">
              <div className="flex gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-medium text-white">
                    {DELIVERY.method}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-mist">
                    {DELIVERY.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <RefreshCw
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-medium text-white">
                    Cambio de talla
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    Dentro de {BUSINESS.changeWindowDays} días, una vez por
                    pedido.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-medium text-white">
                    ¿Dudas antes de pedir?
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    Escríbenos por WhatsApp: {BUSINESS.supportHours}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="mt-20">
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
