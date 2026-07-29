-- ═════════════════════════════════════════════════════════════
-- AURA FIT - INSTALACION COMPLETA DE SUPABASE
-- Pega TODO este archivo en el SQL Editor y ejecuta.
-- Es seguro repetirlo: no duplica nada.
-- ═════════════════════════════════════════════════════════════

-- --- 1. ESQUEMA ---
-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Esquema inicial
--
-- Todavía NO está conectado: la app corre sobre `src/lib/mock-data.ts`.
-- Este archivo es el destino, para que la migración sea copiar y pegar.
-- Ver .claude/database-schema.md
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type product_status as enum ('activo', 'oculto', 'agotado');
exception when duplicate_object then null; end $$;

-- No hay envíos: la entrega es en punto de encuentro.
do $$ begin
  create type order_status as enum (
    'pendiente', 'confirmado', 'pagado', 'entregado', 'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_fit as enum ('superior', 'inferior');
exception when duplicate_object then null; end $$;

-- ── categories ───────────────────────────────────────────────
-- Única taxonomía del catálogo. Arranca con Hombre y Mujer.
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text not null default '',
  image        text not null default '',
  active       boolean not null default true,
  sort_order   integer not null default 1,
  created_at   timestamptz not null default now()
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
  fit          product_fit not null default 'superior',
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
create sequence if not exists public.order_number_seq start 121;

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
  -- Dónde y cuándo se entrega. Sustituye a la dirección de envío.
  meeting_point  text,
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
  active      boolean not null default true
);

-- ── store_settings ───────────────────────────────────────────
-- Una sola fila. Reemplaza a `.data/settings.json`.
create table if not exists public.store_settings (
  id                   integer primary key default 1 check (id = 1),
  store_name           text not null default 'AURA FIT',
  tagline              text not null default 'Performance Wear',
  whatsapp_number      text not null default '524171279042',
  whatsapp_display     text not null default '417 127 9042',
  meeting_point_note   text not null default '',
  support_hours        text not null default '',
  announcement         text not null default '',
  announcement_active  boolean not null default true,
  low_stock_threshold  integer not null default 3,
  updated_at           timestamptz not null default now()
);

insert into public.store_settings (id) values (1)
on conflict (id) do nothing;

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

  -- El CASE devuelve texto: hay que convertirlo al enum explícitamente.
  update public.products
  set
    stock = total,
    status = (
      case
        when status = 'oculto' then 'oculto'
        when total > 0 then 'activo'
        else 'agotado'
      end
    )::product_status
  where id = target_product;

  return null;
end;
$$;

drop trigger if exists inventory_sync_stock on public.inventory;
create trigger inventory_sync_stock
after insert or update or delete on public.inventory
for each row execute function public.sync_product_stock();

-- ── Row Level Security ───────────────────────────────────────
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.inventory       enable row level security;
alter table public.orders          enable row level security;
alter table public.coupons         enable row level security;
alter table public.store_settings  enable row level security;

-- Lectura pública del catálogo
drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists "productos publicos" on public.products;
create policy "productos publicos" on public.products
  for select using (status <> 'oculto' or auth.role() = 'authenticated');

drop policy if exists "inventario visible" on public.inventory;
create policy "inventario visible" on public.inventory
  for select using (true);

drop policy if exists "cupones vigentes visibles" on public.coupons;
create policy "cupones vigentes visibles" on public.coupons
  for select using (active = true and expiration > now());

drop policy if exists "ajustes visibles" on public.store_settings;
create policy "ajustes visibles" on public.store_settings
  for select using (true);

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

drop policy if exists "admin escribe ajustes" on public.store_settings;
create policy "admin escribe ajustes" on public.store_settings
  for update using (auth.role() = 'authenticated')
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


-- --- 2. STORAGE ---
-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Storage para fotografía de producto
-- Ejecutar después de 0001_init.sql
-- ─────────────────────────────────────────────────────────────

-- Bucket público: las fotos del catálogo se sirven directo al navegador.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Cualquiera puede ver las fotos del catálogo.
drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects
  for select using (bucket_id = 'productos');

-- Solo el administrador autenticado sube, reemplaza o borra.
drop policy if exists "admin sube fotos" on storage.objects;
create policy "admin sube fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos');

drop policy if exists "admin actualiza fotos" on storage.objects;
create policy "admin actualiza fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos')
  with check (bucket_id = 'productos');

drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos');


-- --- 3. INVENTARIO LIGADO A PEDIDOS ---
-- ─────────────────────────────────────────────────────────────
-- AURA FIT — El inventario sigue al pedido
--
-- Hasta ahora el stock se ajustaba a mano: se confirmaba un pedido y había
-- que acordarse de bajar las piezas en Inventario. Esto lo automatiza.
--
-- Ejecutar después de 0001_init.sql
-- ─────────────────────────────────────────────────────────────

