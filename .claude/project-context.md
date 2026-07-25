# AURA FIT STORE — Contexto Principal del Proyecto

> **Leer este archivo primero.** Es el "cerebro" del proyecto. Antes de modificar
> grandes partes del sistema, consultar también `architecture.md`,
> `design-system.md`, `database-schema.md`, `development-rules.md`,
> `business-rules.md` y `roadmap.md`.

---

## Descripción

AURA FIT es una marca premium de ropa deportiva (Performance Wear).
El proyecto consiste en un ecommerce personalizado estilo Shopify construido con
Next.js 15, con checkout por WhatsApp y panel administrativo privado.

No es solo una tienda: es el ecosistema digital oficial de la marca.

## Objetivo

Los clientes deben poder:

- Explorar la colección de ropa deportiva
- Consultar precios en MXN
- Revisar descripción y características técnicas del producto
- Ver disponibilidad de stock real (por talla y color)
- Seleccionar talla y color
- Agregar al carrito **sin registrarse**
- Enviar su pedido por WhatsApp
- Comprar de forma rápida y sencilla

El administrador debe poder gestionar productos, inventario, pedidos, cupones y
ver métricas del negocio desde `/admin`.

---

## Stack tecnológico

**Frontend**

- Next.js 15 (App Router)
- React 19
- TypeScript (modo estricto)
- Tailwind CSS v4 (configuración CSS-first en `src/app/globals.css`)
- Framer Motion (animaciones)
- Zustand (estado del carrito, persistido en localStorage)

**Backend**

- Next.js Server Actions
- API Routes (solo cuando Server Actions no aplican: webhooks, sitemap, etc.)

**Base de datos**

- Supabase PostgreSQL

**Autenticación**

- Supabase Auth — **solo para el administrador**
- Los clientes NUNCA crean cuenta

**Storage**

- Supabase Storage (imágenes, videos, material multimedia)

**Hosting**

- Vercel

**Analítica**

- Meta Pixel (ViewContent, AddToCart, InitiateCheckout, Purchase)
- Google Analytics 4

---

## Identidad visual

Marca: **AURA FIT**
Concepto: Performance Wear / Fitness Premium
Estilo: fitness premium futurista, minimalismo metálico.

La marca transmite: tecnología, rendimiento, disciplina, evolución personal,
exclusividad, innovación.

### Colores

| Rol                 | Hex       |
| ------------------- | --------- |
| Fondo principal     | `#050505` |
| Fondo secundario    | `#111111` |
| Plata metálica      | `#C7D7E8` |
| Azul tecnológico    | `#5EA8FF` |
| Texto               | `#FFFFFF` |

**Nunca utilizar:**

- Colores cálidos (dorado, naranja, rojo) salvo estados de error/alerta mínimos
- Diseños que se vean económicos
- Interfaces saturadas

El detalle completo está en `design-system.md`.

---

## Reglas importantes

Antes de crear componentes:

1. Revisar los componentes existentes en `src/components` y `src/features`.
2. Mantener arquitectura modular (feature-based).
3. No duplicar código.
4. Usar TypeScript estricto (nada de `any`).
5. Mantener diseño responsive **mobile first**.
6. Preferir Server Components; `"use client"` solo cuando hay interacción.

Reglas completas en `development-rules.md`.

---

## Arquitectura

Feature Based Architecture:

```
src/features/products
src/features/cart
src/features/orders
src/features/inventory
src/features/coupons
src/features/admin
```

Detalle en `architecture.md`.

---

## Modelo de ecommerce

- Los usuarios **NO** crean cuenta.
- El carrito vive en `localStorage` vía Zustand.
- El checkout es **WhatsApp**: se genera un mensaje pre-formateado con el pedido.
- El pedido se registra en la tabla `orders` con estado `pendiente`.
- El administrador confirma, cobra y actualiza el estado manualmente.

---

## Estado actual

Proyecto en desarrollo activo.

- El catálogo funciona con Supabase cuando hay credenciales en `.env.local`.
- Si no hay credenciales, la app cae automáticamente a datos mock
  (`src/lib/mock-data.ts`) para que `npm run dev` funcione sin configuración.
- Ver `roadmap.md` para lo pendiente.
