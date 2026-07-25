# Arquitectura — AURA FIT

## Principio

**Feature Based Architecture.** Cada dominio de negocio vive en su propia
carpeta dentro de `src/features` con sus componentes, hooks, tipos y lógica.
`src/components` es solo para lo verdaderamente global y reutilizable.

## Estructura

```
src/
├── app/                        # Rutas (App Router)
│   ├── layout.tsx              # Layout raíz: fuentes, Navbar, Footer, Pixel, GA4
│   ├── page.tsx                # Home
│   ├── globals.css             # Tokens de diseño + Tailwind v4
│   ├── shop/                   # Catálogo con filtros
│   ├── producto/[slug]/        # Detalle de producto
│   ├── colecciones/[slug]/     # Landing por colección
│   ├── carrito/                # Vista de carrito completa
│   ├── admin/                  # Panel privado (protegido por middleware)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── productos/
│   │   ├── inventario/
│   │   ├── pedidos/
│   │   ├── cupones/
│   │   └── login/
│   ├── api/                    # Solo webhooks / endpoints no-Server-Action
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/                 # Componentes globales
│   ├── layout/                 # Navbar, Footer, MobileMenu
│   ├── ui/                     # Button, Badge, Input, Select, Modal, Skeleton
│   ├── analytics/              # MetaPixel, GoogleAnalytics
│   └── shared/                 # WhatsAppButton, SectionHeading, Reveal
│
├── features/                   # Lógica por dominio
│   ├── products/
│   │   ├── components/         # ProductCard, ProductGrid, ProductFilter,
│   │   │                       # ImageGallery, SizeGuide, VariantPicker
│   │   ├── actions.ts          # Server Actions (CRUD admin)
│   │   └── utils.ts
│   ├── cart/
│   │   ├── components/         # CartDrawer, CartLine, CartSummary
│   │   ├── store.ts            # Zustand + persist
│   │   └── whatsapp.ts         # Generador del mensaje de pedido
│   ├── orders/
│   ├── inventory/
│   ├── coupons/
│   └── admin/
│       └── components/         # AdminSidebar, DashboardCard, charts
│
├── services/                   # Acceso a datos (única puerta a Supabase)
│   ├── products.service.ts
│   ├── orders.service.ts
│   ├── inventory.service.ts
│   ├── coupons.service.ts
│   └── categories.service.ts
│
├── lib/                        # Configuración e infraestructura
│   ├── supabase/               # client.ts, server.ts, admin.ts, middleware.ts
│   ├── config.ts               # Config de marca, WhatsApp, colecciones
│   ├── env.ts                  # Lectura y validación de variables de entorno
│   └── mock-data.ts            # Fallback sin Supabase
│
├── hooks/                      # Hooks globales (useMediaQuery, useDebounce…)
├── types/                      # Tipos de dominio compartidos
├── utils/                      # Helpers puros (formatPrice, slugify, cn)
└── styles/                     # CSS auxiliar si hace falta
```

## Flujo de datos

```
Server Component  →  services/*.service.ts  →  Supabase (o mock-data)
                                    ↑
Client Component  →  Server Action  ┘
```

**Regla dura:** ningún componente importa `@supabase/*` directamente.
Todo pasa por `src/services`. Esto permite cambiar de backend sin tocar la UI.

## Clientes de Supabase

| Archivo                       | Uso                                                        |
| ----------------------------- | ---------------------------------------------------------- |
| `lib/supabase/client.ts`      | Browser, con anon key. Solo lectura pública.               |
| `lib/supabase/server.ts`      | Server Components / Actions, con cookies de sesión.        |
| `lib/supabase/admin.ts`       | Service role. **Nunca** importar desde código de cliente.  |
| `lib/supabase/middleware.ts`  | Refresco de sesión y guard de `/admin`.                    |

## Rendimiento

- Server Components por defecto; `"use client"` acotado a hojas del árbol.
- `next/image` siempre, con `sizes` correcto.
- Revalidación: `revalidatePath` tras mutaciones del admin.
- Catálogo cacheado; el stock se lee fresco en la página de producto.

## Fallback sin Supabase

Si faltan `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
los servicios devuelven datos de `lib/mock-data.ts`. Esto mantiene la app
ejecutable en local y en previews sin configuración.
