# AURA FIT STORE — Contexto Principal del Proyecto

> **Leer este archivo primero.** Es el "cerebro" del proyecto. Antes de
> modificar grandes partes del sistema, consultar también `architecture.md`,
> `design-system.md`, `database-schema.md`, `development-rules.md`,
> `business-rules.md` y `roadmap.md`.

---

## Descripción

AURA FIT es un **proveedor pequeño** de ropa deportiva. El proyecto es su
tienda en línea: catálogo corto y cuidado, pedidos por WhatsApp y entrega en
punto de encuentro. Incluye un panel administrativo privado completo.

La interfaz busca sentirse premium sin ser pesada: pocos productos, bien
presentados.

## Objetivo

Los clientes deben poder:

- Ver el catálogo completo sin fricción
- Consultar precios en MXN
- Ver disponibilidad real por talla y color
- Armar su pedido **sin registrarse**
- Enviarlo por WhatsApp
- Acordar el punto de encuentro para recibirlo

El administrador debe poder gestionar productos, categorías, inventario,
pedidos, cupones, estadísticas y ajustes desde `/admin`.

---

## Lo que este negocio NO tiene

Importante, porque define qué **no** debe aparecer en la interfaz:

- ❌ Envíos a domicilio, paqueterías, guías o costos de envío
- ❌ Direcciones de entrega
- ❌ Pasarela de pago en línea
- ❌ Cuentas de cliente
- ❌ Colecciones o líneas de producto (solo Hombre y Mujer)
- ❌ Catálogo masivo

---

## Stack tecnológico

**Frontend**

- Next.js 15 (App Router)
- React 19
- TypeScript (modo estricto)
- Tailwind CSS v4 (configuración CSS-first en `src/app/globals.css`)
- Framer Motion (animaciones)
- Zustand (carrito, persistido en localStorage)
- Recharts (gráficas del panel, carga diferida)

**Backend**

- Next.js Server Actions
- API Routes solo cuando Server Actions no aplican

**Datos — estado actual**

- El catálogo, los pedidos y los cupones viven en `src/lib/mock-data.ts`
- Los ajustes de la tienda se guardan en `.data/settings.json`
- **Supabase todavía no está conectado.** El esquema destino está escrito en
  `supabase/migrations/` y los clientes en `src/lib/supabase/`

**Hosting**

- Vercel

---

## Identidad visual

Marca: **AURA FIT**
Concepto: Performance Wear / Fitness Premium
Estilo: minimalismo metálico, fondo negro, luz azul.

### Colores

| Rol                 | Hex       |
| ------------------- | --------- |
| Fondo principal     | `#050505` |
| Fondo secundario    | `#111111` |
| Plata metálica      | `#C7D7E8` |
| Azul tecnológico    | `#5EA8FF` |
| Texto               | `#FFFFFF` |

**Nunca utilizar:** colores cálidos como color de marca, diseños que se vean
económicos, interfaces saturadas.

Detalle completo en `design-system.md`.

---

## Reglas importantes

1. Revisar los componentes existentes antes de crear otro.
2. Mantener arquitectura modular (feature-based).
3. No duplicar código.
4. TypeScript estricto: nada de `any`.
5. Mobile first.
6. Server Components por defecto; `"use client"` solo donde hay interacción.
7. Ningún componente lee datos directamente: todo pasa por `src/services`.

Reglas completas en `development-rules.md`.

---

## Modelo de ecommerce

- Los usuarios **NO** crean cuenta.
- El carrito vive en `localStorage` vía Zustand.
- El checkout es **WhatsApp**: se genera un mensaje pre-formateado.
- El pedido se registra con estado `pendiente`.
- El administrador confirma, cobra y registra el punto de encuentro.

---

## Versiones del diseño

- Rama `main`: tienda simplificada para catálogo pequeño (actual).
- Rama `diseno-v1-premium`: primera versión con 5 colecciones, filtros
  amplios y envíos. Se conserva como alternativa.
