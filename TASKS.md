# TASKS — AURA FIT

> Lista viva de trabajo. El contexto del proyecto está en `CLAUDE.md`.
> Se trabaja **una tarea a la vez**, de arriba hacia abajo.
>
> Última actualización: **2026-07-25**

---

## 🔜 Siguiente tarea

### 1. Conectar Supabase — base de datos

**Objetivo:** que el catálogo, el inventario, los pedidos y los cupones
salgan de Supabase en lugar de `src/lib/mock-data.ts`.

- [ ] Crear proyecto en Supabase y copiar credenciales a `.env.local`
- [ ] Ejecutar `supabase/migrations/0001_init.sql`
- [ ] Ejecutar `supabase/migrations/0002_storage.sql`
- [ ] Ejecutar `supabase/seed.sql`
- [ ] Reescribir el interior de:
      `products.service.ts`, `categories.service.ts`, `inventory.service.ts`,
      `orders.service.ts`, `coupons.service.ts`
- [ ] Verificar que la interfaz no cambió

**Archivos:** `src/services/*`, `src/lib/supabase/*`, `.env.local`
**Criterio de terminado:** `npm run build` limpio y las 24 rutas en 200 con
datos reales de Supabase.

---

## ⏳ Pendientes

### 2. Autenticación del panel

- [ ] Crear usuario administrador en Supabase Auth
- [ ] Activar `loginAction` contra Supabase
- [ ] Verificar que el middleware bloquea `/admin` sin sesión
- [ ] Probar que `/admin/login` redirige si ya hay sesión

**Bloquea el deploy.** Hoy el panel está abierto.
**Archivos:** `src/features/admin/auth.actions.ts`, `src/middleware.ts`

### 3. Ajustes en base de datos

- [ ] Mover `settings.service.ts` a la tabla `store_settings`
- [ ] Eliminar la dependencia de `.data/settings.json`

Sin esto, la pantalla de Ajustes falla en Vercel (sistema de archivos de
solo lectura).
**Archivos:** `src/services/settings.service.ts`

### 4. Contenido real

- [ ] Subir fotografía real de producto al bucket `productos`
- [ ] Cargar el catálogo real desde `/admin/productos`
- [ ] Ajustar existencias en `/admin/inventario`
- [ ] Revisar textos de las categorías Hombre y Mujer
- [ ] Reemplazar el favicon de 1.5 MB por uno de 64 px

### 5. Deploy en Vercel

- [ ] Importar el repositorio en Vercel
- [ ] Configurar variables de entorno
- [ ] Ajustar `NEXT_PUBLIC_SITE_URL` al dominio final
- [ ] Configurar `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_GA_ID`
- [ ] Revisar Core Web Vitals con datos reales

**Requisito previo:** tareas 2 y 3 terminadas.

---

## 💡 Backlog (sin fecha)

- [ ] Historial de movimientos de inventario
- [ ] Exportar pedidos a CSV
- [ ] Notificación al admin cuando entra un pedido
- [ ] Mercado Pago o Stripe
- [ ] Cuentas de cliente y wishlist
- [ ] Programa de puntos

---

## ✅ Terminado

<details>
<summary>2026-07-25 · Simplificación para catálogo pequeño</summary>

- Taxonomía reducida a Hombre / Mujer
- Eliminados envíos, costos de envío, paqueterías y direcciones
- Punto de encuentro visible en carrito, ficha, pie de página y WhatsApp
- WhatsApp actualizado a 417 127 9042
- Home simplificada; páginas nuevas `/como-comprar` y `/entregas`
- Panel admin ampliado de 5 a 8 pantallas
- Corregidos 5 bugs (stock en agregado rápido, hidratación del carrito,
  `variantKey`, `sanitizeText`, peso de Recharts)
- Publicado en GitHub

</details>

<details>
<summary>2026-07-25 · Versión 1 premium</summary>

- Proyecto completo con 5 colecciones y filtros amplios
- Conservado en la rama `diseno-v1-premium`

</details>
