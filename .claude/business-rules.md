# Reglas de negocio — AURA FIT

> Estos valores son configurables. Los que impactan el código viven en
> `src/lib/config.ts`; este archivo explica el **porqué**.
> Ajustar aquí y en `config.ts` cuando el negocio cambie.

## Moneda y precios

- Moneda única: **MXN**. Formato `$1,398 MXN` (`Intl.NumberFormat('es-MX')`).
- Los precios mostrados **incluyen IVA**.
- `old_price` solo se muestra si es mayor que `price`; genera el badge de
  descuento con el porcentaje calculado, nunca escrito a mano.

## Márgenes (referencia interna, no se muestra en la tienda)

- Margen objetivo por prenda: **55–65%** sobre costo.
- Precio mínimo de venta: costo × 2.2.
- Las promociones no deben bajar el margen por debajo del **35%**.

## Inventario

- El stock se controla por variante (producto + talla + color).
- **Alerta de stock bajo:** ≤ 5 unidades en una variante.
- **Sin existencia:** 0 unidades → la variante se muestra deshabilitada.
- Si todas las variantes están en 0, el producto pasa a estado `agotado` y deja
  de poder agregarse al carrito (sigue visible para SEO y demanda).
- El stock **no** se descuenta al agregar al carrito. Se descuenta cuando el
  administrador marca el pedido como `confirmado`.

## Pedidos

Flujo de estados:

```
pendiente → confirmado → pagado → enviado → finalizado
                     ↘ cancelado
```

- `pendiente`: el cliente envió el pedido por WhatsApp.
- `confirmado`: se verificó disponibilidad y se apartó el stock.
- `pagado`: se recibió transferencia o depósito.
- `enviado`: se entregó a paquetería, con número de guía en `notes`.
- `finalizado`: el cliente recibió el pedido.
- `cancelado`: libera el stock apartado.

Los pedidos pendientes sin respuesta por más de **48 horas** se cancelan y el
stock se libera.

## Envíos

- Envío estándar nacional: **$149 MXN**.
- **Envío gratis** en compras superiores a **$1,499 MXN**.
- Tiempo de entrega estimado: 3–5 días hábiles.
- Zonas extendidas pueden tener costo adicional; se acuerda por WhatsApp.

## Cambios y devoluciones

- **30 días** naturales desde la entrega.
- La prenda debe estar sin uso, con etiquetas y en su empaque original.
- Cambio de talla: sin costo, una vez por pedido.
- No se aceptan cambios en productos de `LIMITED EDITION` ni en artículos
  comprados con descuento mayor al 30%.
- El reembolso se realiza por el mismo medio de pago, en 5–10 días hábiles.

## Cupones

- Códigos siempre en MAYÚSCULAS (`AURA20`).
- Un solo cupón por pedido; **no son acumulables**.
- Descuento máximo permitido: **30%**.
- Un cupón puede limitarse a un producto específico (`product_id`).
- Los cupones expirados o inactivos se rechazan en el servidor, no solo en la UI.

## Colecciones

| Colección           | Posicionamiento                                   |
| ------------------- | ------------------------------------------------- |
| `AURA PERFORMANCE`  | Alto rendimiento, entrenamiento intenso           |
| `AURA STREET`       | Fitness urbano, uso diario                        |
| `AURA WOMEN`        | Línea femenina completa                           |
| `AURA ESSENTIAL`    | Básicos premium, precio de entrada                |
| `LIMITED EDITION`   | Tiraje corto, sin restock, precio premium         |

## Atención al cliente

- Canal único: **WhatsApp**.
- Horario de atención: lunes a sábado, 9:00–19:00 (CDMX).
- Tiempo de respuesta objetivo: menos de 2 horas en horario hábil.
- Tono: cercano, seguro, sin emojis excesivos. Nunca presionar la venta.

## Marketing

- Meta Pixel y GA4 activos en todo el sitio.
- Eventos clave: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
- `Purchase` se dispara cuando el administrador marca el pedido como `pagado`,
  no al enviar el WhatsApp.
- Los lanzamientos se anuncian primero en `LIMITED EDITION` para crear urgencia.