-- Marca si las piezas de este pedido ya salieron del inventario.
-- Sin esto, confirmar dos veces descontaría dos veces.
alter table public.orders
  add column if not exists stock_applied boolean not null default false;

/**
 * Cambia el estado de un pedido y ajusta el inventario en la misma
 * transacción.
 *
 *   pendiente/cancelado  ->  el stock está libre
 *   confirmado en adelante -> el stock está apartado
 *
 * Devolver un pedido a pendiente o cancelarlo libera las piezas.
 * Todo ocurre atómicamente: o se mueven estado e inventario, o ninguno.
 */
create or replace function public.set_order_status(
  p_order_id uuid,
  p_status order_status
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order        public.orders%rowtype;
  v_should_apply boolean;
  v_item         jsonb;
  v_faltantes    text := '';
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Pedido no encontrado.');
  end if;

  -- Estados en los que las piezas quedan apartadas para este cliente.
  v_should_apply := p_status in ('confirmado', 'pagado', 'entregado');

  -- Descontar
  if v_should_apply and not v_order.stock_applied then
    for v_item in select * from jsonb_array_elements(v_order.items) loop
      update public.inventory
      set quantity = greatest(0, quantity - (v_item ->> 'quantity')::int)
      where product_id = (v_item ->> 'product_id')::uuid
        and size = v_item ->> 'size'
        and color = v_item ->> 'color';

      if not found then
        v_faltantes := v_faltantes || (v_item ->> 'name') || '; ';
      end if;
    end loop;

    update public.orders
    set status = p_status, stock_applied = true
    where id = p_order_id;

  -- Devolver al inventario
  elsif not v_should_apply and v_order.stock_applied then
    for v_item in select * from jsonb_array_elements(v_order.items) loop
      update public.inventory
      set quantity = quantity + (v_item ->> 'quantity')::int
      where product_id = (v_item ->> 'product_id')::uuid
        and size = v_item ->> 'size'
        and color = v_item ->> 'color';
    end loop;

    update public.orders
    set status = p_status, stock_applied = false
    where id = p_order_id;

  -- Sin movimiento de inventario: solo cambia la etiqueta
  else
    update public.orders set status = p_status where id = p_order_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'stock_applied', v_should_apply,
    'sin_variante', nullif(v_faltantes, '')
  );
end;
$$;

-- Solo el administrador autenticado puede mover pedidos.
revoke all on function public.set_order_status(uuid, order_status) from public, anon;
grant execute on function public.set_order_status(uuid, order_status) to authenticated, service_role;


-- --- 4. REGISTRO DE BORRADOS ---
-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Registro de borrados
--
-- Durante el desarrollo la tabla `products` se vació dos veces sin que
-- quedara rastro de quién lo hizo. Esto graba cada borrado con la consulta
-- exacta, el rol y la hora, para que una tercera vez sea diagnosticable.
--
-- Es una red de seguridad, no una corrección: no impide el borrado, lo
-- documenta.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.audit_borrados (
  id          bigserial primary key,
  tabla       text        not null,
  registro_id uuid,
  datos       jsonb,
  rol         text        not null default current_user,
  consulta    text,
  ocurrio_en  timestamptz not null default now()
);

create index if not exists audit_borrados_fecha_idx
  on public.audit_borrados (ocurrio_en desc);

create or replace function public.registrar_borrado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_borrados (tabla, registro_id, datos, rol, consulta)
  values (
    tg_table_name,
    (to_jsonb(old) ->> 'id')::uuid,
    to_jsonb(old),
    current_user,
    -- La sentencia SQL que provocó el borrado: esto es lo que faltaba.
    left(current_query(), 2000)
  );
  return old;
end;
$$;

drop trigger if exists audit_products_delete on public.products;
create trigger audit_products_delete
after delete on public.products
for each row execute function public.registrar_borrado();

drop trigger if exists audit_categories_delete on public.categories;
create trigger audit_categories_delete
after delete on public.categories
for each row execute function public.registrar_borrado();

drop trigger if exists audit_orders_delete on public.orders;
create trigger audit_orders_delete
after delete on public.orders
for each row execute function public.registrar_borrado();

-- Solo el administrador autenticado puede consultar el registro.
alter table public.audit_borrados enable row level security;

drop policy if exists "admin lee auditoria" on public.audit_borrados;
create policy "admin lee auditoria" on public.audit_borrados
  for select using (auth.role() = 'authenticated');

