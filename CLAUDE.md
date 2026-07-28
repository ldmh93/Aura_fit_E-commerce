# AURA FIT STORE — Contexto del proyecto

> **Este archivo es la fuente principal de contexto.**
> Léelo primero y trabaja solo con los archivos que la tarea necesite.
> No recorras el proyecto completo si aquí está la información suficiente.

---

## Forma de trabajar

Cada vez que reciba una tarea:

1. Leer este archivo y `TASKS.md`.
2. Resumir en máximo 5 líneas el estado actual.
3. Indicar cuál es la siguiente tarea.
4. Hacer **únicamente** esa tarea.
5. Verificar que no rompa nada (`npm run typecheck` y `npm run build`).
6. Si aparece un problema importante, detenerse y explicarlo **antes** de
   tocar otras partes.
7. Actualizar `CLAUDE.md` y `TASKS.md` al terminar.

**Reglas de eficiencia**

- Minimizar contexto y tokens. No abrir carpetas completas.
- Solo inspeccionar archivos indispensables para la tarea.
- Si hace falta un archivo que no está listado aquí, decir cuál antes de
  explorar.
- Cambios pequeños y bien delimitados. Reutilizar lo que ya existe.
- Sin explicaciones largas salvo que se pidan.
- Sin refactorizaciones que nadie pidió.

**Commits**

- Al terminar una tarea completa, proponer mensaje en Conventional Commits.
- No hacer commits parciales salvo petición expresa.

**Ante la duda, preguntar antes de un cambio grande.**

---

## Descripción del proyecto

Tienda en línea de **AURA FIT**, proveedor pequeño de ropa deportiva.
Catálogo corto y curado, pedidos por WhatsApp, entrega en punto de encuentro.
Incluye panel administrativo completo.

**El negocio NO tiene** (nunca agregarlo a la interfaz): envíos a domicilio,
costos de envío, paqueterías, guías, direcciones de entrega, pasarela de pago,
cuentas de cliente, colecciones ni campo de género.
La única taxonomía es la categoría: **Hombre / Mujer**.

WhatsApp: **417 127 9042** (`524171279042` en formato internacional).

---

## Tecnologías

Next.js 15 (App Router) · React 19 · TypeScript estricto · Tailwind CSS v4 ·
Framer Motion · Zustand · Recharts · lucide-react · clsx

Supabase (PostgreSQL + Auth + Storage) · Vercel (pendiente de deploy)

```bash
npm run dev        # http://localhost:3000
npm run build
npm run typecheck  # tsc --noEmit
```

---

## Arquitectura

Feature Based. Detalle completo en `.claude/architecture.md`.

```
src/
├── app/
│   ├── (store)/     Tienda pública (Navbar + Footer)
│   └── admin/       Panel privado (layout propio)
├── components/      layout · ui · shared · analytics
├── features/        products · cart · admin
├── services/        ÚNICA puerta a los datos
├── lib/             config.ts · analytics · env · supabase/
├── types/           Tipos de dominio
└── utils/           formatPrice · slugify · sanitize · cn
```

**Flujo de datos**

```
Server Component  →  services/*.service.ts  →  Supabase
                                  ↑
Client Component  →  Server Action ┘
```

**Regla dura:** ningún componente lee datos directamente. Todo pasa por
`src/services`. `db.ts` expone `publicDb()` (llave pública, respeta RLS) y
`adminDb()` (llave secreta, omite RLS — solo panel y registro de pedidos).

---

## Reglas de código

1. Ningún componente lee datos directamente → `src/services`.
2. Server Components por defecto; `"use client"` solo en hojas interactivas.
3. Nada de `any`. TypeScript estricto.
4. Colores solo desde tokens (`bg-graphite`, `text-aura`, …). Sin hex en JSX.
5. Mobile first. Contraste AA. Foco visible.
6. Toda entrada de usuario se valida y sanea **en el servidor**.
7. Totales y descuentos se recalculan en la Server Action, nunca se confía
   en el cliente.
8. No instalar librerías sin justificar.

---

## Estado general

**Interfaz terminada y Supabase conectado.** Build y typecheck limpios.

Los datos salen de Supabase (proyecto `npbzjnbsxsvwqvjjwjwh`): 6 tablas,
trigger de stock, RLS activo y bucket `productos` para las fotos.
Catálogo cargado: 2 categorías, 9 productos, 115 variantes, 2 cupones.

**`/admin` ya exige sesión.** Falta crear el usuario administrador en
Supabase Auth; hasta entonces el panel redirige a `/admin/login`.

Publicado en GitHub: `ldmh93/Aura_fit_E-commerce` (repositorio **público**).
No hay nada desplegado en Vercel.

---

## Tareas completadas

- Documentación de contexto en `.claude/` (7 archivos)
- Design system con tokens de marca
- Tienda: home, `/shop`, `/categoria/[slug]`, `/producto/[slug]`
- Páginas: cómo comprar, entregas, guía de tallas, cambios, contacto,
  privacidad, términos
- Carrito con Zustand + checkout por WhatsApp con punto de encuentro
- Barra de compra fija en móvil; admin con tarjetas en lugar de tablas anchas
- Panel admin, 8 pantallas: dashboard, estadísticas, productos, categorías,
  inventario, pedidos, cupones, ajustes
