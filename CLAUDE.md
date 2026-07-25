# AURA FIT STORE

> **Antes de escribir código, lee `.claude/project-context.md`.**
> Después consulta, según lo que vayas a tocar:
>
> - `.claude/architecture.md` — estructura de carpetas y flujo de datos
> - `.claude/design-system.md` — colores, tipografía, animaciones
> - `.claude/database-schema.md` — esquema destino de Supabase
> - `.claude/development-rules.md` — reglas de código y seguridad
> - `.claude/business-rules.md` — entregas, cambios, cupones, márgenes
> - `.claude/roadmap.md` — qué está hecho y qué falta

## Resumen

Tienda de ropa deportiva **AURA FIT**, proveedor pequeño. Next.js 15,
TypeScript, Tailwind v4. Pedidos por WhatsApp, entrega en punto de encuentro
y panel administrativo completo.

## Comandos

```bash
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # tsc --noEmit
```

## Reglas que no se negocian

1. Ningún componente lee datos directamente. Todo pasa por `src/services`.
2. Server Components por defecto; `"use client"` solo en hojas interactivas.
3. Nada de `any`. TypeScript estricto.
4. Colores solo desde los tokens (`bg-graphite`, `text-aura`, …).
5. Mobile first. Contraste AA. Foco visible.
6. Toda entrada de usuario se valida en el servidor.

## Este negocio NO tiene

Nunca agregar a la interfaz: envíos a domicilio, costos de envío,
paqueterías, direcciones de entrega, pasarela de pago, cuentas de cliente,
colecciones ni campo de género. La única taxonomía es la categoría
(Hombre / Mujer).

## Estado de los datos

Supabase **todavía no está conectado**. El catálogo vive en
`src/lib/mock-data.ts` y los ajustes en `.data/settings.json`.
El esquema destino ya está escrito en `supabase/migrations/`.
