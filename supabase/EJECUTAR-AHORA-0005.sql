-- ─────────────────────────────────────────────────────────────
-- AURA FIT — Tipo de prenda: conjunto
--
-- Faltaba poder marcar una prenda como conjunto (parte de arriba y de
-- abajo juntas). Con esto la ficha muestra las dos tablas de medidas.
--
-- Es una sola línea y no toca ningún dato existente.
-- ─────────────────────────────────────────────────────────────

alter type product_fit add value if not exists 'conjunto';
