import type {
  Category,
  Coupon,
  InventoryEntry,
  Order,
  Product,
  ProductColor,
  Size,
} from "@/types";

/**
 * Catálogo de demostración.
 * Se usa mientras no haya credenciales de Supabase, para que la tienda
 * funcione completa en local. Ver .claude/architecture.md
 *
 * Catálogo corto a propósito: AURA FIT es un proveedor pequeño.
 */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Los hex salen de COLOR_PALETTE en `lib/config.ts`. */
const NEGRO: ProductColor = { name: "Negro", hex: "#0A0A0A" };
const GRIS: ProductColor = { name: "Gris", hex: "#6B7280" };
const AZUL: ProductColor = { name: "Azul", hex: "#5EA8FF" };
const PLATA: ProductColor = { name: "Plata", hex: "#C7D7E8" };
const MARINO: ProductColor = { name: "Azul marino", hex: "#1E2A47" };
const MILITAR: ProductColor = { name: "Verde militar", hex: "#4A5340" };
const VINO: ProductColor = { name: "Vino", hex: "#6E2438" };
const BEIGE: ProductColor = { name: "Beige", hex: "#D6C7B0" };
const CORAL: ProductColor = { name: "Coral", hex: "#F0705C" };
const LILA: ProductColor = { name: "Lila", hex: "#A98BD4" };

export const mockCategories: Category[] = [
  {
    id: "cat-hombre",
    name: "Hombre",
    slug: "hombre",
    description:
      "Playeras de compresión, shorts y sudaderas para entrenamiento y uso diario.",
    image: U("1517836357463-d25dfeac3438", 1400),
    active: true,
    sort_order: 1,
  },
  {
    id: "cat-mujer",
    name: "Mujer",
    slug: "mujer",
    description:
      "Leggings, tops y conjuntos con ajuste de segunda piel y soporte real.",
    image: U("1518611012118-696072aa579a", 1400),
    active: true,
    sort_order: 2,
  },
];

interface Seed {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  material: string;
  price: number;
  old_price?: number;
  sku: string;
  images: string[];
  category_id: string;
  fit: Product["fit"];
  sizes: Size[];
  colors: ProductColor[];
  featured?: boolean;
}

