-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Storage para fotografía de producto
-- Ejecutar después de 0001_init.sql
-- ─────────────────────────────────────────────────────────────

-- Bucket público: las fotos del catálogo se sirven directo al navegador.
-- 10 MB y HEIC incluido: las fotos de celular llegan pesadas y los iPhone
-- graban en HEIC. El navegador las reduce antes de subir, pero el margen
-- evita rechazos si alguna se sube sin procesar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif',
        'image/heic', 'image/heif']
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
