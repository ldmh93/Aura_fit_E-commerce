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
│   ├── products.service.ts     # Lectura + mutaciones de catálogo
│   ├── categories.service.ts
│   ├── inventory.service.ts
│   ├── orders.service.ts       # Pedidos + estadísticas
│   ├── coupons.service.ts
│   └── settings.service.ts     # Ajustes editables de la tienda
│
├── lib/
│   ├── config.ts               # Marca, WhatsApp, entrega, tallas, colores
│   ├── mock-data.ts            # Catálogo actual (pre-Supabase)
│   ├── analytics.ts
│   ├── env.ts
│   └── supabase/               # Clientes listos para la siguiente fase
│
├── hooks/
├── types/                      # Tipos de dominio compartidos
└── utils/                      # formatPrice, slugify, sanitize, cn
```

## Flujo de datos

```
Server Component  →  services/*.service.ts  →  mock-data / settings.json
                                    ↑
Client Component  →  Server Action  ┘
```

**Regla dura:** ningún componente lee datos directamente. Todo pasa por
`src/services`. Por eso conectar Supabase solo tocará esos seis archivos.

## Estado de los datos

| Dato               | Hoy                     | Después              |
| ------------------ | ----------------------- | -------------------- |
| Productos          | `lib/mock-data.ts`      | tabla `products`     |
| Categorías         | `lib/mock-data.ts`      | tabla `categories`   |
| Inventario         | `lib/mock-data.ts`      | tabla `inventory`    |
| Pedidos            | `lib/mock-data.ts`      | tabla `orders`       |
| Cupones            | `lib/mock-data.ts`      | tabla `coupons`      |
| Ajustes            | `.data/settings.json`   | `store_settings`     |
| Fotos              | URLs externas           | Supabase Storage     |

Las mutaciones en memoria duran mientras viva el proceso del servidor: en
desarrollo se reinician con cada recarga completa. Es lo esperado hasta
conectar Supabase.

## Rendimiento

- Server Components por defecto; `"use client"` acotado a hojas.
- `ProductCard` es Server Component: la tienda no carga JavaScript de carrito
  para mostrar el catálogo.
- Recharts se carga con `next/dynamic` desde
  `features/admin/components/charts.tsx`: nunca entra al bundle de la tienda.
- `next/image` siempre, con `sizes` correcto.
- `revalidatePath("/", "layout")` tras cada mutación del panel.
