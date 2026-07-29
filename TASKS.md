# TASKS — AURA FIT

> Lista viva de trabajo. El contexto del proyecto está en `CLAUDE.md`.
> Se trabaja **una tarea a la vez**, de arriba hacia abajo.
>
> Última actualización: **2026-07-28**
>
> En línea: <https://aura-fit-store.vercel.app>

---

## 🔜 Siguiente tarea

### 0. Instalar el registro de borrados

La tabla `products` se vació **tres veces** durante el desarrollo sin dejar
rastro. Esto no lo impide, pero graba la consulta exacta, el rol y la hora
para que la próxima sea diagnosticable.

- [ ] Ejecutar `supabase/EJECUTAR-AHORA-0004.sql` en el SQL Editor

Para consultarlo si vuelve a pasar:

```sql
select ocurrio_en, tabla, rol, consulta
from public.audit_borrados
order by ocurrio_en desc limit 50;
```

### 0b. Respaldos — ya resueltos

El plan gratuito de Supabase no hace respaldos automáticos, así que se
resuelve desde el proyecto:

```bash
npm run respaldo          # guarda una copia en /respaldos
npm run respaldo -- --ver # lista las copias existentes
npm run restaurar         # recupera desde la más reciente
```

Conserva las últimas 20 copias y la carpeta no se sube al repositorio.
Probado: borrando un producto y recuperándolo con su inventario.

**Hacer un respaldo antes y después de cargar el catálogo real.**

### 1. Cargar el catálogo real

Los 9 productos actuales son de muestra, con fotos de Unsplash.

- [ ] Subir la fotografía propia desde `/admin/productos` (bucket `productos`)
- [ ] Sustituir los productos de muestra por los reales
- [ ] Ajustar existencias en `/admin/inventario`
- [ ] Revisar los textos de Hombre y Mujer en `/admin/categorias`

### 2. Higiene de credenciales

Las dos se compartieron por chat durante la configuración.

- [ ] Cambiar la contraseña del administrador
- [ ] Rotar la llave secreta en Settings → API Keys
- [ ] Actualizar `.env.local` y la variable en Vercel

### 3. Antiguo — crear el usuario administrador

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

### 4. Dominio y analítica

- [ ] Conectar dominio propio en Vercel → Settings → Domains
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` al dominio final y redesplegar
- [ ] Configurar `NEXT_PUBLIC_META_PIXEL_ID` y `NEXT_PUBLIC_GA_ID`
- [ ] Revisar Core Web Vitals con tráfico real

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
<summary>2026-07-28 · Auditoría de seguridad y funcionalidades pendientes</summary>

- Guardia de sesión en las 15 acciones del panel (probado: 0 de 17 pasan)
- Middleware ahora falla cerrado
- El checkout relee precios y existencias del catálogo (probado con
  precio falsificado: el servidor lo corrigió a 599)
- JSON-LD escapado, pantallas de error, código muerto eliminado
- Recuperación de contraseña con protección contra redirector abierto
- Evento Purchase al marcar pagado, una vez por pedido
- Migración 0003 ejecutada: el inventario sigue al pedido.
  Probado el ciclo completo: confirmar descuenta, cancelar devuelve,
  reconfirmar vuelve a apartar. La función solo la puede llamar el
  administrador autenticado (anónimo recibe 401).

</details>

<details>
<summary>2026-07-28 · Deploy en Vercel</summary>

- Proyecto `luigis/aura-fit-store` vinculado al repositorio de GitHub
- Variables de entorno configuradas en producción y preview
- Producción en línea: <https://aura-fit-store.vercel.app>
- Next.js actualizado de 15.5.4 a 15.5.22: Vercel bloqueaba el deploy por
  una vulnerabilidad conocida
- Favicon de 7 KB recortando el emblema (el logotipo pesaba 1.5 MB)
- Verificadas 20 rutas en producción, con `/admin` protegido

</details>

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