- Subidor de fotos a Supabase Storage
- SEO: metadata dinámica, Open Graph, JSON-LD, sitemap, robots
- Meta Pixel y GA4 (se activan solo si hay ID)
- Simplificación para catálogo pequeño y eliminación total de envíos
- Talla Unitalla y paleta de 24 colores agrupada
- **Supabase conectado:** esquema, RLS, Storage y los 6 servicios migrados

## Tareas pendientes

Lista viva y priorizada en **`TASKS.md`**. Resumen:

1. Crear el usuario administrador en Supabase Auth ← siguiente
2. Cargar catálogo y fotografía reales
3. Deploy en Vercel
4. Rotar la llave secreta (se compartió por chat durante la configuración)

---

## Última tarea realizada

**2026-07-25 — Conectar Supabase**

Esquema ejecutado (6 tablas, trigger de stock, RLS, bucket `productos`).
Los seis servicios ahora leen y escriben en Supabase; se eliminó
`mock-data.ts`. Catálogo cargado: 9 productos con fotos y 115 variantes.
Corregido en el camino: el trigger necesitaba `::product_status` explícito,
y `publicDb()` cae a un cliente sin cookies fuera de una petición.

## Próximo objetivo

**Crear el usuario administrador.** El middleware ya bloquea `/admin`; sin
usuario en Supabase Auth no se puede entrar al panel.

---

## Archivos importantes

| Archivo | Para qué |
| --- | --- |
| `src/lib/config.ts` | Marca, WhatsApp, entrega, tallas, colores, navegación |
| `src/services/db.ts` | Clientes de Supabase: publicDb() y adminDb() |
| `src/types/index.ts` | Todos los tipos de dominio |
| `src/services/products.service.ts` | Lectura y mutaciones de catálogo |
| `src/services/orders.service.ts` | Pedidos y estadísticas del dashboard |
| `src/services/settings.service.ts` | Ajustes editables de la tienda |
| `src/features/admin/actions.ts` | Todas las Server Actions del panel |
| `src/features/cart/store.ts` | Estado del carrito (Zustand) |
| `src/features/cart/whatsapp.ts` | Mensaje de pedido |
| `src/app/globals.css` | Tokens de diseño |
| `supabase/migrations/0001_init.sql` | Esquema destino |

**Documentación de apoyo** (abrir solo si la tarea lo requiere):
`.claude/architecture.md` · `design-system.md` · `database-schema.md` ·
`development-rules.md` · `business-rules.md` · `roadmap.md`

---

## Decisiones técnicas tomadas

| Decisión | Motivo |
| --- | --- |
| Una sola taxonomía (categoría) | `collection` + `gender` + `category` era la misma información tres veces |
| `ProductCard` es Server Component | La tienda no carga JS de carrito para mostrar el catálogo |
| Talla y color solo en la ficha | En la tarjeta habría que adivinar la existencia de la variante |
| Recharts con `next/dynamic` | Dashboard bajó de 105 kB a 1.4 kB; la tienda no lo incluye |
| `products.stock` es derivado | Se calcula del inventario; nunca se escribe desde el formulario |
| Servicios sin Supabase por ahora | El cliente pidió terminar interfaz primero; evita código a medias |
| Fotos con URL de Unsplash | Datos de muestra hasta tener fotografía propia |
| Grupo de rutas `(store)` | Separa el chrome de la tienda del layout del panel |
| Rama `diseno-v1-premium` | Conserva el primer diseño como alternativa |

---

## Problemas conocidos

| Problema | Impacto | Solución |
| --- | --- | --- |
| `/admin` sin autenticación | **Alto** — no publicar así | Supabase Auth |
| Ajustes en archivo local | No funciona en Vercel (FS de solo lectura) | Tabla `store_settings` |
| Mutaciones en memoria | Se pierden al reiniciar el servidor | Supabase |
| Fotos de Unsplash | No son prendas AURA FIT | Fotografía real en Storage |
| Favicon de 1.5 MB | Peso innecesario | Exportar `.ico` o PNG 64px |
| Repositorio público | WhatsApp y datos visibles | Decisión del cliente |

---

## Ideas para mejoras futuras

- Mercado Pago o Stripe
- Cuentas de cliente y wishlist
- Programa de puntos
- Historial de movimientos de inventario
- Exportar pedidos a CSV
- Notificación al admin cuando entra un pedido
- App móvil

---

## Historial de cambios

> Solo las últimas entradas. El historial completo está en `git log`.

**2026-07-25 · Simplificación para catálogo pequeño** (`9d2aec8`)
Eliminados envíos, colecciones y campo de género. Home simplificada.
Panel admin ampliado a 8 pantallas. Corregidos: bug de stock en el agregado
rápido, desajuste de hidratación en el contador del carrito, colisión en
`variantKey` y `sanitizeText` que borraba saltos de línea.

**2026-07-25 · Versión 1 premium** (`56c71ee`, rama `diseno-v1-premium`)
Primera versión completa: 5 colecciones, filtros amplios, envíos con umbral
de envío gratis.
