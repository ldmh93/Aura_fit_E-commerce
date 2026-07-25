import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { HeroSection } from "@/components/shared/HeroSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { getProducts } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { BUSINESS, DELIVERY } from "@/lib/config";

export const revalidate = 300;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />

      {/* Cómo funciona — lo primero que necesita saber alguien que no nos conoce */}
      <section className="border-y border-white/8 bg-graphite/30">
        <div className="container-aura grid gap-8 py-12 md:grid-cols-3">
          {DELIVERY.steps.map((step, index) => (
            <div key={step} className="flex gap-4">
              <span className="text-metal shrink-0 text-2xl font-semibold tabular">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-mist">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="container-aura py-16 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Reveal key={category.id}>
              <Link
                href={`/categoria/${category.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-white/7 bg-graphite"
              >
                <div className="relative aspect-16/10">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-void via-void/40 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h2 className="text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
                    {category.name}
                  </h2>
                  <p className="mt-2 max-w-sm text-xs leading-relaxed text-mist">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-silver transition-colors group-hover:text-aura">
                    Ver colección
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Catálogo completo — con pocos productos, se muestran todos */}
      <section className="container-aura pb-20 md:pb-24">
        <Reveal>
          <SectionHeading
            eyebrow="Catálogo"
            title="Lo que tenemos"
            description="Todo el inventario disponible, sin scroll infinito ni catálogos interminables."
            action={
              <LinkButton href="/shop" variant="secondary" size="sm">
                Ver con filtros
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </LinkButton>
            }
          />
        </Reveal>
        <div className="mt-12">
          <ProductGrid
            products={products}
            emptyMessage="Todavía no hay productos publicados."
          />
        </div>
      </section>

      {/* Entrega y contacto */}
      <section className="relative overflow-hidden border-t border-white/8 py-16 md:py-20">
        <div className="aura-glow left-1/2 top-1/2 h-72 w-[38rem] -translate-x-1/2 -translate-y-1/2" />

        <div className="container-aura relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow mb-3">Entrega</p>
            <h2 className="text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
              {DELIVERY.headline}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
              {DELIVERY.description}
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm text-mist">
                <MapPin className="h-4 w-4 shrink-0 text-aura" aria-hidden />
                Punto y horario se acuerdan contigo por WhatsApp
              </li>
              <li className="flex items-center gap-3 text-sm text-mist">
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                Cambio de talla dentro de {BUSINESS.changeWindowDays} días
              </li>
            </ul>
          </div>

          <div className="surface p-7 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-aura" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold uppercase tracking-tight text-white">
              ¿Dudas de talla o disponibilidad?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Escríbenos directo. Respondemos en horario de atención:{" "}
              {BUSINESS.supportHours}.
            </p>
            <LinkButton
              href={generalWhatsappUrl()}
              variant="aura"
              size="lg"
              className="mt-6 w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
