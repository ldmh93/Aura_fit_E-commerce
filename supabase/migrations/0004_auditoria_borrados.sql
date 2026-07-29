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
