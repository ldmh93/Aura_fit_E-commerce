# Reglas de negocio — AURA FIT

> AURA FIT es un **proveedor pequeño** de ropa deportiva. Catálogo corto,
> operación simple, trato directo con el cliente.
>
> Los valores que impactan el código viven en `src/lib/config.ts` y en los
> ajustes editables desde `/admin/ajustes`. Este archivo explica el **porqué**.

## Modelo de negocio

- Catálogo pequeño y curado. Sin cientos de referencias.
- El cliente **no crea cuenta**.
- El pedido se envía por **WhatsApp**.
- **No hay envíos a domicilio ni paqueterías.**
- La entrega es en un **punto de encuentro** acordado con el cliente.

## Contacto

- Canal único: **WhatsApp 417 127 9042** (`524171279042` en formato
  internacional).
- Horario: lunes a sábado, 10:00 – 20:00.
- Tiempo de respuesta objetivo: menos de 2 horas en horario hábil.
- Tono: cercano, seguro, sin emojis excesivos. Nunca presionar la venta.

## Entrega

- Método único: **punto de encuentro**.
- El punto, el día y la hora se acuerdan por WhatsApp después de confirmar
  el pedido.
- **Sin costo de entrega.** El precio mostrado es el precio final.
- El punto acordado se guarda en el pedido (`orders.meeting_point`) para
  tenerlo a la mano.

**En la tienda nunca debe aparecer:** costo de envío, dirección de entrega,
paquetería, número de guía, cálculo de envío gratis ni tiempo de tránsito.

## Categorías

Una sola taxonomía: **Hombre** y **Mujer**. Nada de colecciones, líneas ni
campo de género aparte — sería la misma información dos veces.

Se pueden agregar más categorías desde `/admin/categorias` si el catálogo
crece. Una categoría con productos asignados no se puede eliminar.

## Moneda y precios

- Moneda única: **MXN**. Formato `$1,398 MXN` (`Intl.NumberFormat('es-MX')`).
- Los precios mostrados **incluyen IVA**.
- `old_price` solo se muestra si es mayor que `price`; el porcentaje de
  descuento se calcula, nunca se escribe a mano.

## Márgenes (referencia interna, no se muestra en la tienda)

- Margen objetivo por prenda: **55–65%** sobre costo.
- Precio mínimo de venta: costo × 2.2.
- Las promociones no deben bajar el margen por debajo del **35%**.

## Inventario

- Control por variante: producto + talla + color.
- **Alerta de stock bajo:** 3 piezas o menos (editable en `/admin/ajustes`).
- **Sin existencia:** 0 piezas → la variante aparece deshabilitada.
- Si todas las variantes están en cero, el producto pasa a `agotado`
  automáticamente y no se puede pedir. Sigue visible para SEO y demanda.
- El stock **no** se descuenta al agregar al carrito. Se descuenta cuando el
  administrador marca el pedido como `confirmado`, y vuelve al inventario si
  el pedido se cancela o regresa a `pendiente`.
  Lo hace la función `set_order_status` de Postgres, en una sola transacción:
  estado e inventario se mueven juntos o no se mueven.
  La columna `orders.stock_applied` evita descontar dos veces.
- `products.stock` es un valor derivado del inventario: nunca se escribe a
  mano desde el formulario.

## Pedidos

```
pendiente → confirmado → pagado → entregado
                    ↘ cancelado
```

- `pendiente`: el cliente envió el pedido por WhatsApp.
- `confirmado`: se verificó disponibilidad y se apartó el stock.
- `pagado`: se recibió el pago (transferencia previa o efectivo).
- `entregado`: se entregó en el punto de encuentro.
- `cancelado`: libera el stock apartado.

Los pedidos pendientes sin respuesta por más de **48 horas** se cancelan y el
stock se libera.

Solo `pagado` y `entregado` cuentan como venta en las estadísticas.

## Pago

- Efectivo en el punto de encuentro, o transferencia previa.
- Se acuerda por WhatsApp antes de la entrega.
- No hay pasarela de pago en el sitio.

## Cambios

- **7 días** desde la entrega.
- La prenda debe estar sin uso, con etiquetas y en su empaque original.
- Cambio de talla: sin costo, una vez por pedido, sujeto a existencia.
- No se aceptan cambios en artículos con descuento mayor al 30%.
- Defecto de fabricación: se repone o se devuelve el importe completo.

## Cupones

- Códigos siempre en MAYÚSCULAS (`AURA20`).
- Un solo cupón por pedido; **no son acumulables**.
- Descuento máximo permitido: **30%**.
- Los cupones expirados o inactivos se rechazan **en el servidor**, no solo
  en la interfaz.

## Marketing

- Meta Pixel y GA4 se activan solo si hay ID configurado.
- Eventos: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
- `Purchase` se dispara cuando el administrador marca el pedido como `pagado`,
  no al enviar el WhatsApp. Se envía una sola vez por pedido.

  **Limitación conocida:** el evento sale del navegador del administrador, así
  que la atribución corresponde a ese equipo y no al del cliente. Para
  atribución real haría falta la API de Conversiones de Meta, que necesita un
  token de acceso aparte.
