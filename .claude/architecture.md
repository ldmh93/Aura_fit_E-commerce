# Arquitectura — AURA FIT

## Principio

**Feature Based Architecture.** Cada dominio vive en su carpeta dentro de
`src/features`. `src/components` es solo para lo verdaderamente global.

## Estructura

```
src/
├── app/
│   ├── layout.tsx              # Raíz: fuente, metadata, Pixel, GA4
│   ├── globals.css             # Tokens de diseño + Tailwind v4
│   ├── (store)/                # Tienda pública — con Navbar y Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home
│   │   ├── shop/               # Catálogo con filtros
│   │   ├── categoria/[slug]/   # Hombre · Mujer
│   │   ├── producto/[slug]/    # Ficha de producto
│   │   ├── como-comprar/
│   │   ├── entregas/
│   │   ├── guia-de-tallas/
│   │   ├── cambios/
│   │   ├── contacto/
│   │   ├── privacidad/
│   │   └── terminos/
│   ├── admin/                  # Panel privado — su propio layout
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── estadisticas/
│   │   ├── productos/          # Lista · nuevo · [id]
│   │   ├── categorias/
│   │   ├── inventario/
│   │   ├── pedidos/
│   │   ├── cupones/
│   │   ├── ajustes/
│   │   └── login/
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── layout/                 # Navbar, Footer
│   ├── ui/                     # Button, Badge, Field
│   ├── analytics/              # MetaPixel, GoogleAnalytics
│   └── shared/                 # HeroSection, Logo, Reveal, InfoPage…
│
├── features/
│   ├── products/components/    # ProductCard, ProductGrid, ProductFilter,
│   │                           # ImageGallery, ProductPurchase, SizeGuide
│   ├── cart/
│   │   ├── components/         # CartDrawer
│   │   ├── store.ts            # Zustand + persist
│   │   ├── whatsapp.ts         # Generador del mensaje de pedido
│   │   └── actions.ts          # Server Actions de checkout
│   └── admin/
│       ├── actions.ts          # Server Actions del panel
│       ├── auth.actions.ts
│       ├── upload.actions.ts
│       └── components/         # AdminShell, AdminUI, formularios, charts
│
├── services/                   # Capa de datos — única puerta
│   ├── db.ts                   # publicDb() y adminDb()
│   ├── products.service.ts     # Lectura + mutaciones de catálogo
│   ├── categories.service.ts
│   ├── inventory.service.ts
│   ├── orders.service.ts       # Pedidos + estadísticas
│   ├── coupons.service.ts
│   └── settings.service.ts     # Ajustes editables de la tienda
│
├── lib/
│   ├── config.ts               # Marca, WhatsApp, entrega, tallas, colores
│   ├── analytics.ts
│   ├── env.ts
│   └── supabase/               # Clientes de navegador, servidor y admin
│
├── hooks/
├── types/                      # Tipos de dominio compartidos
└── utils/                      # formatPrice, slugify, sanitize, cn
```

## Flujo de datos

```
Server Component  →  services/*.service.ts  →  Supabase
                                    ↑
Client Component  →  Server Action  ┘
```

**Regla dura:** ningún componente lee datos directamente. Todo pasa por
`src/services`. Gracias a eso, conectar Supabase solo tocó esos archivos.

## Los dos permisos de Supabase

`src/services/db.ts` expone dos clientes y la diferencia importa:

| Cliente      | Llave      | RLS      | Para qué                                   |
| ------------ | ---------- | -------- | ------------------------------------------ |
| `publicDb()` | publishable| Se aplica| Toda la tienda y la validación de cupones  |
| `adminDb()`  | secret     | Se omite | Panel `/admin` y registro de pedidos       |

`publicDb()` usa cookies para leer la sesión. Cuando se llama fuera de una
petición —`generateStaticParams`, `sitemap.ts`— cae a un cliente sin cookies:
ahí no hay sesión que leer y lo que se prerenderiza es contenido público.

`adminDb()` se usa en el panel por dos razones: necesita ver los productos
ocultos (que RLS esconde) y registra los pedidos de clientes anónimos.
Vive solo en el servidor y nunca llega al navegador.

## Dónde vive cada dato

| Dato        | Tabla / lugar                    |
| ----------- | -------------------------------- |
| Productos   | `products`                       |
| Categorías  | `categories`                     |
| Inventario  | `inventory` (+ trigger de stock) |
| Pedidos     | `orders`                         |
| Cupones     | `coupons`                        |
| Ajustes     | `store_settings` (una sola fila) |
| Fotos       | Storage, bucket `productos`      |

## Rendimiento

- Server Components por defecto; `"use client"` acotado a hojas.
- `ProductCard` es Server Component: la tienda no carga JavaScript de carrito
  para mostrar el catálogo.
- Recharts se carga con `next/dynamic` desde
  `features/admin/components/charts.tsx`: nunca entra al bundle de la tienda.
- `next/image` siempre, con `sizes` correcto.
- `revalidatePath("/", "layout")` tras cada mutación del panel.
