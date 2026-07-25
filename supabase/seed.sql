-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Datos de arranque
-- Ejecutar después de 0001_init.sql
-- Sustituir las URLs de imagen por las de Supabase Storage.
-- ─────────────────────────────────────────────────────────────

insert into public.categories (name, slug, image) values
  ('Playeras', 'playeras', ''),
  ('Shorts',   'shorts',   ''),
  ('Leggings', 'leggings', ''),
  ('Hoodies',  'hoodies',  ''),
  ('Tops',     'tops',     ''),
  ('Joggers',  'joggers',  '')
on conflict (slug) do nothing;

-- ── Productos ────────────────────────────────────────────────
insert into public.products (
  name, slug, description, features, material, price, old_price, sku,
  images, category_id, collection, gender, sizes, colors, featured, status
)
select
  'Playera Compression AURA',
  'playera-compression-aura-negra',
  'La pieza base del sistema AURA PERFORMANCE. Tejido de compresión graduada que sostiene el músculo durante el esfuerzo y acelera la recuperación.',
  array[
    'Tela deportiva premium de compresión graduada',
    'Tecnología de secado rápido Dry-Aura',
    'Elasticidad multidireccional 4-way stretch',
    'Ajuste ergonómico de segunda piel',
    'Costuras planas anti-rozadura'
  ],
  '78% Poliamida · 22% Elastano',
  699, 899, 'AF-PC-001',
  array[]::text[],
  c.id, 'aura-performance', 'hombre',
  array['S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Gris","hex":"#6B7280"},{"name":"Azul","hex":"#5EA8FF"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'playeras'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, sku,
  images, category_id, collection, gender, sizes, colors, featured, status
)
select
  'Short Velocity 7"',
  'short-velocity-7',
  'Short de entrenamiento ultraligero con forro interior de compresión.',
  array[
    'Forro interior de compresión integrado',
    'Tejido ripstop ultraligero',
    'Bolsa lateral con cierre invisible',
    'Ventilación láser en zonas de calor'
  ],
  '88% Poliéster reciclado · 12% Elastano',
  549, 'AF-SV-002',
  array[]::text[],
  c.id, 'aura-performance', 'hombre',
  array['S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Gris","hex":"#6B7280"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'shorts'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, old_price, sku,
  images, category_id, collection, gender, sizes, colors, featured, status
)
select
  'Legging Sculpt High-Waist',
  'legging-sculpt-high-waist',
  'Legging de tiro alto con paneles de sostén que esculpen la silueta sin restringir el movimiento.',
  array[
    'Tiro alto con banda de sostén de 12 cm',
    'Tejido opaco squat-proof certificado',
    'Paneles ergonómicos de realce',
    'Bolsillo lateral para teléfono'
  ],
  '75% Nylon · 25% Elastano',
  849, 1049, 'AF-LS-003',
  array[]::text[],
  c.id, 'aura-women', 'mujer',
  array['XS','S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Plata","hex":"#C7D7E8"},{"name":"Azul","hex":"#5EA8FF"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'leggings'
on conflict (slug) do nothing;

insert into public.products (
  name, slug, description, features, material, price, sku,
  images, category_id, collection, gender, sizes, colors, featured, status
)
select
  'Hoodie Chrome — Limited',
  'hoodie-chrome-limited',
  'Edición limitada de 200 piezas numeradas. Acabado cromado en el emblema AURA. Sin restock.',
  array[
    'Producción limitada de 200 piezas numeradas',
    'Emblema cromado de alta densidad',
    'Etiqueta interior con número de serie',
    'Interior afelpado premium 380 g/m²'
  ],
  '70% Algodón orgánico · 30% Poliéster reciclado',
  1899, 'AF-HC-011',
  array[]::text[],
  c.id, 'limited-edition', 'unisex',
  array['S','M','L','XL'],
  '[{"name":"Negro","hex":"#0A0A0A"},{"name":"Plata","hex":"#C7D7E8"}]'::jsonb,
  true, 'activo'
from public.categories c where c.slug = 'hoodies'
on conflict (slug) do nothing;

-- ── Inventario: una fila por combinación talla × color ───────
insert into public.inventory (product_id, size, color, quantity)
select
  p.id,
  size,
  color_entry ->> 'name',
  12
from public.products p
cross join lateral unnest(p.sizes) as size
cross join lateral jsonb_array_elements(p.colors) as color_entry
on conflict (product_id, size, color) do nothing;

-- ── Cupones ──────────────────────────────────────────────────
insert into public.coupons (code, discount, starts_at, expiration, active) values
  ('AURA20', 20, now(), now() + interval '6 months', true),
  ('BIENVENIDA10', 10, now(), now() + interval '12 months', true)
on conflict (code) do nothing;
