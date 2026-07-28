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