const seeds: Seed[] = [
  {
    id: "p-001",
    name: "Playera Compression AURA",
    slug: "playera-compression-aura",
    description:
      "Tejido de compresión graduada que sostiene el músculo durante el esfuerzo y acelera la recuperación. Costuras planas para cero fricción en sesiones largas.",
    features: [
      "Compresión graduada",
      "Secado rápido",
      "Elasticidad en cuatro direcciones",
      "Costuras planas anti-rozadura",
    ],
    material: "78% Poliamida · 22% Elastano",
    price: 699,
    old_price: 899,
    sku: "AF-001",
    images: [
      U("1517836357463-d25dfeac3438"),
      U("1594381898411-846e7d193883"),
      U("1483721310020-03333e577078"),
    ],
    category_id: "cat-hombre",
    fit: "superior",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS, AZUL, MARINO],
    featured: true,
  },
  {
    id: "p-002",
    name: 'Short Velocity 7"',
    slug: "short-velocity-7",
    description:
      "Short de entrenamiento ultraligero con forro interior de compresión. Para correr y entrenar sin pensar en la prenda.",
    features: [
      "Forro interior de compresión",
      "Tejido ultraligero",
      "Bolsa lateral con cierre",
      "Cintura elástica con cordón",
    ],
    material: "88% Poliéster reciclado · 12% Elastano",
    price: 549,
    sku: "AF-002",
    images: [
      U("1591195853828-11db59a44f6b"),
      U("1552902865-b72c031ac5ea"),
      U("1483721310020-03333e577078"),
    ],
    category_id: "cat-hombre",
    fit: "inferior",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS],
    featured: true,
  },
  {
    id: "p-003",
    name: "Hoodie Aura Tech",
    slug: "hoodie-aura-tech",
    description:
      "Sudadera técnica de peso medio con interior afelpado. La transición entre el gimnasio y la calle.",
    features: [
      "Interior afelpado térmico",
      "Corte relajado",
      "Logo en acabado metálico",
      "Puños y bajo elásticos",
    ],
    material: "60% Algodón orgánico · 40% Poliéster reciclado",
    price: 1149,
    sku: "AF-003",
    images: [
      U("1556821840-3a63f95609a7"),
      U("1620799140408-edc6dcb6d633"),
      U("1523398002811-999ca8dec234"),
    ],
    category_id: "cat-hombre",
    fit: "superior",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS, MILITAR, VINO],
    featured: true,
  },
  {
    id: "p-004",
    name: "Playera Essential Dry",
    slug: "playera-essential-dry",
    description:
      "El básico bien hecho. Corte limpio, caída correcta y tejido que respira.",
    features: [
      "Tejido transpirable de tacto algodón",
      "Corte regular",
      "Cuello reforzado",
      "Logo tono sobre tono",
    ],
    material: "92% Poliéster reciclado · 8% Elastano",
    price: 449,
    sku: "AF-004",
    images: [
      U("1521572163474-6864f9cf17ab"),
      U("1583743814966-8936f5b7be1a"),
      U("1503341504253-dff4815485f1"),
    ],
    category_id: "cat-hombre",
    fit: "superior",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS, PLATA],
  },
  {
    id: "p-005",
    name: "Legging Sculpt Tiro Alto",
    slug: "legging-sculpt-tiro-alto",
    description:
      "Tiro alto con paneles de sostén que esculpen la silueta sin restringir el movimiento. Tejido opaco garantizado en sentadilla.",
    features: [
      "Banda de sostén de 12 cm",
      "Tejido opaco en sentadilla",
      "Bolsillo lateral para teléfono",
      "Costura posterior que estiliza",
    ],
    material: "75% Nylon · 25% Elastano",
    price: 849,
    old_price: 1049,
    sku: "AF-005",
    images: [
      U("1506629082955-511b1aa562c8"),
      U("1518611012118-696072aa579a"),
      U("1571019613454-1cb2f99b2d8b"),
    ],
    category_id: "cat-mujer",
    fit: "inferior",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, PLATA, AZUL],
    featured: true,
  },
  {
    id: "p-006",
    name: "Top Impact Support",
    slug: "top-impact-support",
    description:
      "Top deportivo de alto impacto con copas removibles y espalda cruzada. Soporte real para entrenamiento intenso.",
    features: [
      "Soporte de alto impacto",
      "Copas removibles",
      "Espalda cruzada",
      "Malla de ventilación dorsal",
    ],
    material: "80% Poliamida · 20% Elastano",
    price: 599,
    sku: "AF-006",
    images: [
      U("1571019613454-1cb2f99b2d8b"),
      U("1518611012118-696072aa579a"),
      U("1506629082955-511b1aa562c8"),
    ],
    category_id: "cat-mujer",
    fit: "superior",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, PLATA, CORAL, VINO],
    featured: true,
  },
  {
    id: "p-007",
    name: "Top Seamless Aura",
    slug: "top-seamless-aura",
    description:
      "Tejido en una sola pieza, sin costuras. Compresión progresiva y cero puntos de fricción.",
    features: [
      "Tejido circular sin costuras",
      "Compresión progresiva",
      "Impacto medio",
      "Acabado mate",
    ],
    material: "82% Nylon · 18% Elastano",
    price: 649,
    old_price: 799,
    sku: "AF-007",
    images: [
      U("1518310383802-640c2de311b2"),
      U("1571019613454-1cb2f99b2d8b"),
      U("1518611012118-696072aa579a"),
    ],
    category_id: "cat-mujer",
    fit: "superior",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, AZUL, PLATA],
  },
  {
    id: "p-008",
    name: "Legging Contour",
    slug: "legging-contour",
    description:
      "Compresión ligera con costuras de contorno que siguen la línea natural de la pierna.",
    features: [
      "Compresión ligera de uso prolongado",
      "Costuras de contorno anatómico",
      "Cintura ancha que no rueda",
      "Tobillo con acabado limpio",
    ],
    material: "77% Nylon · 23% Elastano",
    price: 799,
    sku: "AF-008",
    images: [
      U("1518611012118-696072aa579a"),
      U("1506629082955-511b1aa562c8"),
      U("1571019613454-1cb2f99b2d8b"),
    ],
    category_id: "cat-mujer",
    fit: "inferior",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, AZUL, LILA],
  },
  {
    id: "p-009",
    name: "Gorra Performance",
    slug: "gorra-performance",
    description:
      "Gorra de entrenamiento con ajuste trasero y tela transpirable. Talla única.",
    features: [
      "Ajuste trasero regulable",
      "Tela transpirable",
      "Visera preformada",
      "Logo bordado",
    ],
    material: "100% Poliéster reciclado",
    price: 349,
    sku: "AF-009",
    images: [
      U("1588850561407-ed78c282e89b"),
      U("1521369909029-2afed882baee"),
      U("1517836357463-d25dfeac3438"),
    ],
    category_id: "cat-hombre",
    fit: "superior",
    sizes: ["Unitalla"],
    colors: [NEGRO, MARINO, MILITAR],
  },
];

/** Cantidades deterministas: evita diferencias entre servidor y cliente. */
function quantityFor(productIndex: number, sizeIndex: number, colorIndex: number) {
  const base = (productIndex * 5 + sizeIndex * 3 + colorIndex * 7) % 14;
  return base < 2 ? 0 : base;
}

const inventory: InventoryEntry[] = [];

export const mockProducts: Product[] = seeds.map((seed, pi) => {
  seed.sizes.forEach((size, si) => {
    seed.colors.forEach((color, ci) => {
      inventory.push({
        id: `inv-${seed.id}-${size}-${ci}`,
        product_id: seed.id,
        size,
        color: color.name,
        quantity: quantityFor(pi, si, ci),
      });
    });
  });

  const stock = inventory
    .filter((entry) => entry.product_id === seed.id)
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const category = mockCategories.find((c) => c.id === seed.category_id);

  return {
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    features: seed.features,
    material: seed.material,
    price: seed.price,
    old_price: seed.old_price ?? null,
    sku: seed.sku,
    images: seed.images,
    video: null,
    category_id: seed.category_id,
    category_name: category?.name,
    category_slug: category?.slug,
    fit: seed.fit,
    sizes: seed.sizes,
    colors: seed.colors,
    stock,
    featured: seed.featured ?? false,
    status: stock > 0 ? "activo" : "agotado",
    created_at: new Date(2026, 2, 1 + pi * 12).toISOString(),
  };
});

