# Reglas de desarrollo — AURA FIT

## Antes de escribir código

1. Leer `project-context.md`, `architecture.md` y `design-system.md`.
2. Buscar si el componente o helper ya existe. **No duplicar.**
3. Si la tarea toca la base de datos, revisar `database-schema.md`.

## Código

- TypeScript estricto. Prohibido `any`; usar `unknown` + narrowing.
- Todo tipo de dominio vive en `src/types` y se importa desde ahí.
- Server Components por defecto. `"use client"` solo en hojas interactivas
  (carrito, filtros, galería, formularios).
- Mutaciones vía **Server Actions**, no API Routes, salvo webhooks.
- Ningún componente importa `@supabase/*`: todo pasa por `src/services`.
- Nombres en inglés para código; textos de UI en español (es-MX).
- Componentes en `PascalCase.tsx`, utilidades en `kebab-case.ts`.

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
- Formatos preferidos: AVIF/WebP. Nada de PNG pesados en producción.
- Videos de producto: `muted`, `playsInline`, `preload="none"`, con póster.

## Accesibilidad

- Contraste AA mínimo, foco visible, navegación por teclado en drawers y modales.
- `aria-label` en botones de solo icono.
- Respetar `prefers-reduced-motion`.

## Seguridad

- Secretos solo en `.env.local` / variables de Vercel. Jamás en el repo.
- `SUPABASE_SERVICE_ROLE_KEY` nunca se expone al cliente ni lleva prefijo
  `NEXT_PUBLIC_`.
- Validar y sanitizar toda entrada del usuario en Server Actions antes de tocar
  la base de datos.
- `/admin` protegido por middleware + RLS. Defensa en dos capas.

## Rendimiento

- Objetivo: LCP < 2.0s, CLS < 0.1 en móvil.
- `revalidatePath` tras cada mutación del admin.
- No cargar Framer Motion en componentes de servidor.

## Git

- Ramas: `feat/…`, `fix/…`, `chore/…`.
- Commits en imperativo y en español, cortos.
- No commitear `.env.local`, `node_modules`, `.next`.
