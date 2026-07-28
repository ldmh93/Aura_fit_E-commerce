import Link from "next/link";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/shared/Logo";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";
import { BUSINESS, DELIVERY, SITE, WHATSAPP } from "@/lib/config";
import { getCategories } from "@/services/categories.service";

const help = [
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/entregas", label: "Entregas" },
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/cambios", label: "Cambios" },
  { href: "/contacto", label: "Contacto" },
];

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/8 bg-graphite/40">
      <div className="aura-glow left-1/2 top-0 h-64 w-[32rem] -translate-x-1/2 -translate-y-1/2" />

      <div className="container-aura relative py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="w-40">
              <LogoMark size={160} />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              {SITE.description}
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Catálogo</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="text-sm text-mist transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-mist transition-colors hover:text-white"
                >
                  Ver todo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Ayuda</h3>
            <ul className="space-y-3">
              {help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-mist transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entrega y contacto — la información que más se busca */}
          <div>
            <h3 className="eyebrow mb-5">Entrega y contacto</h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-mist">
                  {DELIVERY.description}
                </p>
              </div>

              <div className="flex gap-3">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <a
                  href={generalWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-silver transition-colors hover:text-aura"
                >
                  WhatsApp {WHATSAPP.display}
                </a>
              </div>

              <div className="flex gap-3">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-aura"
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-mist">
                  {BUSINESS.supportHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-4 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Todos los derechos
            reservados.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/privacidad"
              className="transition-colors hover:text-white"
            >
              Aviso de privacidad
            </Link>
            <Link href="/terminos" className="transition-colors hover:text-white">
              Términos
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white">
              Administración
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
