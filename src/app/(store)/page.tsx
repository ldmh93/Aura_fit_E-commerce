import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Recycle, ShieldCheck, Truck, Zap } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import {
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
} from "@/services/products.service";
import { COLLECTIONS, BUSINESS } from "@/lib/config";

export const revalidate = 300;

const perks = [
  {
    icon: Zap,
    title: "Tejidos de rendimiento",
    text: "Compresión graduada, secado rápido y elasticidad multidireccional en cada pieza.",
  },
  {
    icon: Truck,
    title: "Envío gratis",
    text: `En compras mayores a $${BUSINESS.freeShippingThreshold.toLocaleString("es-MX")} MXN. Entrega en ${BUSINESS.deliveryEstimate}.`,
  },
  {
    icon: ShieldCheck,
    title: `${BUSINESS.returnWindowDays} días de cambio`,
    text: "Si la talla no fue la correcta, la cambiamos sin costo una vez por pedido.",
  },
  {
    icon: Recycle,
    title: "Materiales responsables",
    text: "Poliéster reciclado y algodón orgánico en gran parte de la colección.",
  },
];

export default async function HomePage() {
  const [featured, newArrivals, onSale] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(4),
    getSaleProducts(4),
  ]);

  return (
    <>
      <HeroSection />

      {/* Beneficios */}
      <section className="border-y border-white/8 bg-graphite/30">
        <div className="container-aura grid gap-7 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex gap-3">
              <perk.icon
                className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                aria-hidden
              />
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-white">
                  {perk.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-mist">
                  {perk.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Colecciones */}
      <section className="container-aura py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Colecciones"
            title="Encuentra tu línea"
            description="Cinco líneas construidas alrededor de una idea: que la ropa deje de ser un límite."
          />
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((collection, index) => (
            <RevealItem
              key={collection.slug}
              className={index === 0 ? "lg:col-span-2 lg:row-span-1" : ""}
            >
              <Link
                href={`/colecciones/${collection.slug}`}
                className="group relative block h-full overflow-hidden rounded-2xl border border-white/7 bg-graphite"
              >
                <div
                  className={
                    index === 0
                      ? "relative aspect-16/10 lg:aspect-21/9"
                      : "relative aspect-4/3"
                  }
                >
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover opacity-70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-void via-void/40 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="eyebrow mb-2">{collection.tagline}</p>
                  <h3 className="text-lg font-semibold uppercase tracking-tight text-white md:text-xl">
                    {collection.name}
                  </h3>
                  <p className="mt-2 max-w-md text-xs leading-relaxed text-mist line-clamp-2">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-silver transition-colors group-hover:text-aura">
                    Explorar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Destacados */}
      <section className="container-aura py-16 md:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Más vendidos"
            title="Productos destacados"
            description="Las piezas que la comunidad AURA repite pedido tras pedido."
            action={
              <LinkButton href="/shop" variant="secondary" size="sm">
                Ver todo
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </LinkButton>
            }
          />
        </Reveal>
        <div className="mt-12">
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Franja de marca */}
      <section className="relative overflow-hidden border-y border-white/8 py-20 md:py-24">
        <div className="aura-glow left-1/2 top-1/2 h-80 w-[42rem] -translate-x-1/2 -translate-y-1/2" />
        <Reveal className="container-aura relative text-center">
          <p className="eyebrow">Performance Wear</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-2xl font-semibold uppercase leading-tight tracking-tight text-white md:text-4xl">
            No vendemos ropa.{" "}
            <span className="text-metal">
              Construimos herramientas de rendimiento.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-mist">
            Cada corte, cada costura y cada gramo de tela responde a una
            pregunta: ¿esto te ayuda a entrenar mejor? Si la respuesta es no, no
            sale al mercado.
          </p>
        </Reveal>
      </section>

      {/* Nuevos */}
      <section className="container-aura py-20 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Recién llegado"
            title="Nuevos productos"
            action={
              <LinkButton href="/shop?sort=nuevo" variant="ghost" size="sm">
                Ver novedades
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </LinkButton>
            }
          />
        </Reveal>
        <div className="mt-12">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Ofertas */}
      {onSale.length ? (
        <section className="container-aura pb-24">
          <Reveal>
            <SectionHeading
              eyebrow="Ofertas"
              title="Últimas piezas con descuento"
              description="Precios reducidos mientras dure el inventario. No hay restock."
            />
          </Reveal>
          <div className="mt-12">
            <ProductGrid products={onSale} />
          </div>
        </section>
      ) : null}
    </>
  );
}
