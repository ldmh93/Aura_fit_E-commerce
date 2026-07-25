# AURA FIT STORE

Ecommerce premium de ropa deportiva **AURA FIT** — Performance Wear.
Tienda tipo Shopify personalizada, con checkout por WhatsApp y panel
administrativo privado.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Zustand · Supabase (PostgreSQL + Auth + Storage) · Vercel

## Arrancar

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

**La app funciona sin configuración.** Si no hay credenciales de Supabase,
los servicios usan el catálogo de demostración de `src/lib/mock-data.ts`.

## Configurar Supabase

1. Copia `.env.example` a `.env.local` y llena las variables.
2. En el SQL Editor de Supabase ejecuta, en orden:
   - `supabase/migrations/0001_init.sql` — tablas, trigger de stock y RLS
   - `supabase/migrations/0002_storage.sql` — bucket `productos` para las fotos
   - `supabase/seed.sql` (opcional, datos de arranque)
3. Crea el usuario administrador en **Authentication → Users**.

Con eso ya puedes subir las fotos de producto desde `/admin/productos`
(arrastrar y soltar). Se guardan en Supabase Storage y quedan ligadas al
producto — no hace falta tocar código.

Variables mínimas:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=5215500000000
NEXT_PUBLIC_SITE_URL=https://aurafit.com
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` va en formato internacional, sin `+` ni espacios.

## Rutas

| Ruta                   | Descripción                                  |
| ---------------------- | -------------------------------------------- |
| `/`                    | Home con hero, colecciones y destacados      |
| `/shop`                | Catálogo con filtros y orden                 |
| `/producto/[slug]`     | Detalle: galería, variantes, guía de tallas  |
| `/colecciones/[slug]`  | Landing por colección                        |
| `/admin`               | Dashboard (protegido)                        |
| `/admin/productos`     | CRUD de productos                            |
| `/admin/inventario`    | Existencias por talla y color                |
| `/admin/pedidos`       | Pedidos y cambio de estado                   |
| `/admin/cupones`       | Alta y activación de cupones                 |

El acceso a `/admin` está protegido por middleware (Supabase Auth) y por RLS
en la base de datos.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # tsc --noEmit
```

## Documentación del proyecto

El contexto completo vive en [`.claude/`](.claude/):

| Archivo                 | Contenido                                    |
| ----------------------- | -------------------------------------------- |
| `project-context.md`    | Visión general, stack, identidad, reglas     |
| `architecture.md`       | Estructura de carpetas y flujo de datos      |
| `design-system.md`      | Colores, tipografía, componentes, animación  |
| `database-schema.md`    | Tablas, RLS, índices                         |
| `development-rules.md`  | Reglas de código, seguridad, rendimiento     |
| `business-rules.md`     | Envíos, cambios, cupones, márgenes, tono     |
| `roadmap.md`            | Qué está hecho y qué falta                   |

## Deploy

Vercel. Configura las mismas variables de entorno en el proyecto y apunta el
dominio. `NEXT_PUBLIC_SITE_URL` debe ser el dominio final para que el sitemap
y las URLs canónicas salgan correctas.
