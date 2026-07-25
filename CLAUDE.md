# AURA FIT STORE

> **Antes de escribir código, lee `.claude/project-context.md`.**
> Después consulta, según lo que vayas a tocar:
>
> - `.claude/architecture.md` — estructura de carpetas y flujo de datos
> - `.claude/design-system.md` — colores, tipografía, animaciones
> - `.claude/database-schema.md` — tablas, RLS, índices
> - `.claude/development-rules.md` — reglas de código y seguridad
> - `.claude/business-rules.md` — envíos, cambios, cupones, márgenes
> - `.claude/roadmap.md` — qué está hecho y qué falta

## Resumen

Ecommerce premium de ropa deportiva **AURA FIT**. Next.js 15 (App Router),
TypeScript, Tailwind v4, Supabase, checkout por WhatsApp y panel admin privado.

## Comandos

```bash
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # tsc --noEmit
```

## Reglas que no se negocian

1. Ningún componente importa `@supabase/*`. Todo pasa por `src/services`.
2. Server Components por defecto; `"use client"` solo en hojas interactivas.
3. Nada de `any`. TypeScript estricto.
4. Colores solo desde los tokens (`bg-graphite`, `text-aura`, …), nunca hex sueltos.
5. Mobile first. Contraste AA. Foco visible.
6. `SUPABASE_SERVICE_ROLE_KEY` jamás llega al cliente.

## Sin Supabase configurado

La app arranca igual: los servicios caen a `src/lib/mock-data.ts`.
Es el modo por defecto en local hasta que llenes `.env.local`.
