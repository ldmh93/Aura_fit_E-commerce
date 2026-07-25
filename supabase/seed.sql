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
