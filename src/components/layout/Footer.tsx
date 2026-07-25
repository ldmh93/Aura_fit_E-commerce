import Link from "next/link";
import { LogoMark } from "@/components/shared/Logo";
import { COLLECTIONS, BUSINESS, SITE } from "@/lib/config";

const help = [
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/envios", label: "Envíos y entregas" },
  { href: "/cambios", label: "Cambios y devoluciones" },
  { href: "/contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/8 bg-graphite/40">
      <div className="aura-glow left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2" />

      <div className="container-aura relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="w-36">
              <LogoMark size={144} />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
              {SITE.description}
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Colecciones</h3>
            <ul className="space-y-3">
              {COLLECTIONS.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/colecciones/${collection.slug}`}
                    className="text-sm text-mist transition-colors hover:text-white"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
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

          <div>
            <h3 className="eyebrow mb-5">Atención</h3>
            <p className="text-sm leading-relaxed text-mist">
              {BUSINESS.supportHours}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Envío gratis en compras mayores a{" "}
              <span className="text-silver">
                ${BUSINESS.freeShippingThreshold.toLocaleString("es-MX")} MXN
              </span>
              .
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Cambios dentro de {BUSINESS.returnWindowDays} días.
            </p>
          </div>
        </div>

        <div className="hairline my-12" />

        <div className="flex flex-col gap-4 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="transition-colors hover:text-white">
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