-- ── Cómo consultarlo ─────────────────────────────────────────
-- select ocurrio_en, tabla, rol, consulta
-- from public.audit_borrados
-- order by ocurrio_en desc
-- limit 50;


-- --- 5. DATOS DE ARRANQUE ---
-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Datos de arranque
-- Ejecutar después de 0001_init.sql
-- Sustituir las URLs de imagen por las de Supabase Storage.
-- ─────────────────────────────────────────────────────────────

insert into public.categories (name, slug, description, image, active, sort_order)
values
  (
    'Hombre',
    'hombre',
    'Playeras de compresión, shorts y sudaderas para entrenamiento y uso diario.',
    '',
    true,
    1
  ),
  (
    'Mujer',
    'mujer',
    'Leggings, tops y conjuntos con ajuste de segunda piel y soporte real.',
    '',
    true,
    2
  )
on conflict (slug) do nothing;

-- ── Productos ────────────────────────────────────────────────
insert into public.products (
  name, slug, description, features, material, price, old_price, sku,
  images, category_id, fit, sizes, colors, featured, status
)
select
  'Playera Compression AURA',
  'playera-compression-aura',
  'Tejido de compresión graduada que sostiene el músculo durante el esfuerzo y acelera la recuperación.',
  array[
    'Compresión graduada',
    'Secado rápido',
    'Elasticidad en cuatro direcciones',
    'Costuras planas anti-rozadura'
  ],
  '78% Poliamida · 22% Elastano',
  699, 899, 'AF-001',
  array[]::text[],
  c.id, 'superior',
  array['S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Gris","hex":"#6B7280"},{"name":"Azul","hex":"#5EA8FF"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'hombre'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, sku,
  images, category_id, fit, sizes, colors, featured, status
)
select
  'Short Velocity 7"',
  'short-velocity-7',
  'Short de entrenamiento ultraligero con forro interior de compresión.',
  array[
    'Forro interior de compresión',
    'Tejido ultraligero',
    'Bolsa lateral con cierre',
    'Cintura elástica con cordón'
  ],
  '88% Poliéster reciclado · 12% Elastano',
  549, 'AF-002',
  array[]::text[],
  c.id, 'inferior',
  array['S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Gris","hex":"#6B7280"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'hombre'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, old_price, sku,
  images, category_id, fit, sizes, colors, featured, status
)
select
  'Legging Sculpt Tiro Alto',
  'legging-sculpt-tiro-alto',
  'Tiro alto con paneles de sostén que esculpen la silueta sin restringir el movimiento.',
  array[
    'Banda de sostén de 12 cm',
    'Tejido opaco en sentadilla',
    'Bolsillo lateral para teléfono',
    'Costura posterior que estiliza'
  ],
  '75% Nylon · 25% Elastano',
  849, 1049, 'AF-005',
  array[]::text[],
  c.id, 'inferior',
  array['XS','S','M','L'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Plata","hex":"#C7D7E8"},{"name":"Azul","hex":"#5EA8FF"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'mujer'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, sku,
  images, category_id, fit, sizes, colors, featured, status
)
select
  'Top Impact Support',
  'top-impact-support',
  'Top deportivo de alto impacto con copas removibles y espalda cruzada.',
  array[
    'Soporte de alto impacto',
    'Copas removibles',
    'Espalda cruzada',
    'Malla de ventilación dorsal'
  ],
  '80% Poliamida · 20% Elastano',
  599, 'AF-006',
  array[]::text[],
  c.id, 'superior',
  array['XS','S','M','L'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Plata","hex":"#C7D7E8"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'mujer'
on conflict (slug) do nothing;

-- ── Inventario: una fila por combinación talla × color ───────
insert into public.inventory (product_id, size, color, quantity)
select
  p.id,
  size,
  color_entry ->> 'name',
  8
from public.products p
cross join lateral unnest(p.sizes) as size
cross join lateral jsonb_array_elements(p.colors) as color_entry
on conflict (product_id, size, color) do nothing;

-- ── Cupones ──────────────────────────────────────────────────
insert into public.coupons (code, discount, starts_at, expiration, active) values
  ('AURA20', 20, now(), now() + interval '6 months', true),
  ('BIENVENIDA10', 10, now(), now() + interval '12 months', true)
on conflict (code) do nothing;

-- ── Ajustes de la tienda ─────────────────────────────────────
update public.store_settings set
  meeting_point_note = 'Las entregas se realizan únicamente en un punto de encuentro previamente acordado por WhatsApp.',
  support_hours = 'Lunes a sábado, 10:00 – 20:00',
  announcement = 'Entrega en punto de encuentro · Pide por WhatsApp'
where id = 1;
