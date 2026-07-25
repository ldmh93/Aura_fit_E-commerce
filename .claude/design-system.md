# Design System — AURA FIT

Estética: **fitness premium futurista**. Negro profundo, metal, luz azul.
Debe competir visualmente con marcas deportivas internacionales.

## Tokens de color

Definidos en `src/app/globals.css` con `@theme`.

| Token              | Hex       | Uso                                        |
| ------------------ | --------- | ------------------------------------------ |
| `--color-void`     | `#050505` | Fondo principal de toda la app             |
| `--color-graphite` | `#111111` | Cards, superficies elevadas, secciones     |
| `--color-steel`    | `#1A1A1D` | Bordes suaves, inputs, hover de superficie |
| `--color-silver`   | `#C7D7E8` | Color de marca, títulos, iconos            |
| `--color-aura`     | `#5EA8FF` | Acento: CTA, focus, glow, links activos    |
| `--color-mist`     | `#8A93A0` | Texto secundario / muted                   |
| `--color-white`    | `#FFFFFF` | Texto principal                            |

Estados (uso mínimo, nunca decorativo):
`--color-success #3FD9A0`, `--color-warning #E8C46A`, `--color-danger #FF5C5C`.

**Prohibido:** dorado, naranja o rojo como color de marca o decoración.

## Gradientes de marca

```css
--gradient-metal: linear-gradient(135deg, #ffffff 0%, #c7d7e8 40%, #7f8fa4 70%, #eaf2ff 100%);
--gradient-aura:  linear-gradient(135deg, #5ea8ff 0%, #c7d7e8 100%);
```

`.text-metal` aplica el gradiente metálico sobre texto (títulos de marca).

## Tipografía

- **Display / títulos:** geométrica ancha, `tracking` amplio, MAYÚSCULAS.
  Fuente: Geist Sans (fallback: Inter, system-ui).
- **Cuerpo:** Geist Sans, 15–16px, `text-mist` para secundario.
- **Números / SKU / precios:** tabular, `font-variant-numeric: tabular-nums`.

Escala: `text-xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 /
4xl 40 / 5xl 56 / 6xl 72`.

Los títulos de sección usan `tracking-[0.2em] uppercase text-xs text-aura`
como eyebrow, seguidos del H2 grande.

## Botones

- **Primario:** fondo plata metálica, texto negro, `rounded-full`,
  glow azul al hover, `transition 250ms`.
- **Secundario:** borde 1px `white/15`, fondo transparente, hover borde `aura`.
- **Fantasma:** solo texto, subrayado animado.
- Radio: `rounded-full` para CTAs, `rounded-xl` para controles de formulario.
- Altura mínima táctil: 44px.

## Cards

- Fondo `graphite`, borde `1px white/8`, `rounded-2xl`.
- Hover: borde `aura/40` + sombra `0 0 40px -12px rgba(94,168,255,.5)`.
- Imagen con `aspect-[4/5]`, `object-cover`, zoom suave al hover (scale 1.04).
- Sin sombras duras ni bordes gruesos.

## Animaciones

Elegantes, nunca exageradas.

- Duración: 200–600ms. Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Entrada de secciones: fade + `translateY(24px)`, con `whileInView` y `once`.
- Stagger entre hijos: 60–80ms.
- Respetar `prefers-reduced-motion`.
- Nada de rebotes, giros ni parpadeos.

## Efectos de luz

- Halos radiales azules a baja opacidad detrás del hero y las secciones clave.
- Líneas divisorias con gradiente que se desvanece a los lados.
- Ruido/grain sutil sobre fondos planos (opcional, ≤3% opacidad).

## Layout

- Contenedor: `max-w-7xl`, padding `px-5 md:px-8`.
- Ritmo vertical de secciones: `py-20 md:py-28`.
- Grid de producto: 2 columnas en móvil, 3 en tablet, 4 en desktop.

## Accesibilidad

- Contraste mínimo AA sobre fondo `#050505`.
- Foco visible: anillo `aura` de 2px con offset.
- Toda imagen con `alt` descriptivo; iconos decorativos `aria-hidden`.
- Ningún estado comunicado solo por color.