export const mockInventory: InventoryEntry[] = inventory;

export const mockCoupons: Coupon[] = [
  {
    id: "cup-1",
    code: "AURA20",
    discount: 20,
    starts_at: new Date(2026, 0, 1).toISOString(),
    expiration: new Date(2026, 11, 31).toISOString(),
    active: true,
  },
  {
    id: "cup-2",
    code: "BIENVENIDA10",
    discount: 10,
    starts_at: new Date(2026, 0, 1).toISOString(),
    expiration: new Date(2026, 11, 31).toISOString(),
    active: true,
  },
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export const mockOrders: Order[] = [
  {
    id: "ord-1",
    order_number: "AF-000121",
    customer_name: "Daniela Ruiz",
    phone: "4171234567",
    items: [
      {
        product_id: "p-005",
        name: "Legging Sculpt Tiro Alto",
        sku: "AF-005",
        size: "M",
        color: "Negro",
        quantity: 1,
        unit_price: 849,
        image: seeds[4]!.images[0]!,
      },
    ],
    subtotal: 849,
    discount: 0,
    total: 849,
    coupon_code: null,
    status: "pendiente",
    meeting_point: null,
    notes: null,
    created_at: daysAgo(1),
  },
  {
    id: "ord-2",
    order_number: "AF-000122",
    customer_name: "Marco Estrada",
    phone: "4179876543",
    items: [
      {
        product_id: "p-001",
        name: "Playera Compression AURA",
        sku: "AF-001",
        size: "L",
        color: "Negro",
        quantity: 2,
        unit_price: 699,
        image: seeds[0]!.images[0]!,
      },
    ],
    subtotal: 1398,
    discount: 280,
    total: 1118,
    coupon_code: "AURA20",
    status: "pagado",
    meeting_point: "Plaza principal, 18:00",
    notes: null,
    created_at: daysAgo(4),
  },
  {
    id: "ord-3",
    order_number: "AF-000123",
    customer_name: "Sofía Lara",
    phone: "4175551234",
    items: [
      {
        product_id: "p-006",
        name: "Top Impact Support",
        sku: "AF-006",
        size: "S",
        color: "Negro",
        quantity: 1,
        unit_price: 599,
        image: seeds[5]!.images[0]!,
      },
      {
        product_id: "p-008",
        name: "Legging Contour",
        sku: "AF-008",
        size: "S",
        color: "Azul",
        quantity: 1,
        unit_price: 799,
        image: seeds[7]!.images[0]!,
      },
    ],
    subtotal: 1398,
    discount: 0,
    total: 1398,
    coupon_code: null,
    status: "entregado",
    meeting_point: "Gimnasio Centro, sábado 11:00",
    notes: "Cliente frecuente.",
    created_at: daysAgo(9),
  },
  {
    id: "ord-4",
    order_number: "AF-000124",
    customer_name: "Iván Peña",
    phone: "4173334455",
    items: [
      {
        product_id: "p-003",
        name: "Hoodie Aura Tech",
        sku: "AF-003",
        size: "M",
        color: "Gris",
        quantity: 1,
        unit_price: 1149,
        image: seeds[2]!.images[0]!,
      },
    ],
    subtotal: 1149,
    discount: 0,
    total: 1149,
    coupon_code: null,
    status: "entregado",
    meeting_point: "Parque Juárez, 19:30",
    notes: null,
    created_at: daysAgo(16),
  },
  {
    id: "ord-5",
    order_number: "AF-000125",
    customer_name: "Regina Ortiz",
    phone: "4178889900",
    items: [
      {
        product_id: "p-007",
        name: "Top Seamless Aura",
        sku: "AF-007",
        size: "M",
        color: "Plata",
        quantity: 2,
        unit_price: 649,
        image: seeds[6]!.images[0]!,
      },
    ],
    subtotal: 1298,
    discount: 130,
    total: 1168,
    coupon_code: "BIENVENIDA10",
    status: "confirmado",
    meeting_point: null,
    notes: "Pendiente de acordar punto de encuentro.",
    created_at: daysAgo(2),
  },
  {
    id: "ord-6",
    order_number: "AF-000126",
    customer_name: "Luis Cabrera",
    phone: "4172223344",
    items: [
      {
        product_id: "p-002",
        name: 'Short Velocity 7"',
        sku: "AF-002",
        size: "L",
        color: "Negro",
        quantity: 1,
        unit_price: 549,
        image: seeds[1]!.images[0]!,
      },
    ],
    subtotal: 549,
    discount: 0,
    total: 549,
    coupon_code: null,
    status: "entregado",
    meeting_point: "Plaza principal, 17:00",
    notes: null,
    created_at: daysAgo(38),
  },
];
