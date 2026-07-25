# Reglas de desarrollo — AURA FIT

## Antes de escribir código

1. Leer `project-context.md`, `architecture.md` y `design-system.md`.
2. Buscar si el componente o helper ya existe. **No duplicar.**
3. Si la tarea toca datos, revisar `database-schema.md`.
4. Si la tarea toca precios, entregas o cupones, revisar `business-rules.md`.

## Lo que este negocio no tiene

No introducir en la interfaz, aunque parezca "lo normal en un ecommerce":

- Costos de envío, paqueterías, guías o direcciones de entrega
- Cálculos de "envío gratis a partir de…"
- Pasarela de pago
- Registro de clientes
- Colecciones o campo de género (la taxonomía es solo la categoría)

## Código

- TypeScript estricto. Prohibido `any`; usar `unknown` + narrowing.
- Los tipos de dominio viven en `src/types` y se importan desde ahí.
- Server Components por defecto. `"use client"` solo en hojas interactivas
  (carrito, filtros, galería, formularios del panel).
- Mutaciones vía **Server Actions**, no API Routes.
- Ningún componente lee datos directamente: todo pasa por `src/services`.
- Nombres en inglés para el código; textos de interfaz en español (es-MX).
- Componentes en `PascalCase.tsx`, utilidades en `kebab-case.ts`.

## Validación

- Toda entrada de usuario se valida y sanea **en el servidor** antes de tocar
  los datos. `sanitizeText`, `sanitizePhone` y `slugify` están en `src/utils`.
- Nunca confiar en un total o un descuento calculado en el cliente: se
  recalculan en la Server Action.

## Dependencias

- **No instalar librerías sin justificar.** El stack aprobado es:
  next, react, typescript, tailwindcss, framer-motion, zustand,
  @supabase/supabase-js, @supabase/ssr, lucide-react, recharts, clsx.
- Nada de librerías de UI pesadas (MUI, Chakra, Bootstrap).

## Estilos

- Solo Tailwind + tokens de `globals.css`. Nada de hex sueltos en JSX:
  usar `bg-graphite`, `text-silver`, `text-aura`, etc.
- Mobile first: escribir la versión móvil y luego `md:` / `lg:`.
- No modificar el design system sin actualizar `design-system.md`.

## Imágenes y media

- Siempre `next/image` con `sizes` y `alt` reales.
- Formatos preferidos: AVIF/WebP.
- Videos: `muted`, `playsInline`, `preload="none"`, con póster.

## Accesibilidad

- Contraste AA mínimo, foco visible, navegación por teclado en drawers.
- `aria-label` en botones de solo icono.
- Respetar `prefers-reduced-motion`.

## Rendimiento

- Objetivo: LCP < 2.0s, CLS < 0.1 en móvil.
- Nada pesado en el bundle de la tienda: las gráficas del panel se cargan con
  `next/dynamic` (ver `features/admin/components/charts.tsx`).
- `revalidatePath("/", "layout")` tras cada mutación del panel.

## Seguridad

- Secretos solo en `.env.local` / variables de Vercel. Jamás en el repo.
- `SUPABASE_SERVICE_ROLE_KEY` nunca lleva prefijo `NEXT_PUBLIC_`.
- `/admin` quedará protegido por middleware + RLS cuando se conecte Supabase.
  **Hoy el panel está abierto en local:** no publicar sin ese paso.

## Git

- Ramas: `feat/…`, `fix/…`, `chore/…`.
- Commits en imperativo y en español, cortos.
- No commitear `.env.local`, `node_modules`, `.next`, `.data`.
