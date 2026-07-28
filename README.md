# AURA FIT STORE

Tienda en línea de **AURA FIT**, proveedor de ropa deportiva.
Catálogo corto, pedidos por WhatsApp y entrega en punto de encuentro.

## Cómo funciona el negocio

- Dos categorías: **Hombre** y **Mujer**.
- El cliente arma su pedido **sin registrarse** y lo envía por WhatsApp.
- **No hay envíos a domicilio.** La entrega se acuerda en un punto de
  encuentro.
- WhatsApp de contacto: **417 127 9042**.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Zustand · Recharts · Vercel

## Arrancar

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

Necesitas `.env.local` con las credenciales de Supabase (ver `.env.example`).
Sin ellas la app no puede leer el catálogo.

## Rutas

### Tienda

| Ruta                   | Descripción                                  |
| ---------------------- | -------------------------------------------- |
| `/`                    | Portada: hero, cómo funciona, catálogo       |
| `/shop`                | Catálogo completo con filtros                |
| `/categoria/hombre`    | Categoría Hombre                             |
| `/categoria/mujer`     | Categoría Mujer                              |
| `/producto/[slug]`     | Ficha: galería, variantes, guía de tallas    |
| `/como-comprar`        | Los tres pasos del proceso                   |
| `/entregas`            | Cómo se acuerda el punto de encuentro        |
| `/guia-de-tallas`      | Tablas de medidas                            |
| `/cambios`             | Política de cambios                          |
| `/contacto`            | WhatsApp y horarios                          |

### Panel administrativo

| Ruta                   | Descripción                                       |
| ---------------------- | ------------------------------------------------- |
| `/admin`               | Dashboard: avisos, KPIs, gráfica, pedidos         |
| `/admin/estadisticas`  | Ingresos, ventas por categoría, top productos     |
| `/admin/productos`     | Alta, edición, búsqueda, mostrar/ocultar          |
| `/admin/categorias`    | CRUD de categorías                                |
| `/admin/inventario`    | Existencias por talla y color, ajuste rápido      |
| `/admin/pedidos`       | Estados, punto de encuentro, notas, búsqueda      |
| `/admin/cupones`       | Alta, activar/desactivar, eliminar                |
| `/admin/ajustes`       | WhatsApp, aviso de entrega, umbral de stock       |

> ⚠️ El panel todavía **no exige contraseña** porque Supabase Auth no está
> conectado. No publicar el sitio hasta completar ese paso.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # tsc --noEmit
```

## Siguiente paso: Supabase

Ya está conectado. Los archivos de referencia:

- `supabase/migrations/0001_init.sql` — tablas, trigger de stock y RLS
- `supabase/migrations/0002_storage.sql` — bucket `productos` para las fotos
- `supabase/seed.sql` — datos de arranque
- `src/lib/supabase/` — clientes de navegador, servidor y service role
- `.env.example` — variables necesarias

Al conectarlo solo cambia el **interior** de los seis archivos de
`src/services/`: la interfaz no se entera.

## Documentación del proyecto

El contexto completo vive en [`.claude/`](.claude/):

| Archivo                 | Contenido                                   |
| ----------------------- | ------------------------------------------- |
| `project-context.md`    | Visión general, stack, identidad, reglas    |
| `architecture.md`       | Carpetas y flujo de datos                   |
| `design-system.md`      | Colores, tipografía, componentes, animación |
| `database-schema.md`    | Tablas, RLS, índices                        |
| `development-rules.md`  | Reglas de código, seguridad, rendimiento    |
| `business-rules.md`     | Entregas, cambios, cupones, márgenes        |
| `roadmap.md`            | Qué está hecho y qué falta                  |

## Versiones del diseño

| Rama                | Qué es                                                  |
| ------------------- | ------------------------------------------------------- |
| `main`              | Tienda simplificada para catálogo pequeño (actual)      |
| `diseno-v1-premium` | Primera versión: 5 colecciones, filtros amplios, envíos |

Para verla: `git checkout diseno-v1-premium`
