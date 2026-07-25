# Base de datos — AURA FIT (Supabase PostgreSQL)

Migraciones en `supabase/migrations/`. Datos de ejemplo en `supabase/seed.sql`.

## Enums

```sql
product_status : 'activo' | 'oculto' | 'agotado'
order_status   : 'pendiente' | 'confirmado' | 'pagado' | 'enviado' | 'finalizado' | 'cancelado'
```

## categories

| Campo        | Tipo        | Notas                    |
| ------------ | ----------- | ------------------------ |
| id           | uuid PK     | `gen_random_uuid()`      |
| name         | text        |                          |
| slug         | text UNIQUE |                          |
| image        | text        | URL en Supabase Storage  |
| created_at   | timestamptz |                          |

## products

| Campo        | Tipo             | Notas                                       |
| ------------ | ---------------- | ------------------------------------------- |
| id           | uuid PK          |                                             |
| name         | text             |                                             |
| slug         | text UNIQUE      | URL amigable: `playera-compression-negra`   |
| description  | text             |                                             |
| features     | text[]           | Características técnicas                    |
| material     | text             |                                             |
| price        | numeric(10,2)    | MXN                                         |
| old_price    | numeric(10,2)    | Nullable — para mostrar descuento           |
| sku          | text UNIQUE      |                                             |
| images       | text[]           | Orden: frontal, trasera, tela, modelo       |
| video        | text             | Nullable                                    |
| category_id  | uuid FK          | → categories.id                             |
| collection   | text             | AURA PERFORMANCE / STREET / WOMEN / …       |
| gender       | text             | `hombre` \| `mujer` \| `unisex`             |
| sizes        | text[]           | `{S,M,L,XL}`                                |
| colors       | jsonb            | `[{name, hex}]`                             |
| stock        | int              | Total agregado (derivado de `inventory`)    |
| featured     | boolean          | Aparece en destacados                       |
| status       | product_status   |                                             |
| created_at   | timestamptz      |                                             |

> `stock` se mantiene sincronizado por trigger a partir de `inventory`.
> **Nunca escribirlo a mano.**

## inventory

Control real por variante.

| Campo      | Tipo    | Notas                              |
| ---------- | ------- | ---------------------------------- |
| id         | uuid PK |                                    |
| product_id | uuid FK | → products.id ON DELETE CASCADE    |
| size       | text    |                                    |
| color      | text    |                                    |
| quantity   | int     | ≥ 0                                |

UNIQUE `(product_id, size, color)`.
Umbral de alerta de stock bajo: **5 unidades** (ver `business-rules.md`).

## orders

| Campo         | Tipo         | Notas                                  |
| ------------- | ------------ | -------------------------------------- |
| id            | uuid PK      |                                        |
| order_number  | text UNIQUE  | `AF-000123`, generado por secuencia    |
| customer_name | text         |                                        |
| phone         | text         | WhatsApp del cliente                   |
| items         | jsonb        | Snapshot de líneas del carrito         |
| subtotal      | numeric      |                                        |
| discount      | numeric      |                                        |
| total         | numeric      |                                        |
| coupon_code   | text         | Nullable                               |
| status        | order_status | Default `pendiente`                    |
| notes         | text         |                                        |
| created_at    | timestamptz  |                                        |

Forma de cada item en `items`:

```json
{ "product_id": "...", "name": "...", "sku": "...", "size": "M",
  "color": "Negro", "quantity": 2, "unit_price": 699, "image": "..." }
```

## coupons

| Campo      | Tipo        | Notas                                 |
| ---------- | ----------- | ------------------------------------- |
| id         | uuid PK     |                                       |
| code       | text UNIQUE | Mayúsculas, p. ej. `AURA20`           |
| discount   | int         | Porcentaje 1–100                      |
| starts_at  | timestamptz |                                       |
| expiration | timestamptz |                                       |
| product_id | uuid FK     | Nullable — si aplica a un solo producto |
| active     | boolean     |                                       |

## Row Level Security

RLS activado en todas las tablas.

- **Lectura pública (anon):** `products` con `status = 'activo'`, `categories`,
  `inventory`, `coupons` vigentes.
- **Escritura:** solo usuarios autenticados (el administrador).
- `orders`: `INSERT` permitido a anon (el cliente crea su pedido);
  `SELECT`/`UPDATE` solo autenticados.

## Índices

`products(slug)`, `products(status)`, `products(collection)`,
`products(category_id)`, `inventory(product_id)`, `orders(status, created_at)`.
