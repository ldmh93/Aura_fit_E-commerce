# Roadmap — AURA FIT

## Fase 1 — Fundación ✅

- [x] Documentación de contexto en `.claude/`
- [x] Next.js 15 + TypeScript + Tailwind v4
- [x] Design system y tokens de marca
- [x] Capa de servicios como única puerta a los datos

## Fase 2 — Tienda ✅

- [x] Layout global: Navbar con barra de aviso, Footer, botón de WhatsApp
- [x] Home simplificada para catálogo pequeño
- [x] Catálogo `/shop` con filtros ligeros
- [x] Categorías `/categoria/hombre` y `/categoria/mujer`
- [x] Ficha de producto con galería, variantes reales y guía de tallas
- [x] Carrito con Zustand + persistencia
- [x] Checkout por WhatsApp con punto de encuentro
- [x] Barra de compra fija en móvil

## Fase 3 — Panel administrativo ✅

- [x] Dashboard con avisos accionables, KPIs y gráfica
- [x] Estadísticas: ingresos por día y mes, ventas por categoría, top productos
- [x] Productos: alta, edición, búsqueda, mostrar/ocultar, eliminar
- [x] Categorías: CRUD con validación de productos asignados
- [x] Inventario: ajuste rápido ±1, cantidad exacta, alertas y búsqueda
- [x] Pedidos: filtro por estado, búsqueda, punto de encuentro y notas
- [x] Cupones: alta, activar/desactivar, eliminar
- [x] Ajustes de la tienda editables

## Fase 4 — Contenido y SEO ✅

- [x] Páginas: cómo comprar, entregas, guía de tallas, cambios, contacto
- [x] Metadata dinámica, Open Graph, Twitter Cards, JSON-LD de producto
- [x] `sitemap.xml` y `robots.txt`
- [x] Meta Pixel y GA4 (se activan solo con ID configurado)

## Fase 5 — Supabase 🔜 (siguiente)

- [ ] Crear proyecto y llenar `.env.local`
- [ ] Ejecutar `0001_init.sql` y `0002_storage.sql`
- [ ] Reescribir el interior de los seis servicios para leer de Supabase
- [ ] Mover los ajustes de `.data/settings.json` a `store_settings`
- [ ] Activar Supabase Auth en `/admin/login` y el middleware
- [ ] Subir la fotografía real de producto al bucket `productos`
- [ ] Cargar el catálogo real

## Fase 6 — Publicación

- [ ] Deploy en Vercel
- [ ] Dominio propio
- [ ] Configurar `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_GA_ID`
- [ ] Revisar Core Web Vitals con datos reales

## Futuras mejoras (arquitectura ya preparada)

- [ ] Mercado Pago / Stripe
- [ ] Cuentas de cliente
- [ ] Wishlist
- [ ] Programa de puntos
- [ ] App móvil

---

## Versiones guardadas

| Rama                 | Qué es                                                   |
| -------------------- | -------------------------------------------------------- |
| `main`               | Tienda simplificada para catálogo pequeño (actual)       |
| `diseno-v1-premium`  | Primera versión: 5 colecciones, filtros amplios, envíos  |
