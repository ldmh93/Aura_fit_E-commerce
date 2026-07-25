# Base de datos — AURA FIT

> **Supabase todavía no está conectado.** Los datos viven en
> `src/lib/mock-data.ts` y `.data/settings.json`.
>
> Este documento describe el esquema destino, ya escrito en
> `supabase/migrations/0001_init.sql` y `0002_storage.sql`.

## Enums

```sql
product_status : 'activo' | 'oculto' | 'agotado'
order_status   : 'pendiente' | 'confirmado' | 'pagado' | 'entregado' | 'cancelado'
product_fit    : 'superior' | 'inferior'
```

No hay estado `enviado`: la entrega es en punto de encuentro.

## categories

Única taxonomía del catálogo. Arranca con Hombre y Mujer.

| Campo        | Tipo        | Notas                              |
| ------------ | ----------- | ---------------------------------- |
| id           | uuid PK     |                                    |
| name         | text        | "Hombre"                           |
| slug         | text UNIQUE | "hombre" → `/categoria/hombre`     |
| description  | text        | Se muestra en la portada           |
| image        | text        | Imagen de cabecera                 |
| active       | boolean     | Oculta la categoría sin borrarla   |
| sort_order   | integer     | Orden en menú y portada            |
| created_at   | timestamptz |                                    |

## products

| Campo        | Tipo            | Notas                                    |
| ------------ | --------------- | ---------------------------------------- |
| id           | uuid PK         |                                          |
| name         | text            |                                          |
| slug         | text UNIQUE     | `/producto/playera-compression-aura`     |
| description  | text            |                                          |
| features     | text[]          | Características técnicas                 |
| material     | text            |                                          |
| price        | numeric(10,2)   | MXN, IVA incluido                        |
| old_price    | numeric(10,2)   | Nullable — genera el badge de descuento  |
| sku          | text UNIQUE     |                                          |
| images       | text[]          | Orden: frontal, trasera, detalle, modelo |
| video        | text            | Nullable                                 |
| category_id  | uuid FK         | → categories.id                          |
| fit          | product_fit     | Define qué tabla de medidas se muestra   |
| sizes        | text[]          | `{S,M,L,XL}`                             |
| colors       | jsonb           | `[{name, hex}]`                          |
| stock        | integer         | **Derivado** de inventory por trigger    |
| featured     | boolean         | Aparece destacado                        |
| status       | product_status  |                                          |
| created_at   | timestamptz     |                                          |

> `stock` nunca se escribe desde el formulario. Lo mantiene el trigger
> `sync_product_stock` a partir de `inventory`.

## inventory

Existencia real por variante.

| Campo      | Tipo    | Notas                            |
| ---------- | ------- | -------------------------------- |
| id         | uuid PK |                                  |
| product_id | uuid FK | → products.id ON DELETE CASCADE  |
| size       | text    |                                  |
| color      | text    |                                  |
| quantity   | integer | ≥ 0                              |

UNIQUE `(product_id, size, color)`.
Umbral de stock bajo: configurable en `/admin/ajustes` (por defecto 3).

## orders

| Campo          | Tipo         | Notas                                |
| -------------- | ------------ | ------------------------------------ |
| id             | uuid PK      |                                      |
| order_number   | text UNIQUE  | `AF-000123`, por secuencia           |
| customer_name  | text         |                                      |
| phone          | text         | WhatsApp del cliente, 10 dígitos     |
| items          | jsonb        | Snapshot de las líneas del pedido    |
| subtotal       | numeric      |                                      |
| discount       | numeric      |                                      |
| total          | numeric      | Sin costo de entrega: no existe      |
| coupon_code    | text         | Nullable                             |
| status         | order_status | Default `pendiente`                  |
| meeting_point  | text         | Dónde y cuándo se entrega            |
| notes          | text         | Notas internas                       |
| created_at     | timestamptz  |                                      |

Forma de cada item en `items`:

```json
{ "product_id": "...", "name": "...", "sku": "...", "size": "M",
  "color": "Negro", "quantity": 2, "unit_price": 699, "image": "..." }
```

## coupons

| Campo      | Tipo        | Notas                       |
| ---------- | ----------- | --------------------------- |
| id         | uuid PK     |                             |
| code       | text UNIQUE | Mayúsculas, `AURA20`        |
| discount   | integer     | Porcentaje 1–100 (máx. 30)  |
| starts_at  | timestamptz |                             |
| expiration | timestamptz |                             |
| active     | boolean     |                             |

## store_settings

Una sola fila (`id = 1`). Sustituye a `.data/settings.json`.

Nombre de tienda, descriptor, WhatsApp, aviso de entrega, horario, barra de
aviso y umbral de stock bajo.

## Row Level Security

RLS activado en todas las tablas.

- **Lectura pública:** productos no ocultos, categorías activas, inventario,
  cupones vigentes y ajustes.
- **Escritura:** solo usuarios autenticados (el administrador).
- `orders`: `INSERT` permitido a anónimos (el cliente crea su pedido);
  `SELECT` y `UPDATE` solo autenticados.

## Índices

`products(slug)`, `products(status)`, `products(category_id)`,
`inventory(product_id)`, `orders(status, created_at desc)`.

## Storage

Bucket público `productos` (ver `0002_storage.sql`): lectura para todos,
escritura solo para el administrador autenticado.
