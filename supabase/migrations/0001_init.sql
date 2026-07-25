-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Esquema inicial
-- Ver .claude/database-schema.md
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type product_status as enum ('activo', 'oculto', 'agotado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pendiente', 'confirmado', 'pagado', 'enviado', 'finalizado', 'cancelado'
  );
exception when duplicate_object then null; end $$;

-- ── categories ───────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  image       text not null default '',
  created_at  timestamptz not null default now()
);

-- ── products ─────────────────────────────────────────────────
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text not null default '',
  features     text[] not null default '{}',
  material     text not null default '',
  price        numeric(10,2) not null check (price >= 0),
  old_price    numeric(10,2) check (old_price >= 0),
  sku          text not null unique,
  images       text[] not null default '{}',
  video        text,
  category_id  uuid references public.categories(id) on delete set null,
  collection   text not null default 'aura-essential',
  gender       text not null default 'unisex'
               check (gender in ('hombre', 'mujer', 'unisex')),
  sizes        text[] not null default '{}',
  colors       jsonb not null default '[]'::jsonb,
  -- Derivado de inventory por trigger. No escribir a mano.
  stock        integer not null default 0,
  featured     boolean not null default false,
  status       product_status not null default 'activo',
  created_at   timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_collection_idx on public.products (collection);
create index if not exists products_category_idx on public.products (category_id);

-- ── inventory ────────────────────────────────────────────────
create table if not exists public.inventory (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size        text not null,
  color       text not null,
  quantity    integer not null default 0 check (quantity >= 0),
  unique (product_id, size, color)
);

create index if not exists inventory_product_idx on public.inventory (product_id);

-- ── orders ───────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique
                 default 'AF-' || lpad(nextval('public.order_number_seq')::text, 6, '0'),
  customer_name  text not null,
  phone          text not null,
  items          jsonb not null default '[]'::jsonb,
  subtotal       numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  coupon_code    text,
  status         order_status not null default 'pendiente',
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

-- ── coupons ──────────────────────────────────────────────────
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  discount    integer not null check (discount between 1 and 100),
  starts_at   timestamptz not null default now(),
  expiration  timestamptz not null,
  product_id  uuid references public.products(id) on delete cascade,
  active      boolean not null default true
);

-- ── Trigger: mantener products.stock sincronizado ────────────
create or replace function public.sync_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product uuid := coalesce(new.product_id, old.product_id);
  total integer;
begin
  select coalesce(sum(quantity), 0) into total
  from public.inventory
  where product_id = target_product;

  update public.products
  set
    stock = total,
    status = case
      when status = 'oculto' then 'oculto'
      when total > 0 then 'activo'
      else 'agotado'
    end
  where id = target_product;

  return null;
end;
$$;

drop trigger if exists inventory_sync_stock on public.inventory;
create trigger inventory_sync_stock
after insert or update or delete on public.inventory
for each row execute function public.sync_product_stock();

-- ── Row Level Security ───────────────────────────────────────
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.inventory  enable row level security;
alter table public.orders     enable row level security;
alter table public.coupons    enable row level security;

-- Lectura pública del catálogo
drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (true);

drop policy if exists "productos publicos" on public.products;
create policy "productos publicos" on public.products
  for select using (status <> 'oculto' or auth.role() = 'authenticated');

drop policy if exists "inventario visible" on public.inventory;
create policy "inventario visible" on public.inventory
  for select using (true);

drop policy if exists "cupones vigentes visibles" on public.coupons;
create policy "cupones vigentes visibles" on public.coupons
  for select using (active = true and expiration > now());

-- Escritura solo para el administrador autenticado
drop policy if exists "admin escribe categorias" on public.categories;
create policy "admin escribe categorias" on public.categories
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin escribe productos" on public.products;
create policy "admin escribe productos" on public.products
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin escribe inventario" on public.inventory;
create policy "admin escribe inventario" on public.inventory
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin escribe cupones" on public.coupons;
create policy "admin escribe cupones" on public.coupons
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Pedidos: el cliente anónimo puede crear, solo el admin puede leer
drop policy if exists "cliente crea pedido" on public.orders;
create policy "cliente crea pedido" on public.orders
  for insert with check (true);

drop policy if exists "admin lee pedidos" on public.orders;
create policy "admin lee pedidos" on public.orders
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin actualiza pedidos" on public.orders;
create policy "admin actualiza pedidos" on public.orders
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
