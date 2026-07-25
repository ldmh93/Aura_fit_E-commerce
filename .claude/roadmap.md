# Roadmap — AURA FIT

## Fase 1 — Fundación ✅

- [x] Documentación de contexto en `.claude/`
- [x] Scaffold Next.js 15 + TypeScript + Tailwind v4
- [x] Design system y tokens de marca
- [x] Capa de servicios con fallback a datos mock

## Fase 2 — Tienda ✅

- [x] Layout global: Navbar, Footer, botón flotante de WhatsApp
- [x] Home premium: hero, colecciones, destacados
- [x] Catálogo `/shop` con filtros (categoría, género, talla, color, precio, stock)
- [x] Página de producto `/producto/[slug]` con galería, variantes y guía de tallas
- [x] Carrito con Zustand + persistencia en localStorage
- [x] Checkout por WhatsApp con mensaje pre-formateado

## Fase 3 — Administración ✅

- [x] Login de administrador con Supabase Auth
- [x] Middleware de protección de `/admin`
- [x] Dashboard con métricas y gráficas
- [x] CRUD de productos
- [x] Inventario por talla y color con alertas
- [x] Gestión de pedidos y estados
- [x] Módulo de cupones

## Fase 4 — Crecimiento ✅

- [x] Meta Pixel (ViewContent, AddToCart, InitiateCheckout, Purchase)
- [x] Google Analytics 4
- [x] Metadata dinámica, Open Graph, Twitter Cards
- [x] `sitemap.xml` y `robots.txt`
- [x] Migraciones SQL + seed + RLS

## Fase 5 — Pendiente

- [ ] Conectar proyecto real de Supabase y cargar catálogo real
- [ ] Subir fotografía de producto definitiva a Supabase Storage
- [ ] Configurar `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_GA_ID` reales
- [ ] Deploy en Vercel + dominio `aurafit.com`
- [ ] Optimización de Core Web Vitals con datos reales

## Hecho después de la Fase 4

- [x] Subida de fotos desde `/admin/productos` a Supabase Storage
      (bucket `productos`, ver `supabase/migrations/0002_storage.sql`)
- [x] Barra de compra fija en móvil en la página de producto
- [x] Tarjetas en lugar de tablas anchas en el admin móvil

## Futuras mejoras (arquitectura ya preparada)

- [ ] Mercado Pago
- [ ] Stripe
- [ ] Cuentas de cliente
- [ ] Wishlist
- [ ] Facturación
- [ ] Programa de puntos
- [ ] Suscripciones
- [ ] App móvil
