# TASKS — AURA FIT

> Lista viva de trabajo. El contexto del proyecto está en `CLAUDE.md`.
> Se trabaja **una tarea a la vez**, de arriba hacia abajo.
>
> Última actualización: **2026-07-25**

---

## 🔜 Siguiente tarea

### 1. Crear el usuario administrador

El middleware ya bloquea `/admin` y redirige a `/admin/login`. Falta el
usuario en Supabase Auth para poder entrar.

- [ ] Supabase → Authentication → Users → **Add user**
- [ ] Marcar **Auto Confirm User** (si no, pide verificar correo)
- [ ] Entrar a `/admin/login` con ese correo y contraseña
- [ ] Comprobar que las 8 pantallas del panel cargan
- [ ] Comprobar que se puede editar un producto y guardar

**Criterio de terminado:** entrar al panel y guardar un cambio real que se
vea reflejado en la tienda.

---

## ⏳ Pendientes

### 2. Contenido real

- [ ] Subir fotografía propia desde `/admin/productos` (bucket `productos`)
- [ ] Sustituir los 9 productos de muestra por el catálogo real
- [ ] Ajustar existencias en `/admin/inventario`
- [ ] Revisar textos de las categorías Hombre y Mujer en `/admin/categorias`
- [ ] Reemplazar el favicon de 1.5 MB por uno de 64 px

### 3. Rotar la llave secreta

La `service_role` se compartió por chat durante la configuración.

- [ ] Supabase → Settings → API Keys → rotar la llave secreta
- [ ] Actualizar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] Reiniciar el servidor y comprobar que el panel sigue funcionando

### 4. Deploy en Vercel

- [ ] Importar el repositorio en Vercel
- [ ] Configurar las variables de entorno (las mismas de `.env.local`)
- [ ] Ajustar `NEXT_PUBLIC_SITE_URL` al dominio final
- [ ] Configurar `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_GA_ID`
- [ ] Revisar Core Web Vitals con datos reales

**Requisito previo:** tarea 1 terminada. Sin usuario administrador el panel
queda inaccesible; sin el middleware activo quedaría abierto.

---

## 💡 Backlog (sin fecha)

- [ ] Historial de movimientos de inventario
- [ ] Exportar pedidos a CSV
- [ ] Notificación al admin cuando entra un pedido
- [ ] Descontar stock automáticamente al confirmar un pedido
- [ ] Mercado Pago o Stripe
- [ ] Cuentas de cliente y wishlist
- [ ] Programa de puntos

---

## ✅ Terminado

<details>
<summary>2026-07-25 · Conectar Supabase</summary>

- Esquema ejecutado: 6 tablas, trigger de stock, RLS, bucket `productos`
- Los 6 servicios reescritos contra Supabase; `mock-data.ts` eliminado
- `db.ts` con `publicDb()` (respeta RLS) y `adminDb()` (la omite)
- Catálogo cargado: 2 categorías, 9 productos con fotos, 115 variantes
- Ajustes migrados de `.data/settings.json` a la tabla `store_settings`
- Corregido: el trigger necesitaba `::product_status` explícito
- Corregido: `publicDb()` cae a cliente sin cookies fuera de una petición

</details>

<details>
<summary>2026-07-25 · Unitalla y paleta de colores</summary>

- Talla `Unitalla`, con orden fijo y validación de exclusividad
- Paleta ampliada de 5 a 24 colores agrupados
- Los filtros muestran solo colores y tallas presentes en el catálogo

</details>

<details>
<summary>2026-07-25 · Simplificación para catálogo pequeño</summary>

- Taxonomía reducida a Hombre / Mujer
- Eliminados envíos, costos de envío, paqueterías y direcciones
- Punto de encuentro visible en carrito, ficha, pie de página y WhatsApp
- Panel admin ampliado de 5 a 8 pantallas
- Publicado en GitHub

</details>

<details>
<summary>2026-07-25 · Versión 1 premium</summary>

- Proyecto completo con 5 colecciones y filtros amplios
- Conservado en la rama `diseno-v1-premium`

</details>
