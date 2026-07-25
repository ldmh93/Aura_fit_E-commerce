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
 * Se usa automáticamente cuando no hay credenciales de Supabase, para que
 * `npm run dev` funcione sin configuración. Ver .claude/architecture.md
 *
 * Al conectar Supabase, este archivo deja de usarse: los datos reales viven
 * en la base de datos (ver supabase/seed.sql).
 */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const NEGRO: ProductColor = { name: "Negro", hex: "#0A0A0A" };
const GRIS: ProductColor = { name: "Gris", hex: "#6B7280" };
const AZUL: ProductColor = { name: "Azul", hex: "#5EA8FF" };
const PLATA: ProductColor = { name: "Plata", hex: "#C7D7E8" };

export const mockCategories: Category[] = [
  {
    id: "cat-playeras",
    name: "Playeras",
    slug: "playeras",
    image: U("1521572163474-6864f9cf17ab", 800),
  },
  {
    id: "cat-shorts",
    name: "Shorts",
    slug: "shorts",
    image: U("1591195853828-11db59a44f6b", 800),
  },
  {
    id: "cat-leggings",
    name: "Leggings",
    slug: "leggings",
    image: U("1506629082955-511b1aa562c8", 800),
  },
  {
    id: "cat-hoodies",
    name: "Hoodies",
    slug: "hoodies",
    image: U("1556821840-3a63f95609a7", 800),
  },
  {
    id: "cat-tops",
    name: "Tops",
    slug: "tops",
    image: U("1571019613454-1cb2f99b2d8b", 800),
  },
  {
    id: "cat-joggers",
    name: "Joggers",
    slug: "joggers",
    image: U("1552902865-b72c031ac5ea", 800),
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
  collection: Product["collection"];
  gender: Product["gender"];
  sizes: Size[];
  colors: ProductColor[];
  featured?: boolean;
}

const seeds: Seed[] = [
  {
    id: "p-001",
    name: "Playera Compression AURA",
    slug: "playera-compression-aura-negra",
    description:
      "La pieza base del sistema AURA PERFORMANCE. Tejido de compresión graduada que sostiene el músculo durante el esfuerzo y acelera la recuperación. Costuras planas selladas para cero fricción incluso en sesiones largas.",
    features: [
      "Tela deportiva premium de compresión graduada",
      "Tecnología de secado rápido Dry-Aura",
      "Elasticidad multidireccional 4-way stretch",
      "Ajuste ergonómico de segunda piel",
      "Costuras planas anti-rozadura",
      "Tratamiento antibacterial permanente",
    ],
    material: "78% Poliamida · 22% Elastano",
    price: 699,
    old_price: 899,
    sku: "AF-PC-001",
    images: [
      U("1517836357463-d25dfeac3438"),
      U("1594381898411-846e7d193883"),
      U("1483721310020-03333e577078"),
      U("1571019613454-1cb2f99b2d8b"),
    ],
    category_id: "cat-playeras",
    collection: "aura-performance",
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS, AZUL],
    featured: true,
  },
  {
    id: "p-002",
    name: "Short Velocity 7\"",
    slug: "short-velocity-7",
    description:
      "Short de entrenamiento ultraligero con forro interior de compresión. Diseñado para correr, entrenar y moverte sin pensar en la prenda.",
    features: [
      "Forro interior de compresión integrado",
      "Tejido ripstop ultraligero de 95 g/m²",
      "Bolsa lateral con cierre invisible",
      "Cintura elástica con cordón plano",
      "Ventilación láser en zonas de calor",
    ],
    material: "88% Poliéster reciclado · 12% Elastano",
    price: 549,
    sku: "AF-SV-002",
    images: [
      U("1591195853828-11db59a44f6b"),
      U("1552902865-b72c031ac5ea"),
      U("1483721310020-03333e577078"),
    ],
    category_id: "cat-shorts",
    collection: "aura-performance",
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS],
    featured: true,
  },
  {
    id: "p-003",
    name: "Legging Sculpt High-Waist",
    slug: "legging-sculpt-high-waist",
    description:
      "Legging de tiro alto con paneles de sostén que esculpen la silueta sin restringir el movimiento. Tejido opaco garantizado en sentadilla.",
    features: [
      "Tiro alto con banda de sostén de 12 cm",
      "Tejido opaco squat-proof certificado",
      "Paneles ergonómicos de realce",
      "Bolsillo lateral para teléfono",
      "Costura posterior en V que estiliza",
    ],
    material: "75% Nylon · 25% Elastano",
    price: 849,
    old_price: 1049,
    sku: "AF-LS-003",
    images: [
      U("1506629082955-511b1aa562c8"),
      U("1518611012118-696072aa579a"),
      U("1571019613454-1cb2f99b2d8b"),
    ],
    category_id: "cat-leggings",
    collection: "aura-women",
    gender: "mujer",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [NEGRO, PLATA, AZUL],
    featured: true,
  },
  {
    id: "p-004",
    name: "Hoodie Aura Tech",
    slug: "hoodie-aura-tech",
    description:
      "Sudadera técnica de peso medio con interior afelpado. La transición perfecta entre el gimnasio y la calle.",
    features: [
      "Interior afelpado térmico",
      "Capucha con forro de contraste",
      "Logo AURA en acabado metálico reflectante",
      "Puños y bajo elásticos",
      "Corte relajado boxy fit",
    ],
    material: "60% Algodón orgánico · 40% Poliéster reciclado",
    price: 1299,
    sku: "AF-HT-004",
    images: [
      U("1556821840-3a63f95609a7"),
      U("1620799140408-edc6dcb6d633"),
      U("1523398002811-999ca8dec234"),
    ],
    category_id: "cat-hoodies",
    collection: "aura-street",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [NEGRO, GRIS],
    featured: true,
  },
  {
    id: "p-005",
    name: "Top Impact Support",
    slug: "top-impact-support",
    description:
      "Top deportivo de alto impacto con copas removibles y espalda de tirantes cruzados. Sostén real para entrenamiento intenso.",
    features: [
      "Soporte de alto impacto",
      "Copas removibles moldeadas",
      "Espalda cruzada de amplio rango",
      "Banda inferior sin costura",
      "Malla de ventilación en zona dorsal",
    ],
    material: "80% Poliamida · 20% Elastano",
    price: 599,
    sku: "AF-TI-005",
    images: [
      U("1571019613454-1cb2f99b2d8b"),
      U("1518611012118-696072aa579a"),
      U("1506629082955-511b1aa562c8"),
    ],
    category_id: "cat-tops",
    collection: "aura-women",
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, PLATA],
  },
  {
    id: "p-006",
    name: "Jogger Motion",
    slug: "jogger-motion",
    description:
      "Jogger de corte afilado con caída limpia. Tejido con memoria de forma que no se deforma en la rodilla.",
    features: [
      "Tejido con memoria de forma",
      "Corte tapered afilado al tobillo",
      "Bolsillos con cierre YKK",
      "Cintura elástica con cordón metálico",
      "Detalle reflectante en pierna",
    ],
    material: "94% Poliéster · 6% Elastano",
    price: 1149,
    sku: "AF-JM-006",
    images: [
      U("1552902865-b72c031ac5ea"),
      U("1523398002811-999ca8dec234"),
      U("1483721310020-03333e577078"),
    ],
    category_id: "cat-joggers",
    collection: "aura-street",
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS],
  },
  {
    id: "p-007",
    name: "Playera Essential Dry",
    slug: "playera-essential-dry",
    description:
      "El básico premium. Corte limpio, caída perfecta y tejido que respira. La playera que vas a querer en todos los colores.",
    features: [
      "Tejido transpirable de tacto algodón",
      "Corte regular fit",
      "Cuello reforzado que no se deforma",
      "Logo minimalista tono sobre tono",
    ],
    material: "92% Poliéster reciclado · 8% Elastano",
    price: 449,
    sku: "AF-PE-007",
    images: [
      U("1521572163474-6864f9cf17ab"),
      U("1583743814966-8936f5b7be1a"),
      U("1503341504253-dff4815485f1"),
    ],
    category_id: "cat-playeras",
    collection: "aura-essential",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [NEGRO, GRIS, PLATA],
  },
  {
    id: "p-008",
    name: "Legging Contour Femme",
    slug: "legging-contour-femme",
    description:
      "Legging de compresión ligera con costuras de contorno que siguen la línea natural de la pierna.",
    features: [
      "Compresión ligera de uso prolongado",
      "Costuras de contorno anatómico",
      "Cintura ancha que no rueda",
      "Tobillo con acabado limpio",
    ],
    material: "77% Nylon · 23% Elastano",
    price: 799,
    sku: "AF-LC-008",
    images: [
      U("1518611012118-696072aa579a"),
      U("1506629082955-511b1aa562c8"),
      U("1571019613454-1cb2f99b2d8b"),
    ],
    category_id: "cat-leggings",
    collection: "aura-women",
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, AZUL],
  },
  {
    id: "p-009",
    name: "Playera Oversize Street",
    slug: "playera-oversize-street",
    description:
      "Silueta amplia con hombro caído y bajo recto. Estética de gimnasio llevada al terreno urbano.",
    features: [
      "Corte oversize con hombro caído",
      "Gramaje pesado de 220 g/m²",
      "Estampado metálico en espalda",
      "Bajo recto sin costura lateral",
    ],
    material: "100% Algodón peinado",
    price: 599,
    sku: "AF-PO-009",
    images: [
      U("1523398002811-999ca8dec234"),
      U("1503341504253-dff4815485f1"),
      U("1620799140408-edc6dcb6d633"),
    ],
    category_id: "cat-playeras",
    collection: "aura-street",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS],
  },
  {
    id: "p-010",
    name: "Short Training Essential",
    slug: "short-training-essential",
    description:
      "Short de entrenamiento de uso diario. Simple, resistente y con la caída correcta.",
    features: [
      "Tejido resistente de doble cara",
      "Largo 9 pulgadas",
      "Bolsillos laterales profundos",
      "Cintura elástica plana",
    ],
    material: "90% Poliéster · 10% Elastano",
    price: 429,
    sku: "AF-ST-010",
    images: [
      U("1483721310020-03333e577078"),
      U("1591195853828-11db59a44f6b"),
      U("1552902865-b72c031ac5ea"),
    ],
    category_id: "cat-shorts",
    collection: "aura-essential",
    gender: "hombre",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, GRIS],
  },
  {
    id: "p-011",
    name: "Hoodie Chrome — Limited",
    slug: "hoodie-chrome-limited",
    description:
      "Edición limitada de 200 piezas numeradas. Acabado cromado en el emblema AURA y etiqueta interior con número de serie. Sin restock.",
    features: [
      "Producción limitada de 200 piezas numeradas",
      "Emblema cromado de alta densidad",
      "Etiqueta interior con número de serie",
      "Interior afelpado premium 380 g/m²",
      "Empaque de colección incluido",
    ],
    material: "70% Algodón orgánico · 30% Poliéster reciclado",
    price: 1899,
    sku: "AF-HC-011",
    images: [
      U("1620799140408-edc6dcb6d633"),
      U("1556821840-3a63f95609a7"),
      U("1523398002811-999ca8dec234"),
    ],
    category_id: "cat-hoodies",
    collection: "limited-edition",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: [NEGRO, PLATA],
    featured: true,
  },
  {
    id: "p-012",
    name: "Top Seamless Aura",
    slug: "top-seamless-aura",
    description:
      "Top sin costuras tejido en una sola pieza. Compresión progresiva y cero puntos de fricción.",
    features: [
      "Tejido circular sin costuras",
      "Compresión progresiva por zonas",
      "Impacto medio",
      "Acabado mate premium",
    ],
    material: "82% Nylon · 18% Elastano",
    price: 649,
    old_price: 799,
    sku: "AF-TS-012",
    images: [
      U("1518310383802-640c2de311b2"),
      U("1571019613454-1cb2f99b2d8b"),
      U("1518611012118-696072aa579a"),
    ],
    category_id: "cat-tops",
    collection: "aura-performance",
    gender: "mujer",
    sizes: ["XS", "S", "M", "L"],
    colors: [NEGRO, AZUL, PLATA],
  },
];

/** Cantidades deterministas por variante — evita hidratación inconsistente. */
function quantityFor(productIndex: number, sizeIndex: number, colorIndex: number) {
  const base = (productIndex * 7 + sizeIndex * 5 + colorIndex * 3) % 23;
  // Algunas variantes intencionalmente en 0 o en stock bajo, para probar la UI.
  if (base < 2) return 0;
  if (base < 5) return base;
  return base;
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
    collection: seed.collection,
    gender: seed.gender,
    sizes: seed.sizes,
    colors: seed.colors,
    stock,
    featured: seed.featured ?? false,
    status: stock > 0 ? "activo" : "agotado",
    created_at: new Date(2026, 0, 1 + pi * 9).toISOString(),
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
    product_id: null,
    active: true,
  },
  {
    id: "cup-2",
    code: "BIENVENIDA10",
    discount: 10,
    starts_at: new Date(2026, 0, 1).toISOString(),
    expiration: new Date(2026, 11, 31).toISOString(),
    product_id: null,
    active: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord-1",
    order_number: "AF-000121",
    customer_name: "Daniela Ruiz",
    phone: "5215512345678",
    items: [
      {
        product_id: "p-003",
        name: "Legging Sculpt High-Waist",
        sku: "AF-LS-003",
        size: "M",
        color: "Negro",
        quantity: 1,
        unit_price: 849,
        image: seeds[2]!.images[0]!,
      },
    ],
    subtotal: 849,
    discount: 0,
    total: 849,
    coupon_code: null,
    status: "pendiente",
    notes: null,
    created_at: new Date(2026, 6, 22).toISOString(),
  },
  {
    id: "ord-2",
    order_number: "AF-000122",
    customer_name: "Marco Estrada",
    phone: "5215587654321",
    items: [
      {
        product_id: "p-001",
        name: "Playera Compression AURA",
        sku: "AF-PC-001",
        size: "L",
        color: "Negro",
        quantity: 2,
        unit_price: 699,
        image: seeds[0]!.images[0]!,
      },
    ],
    subtotal: 1398,
    discount: 279,
    total: 1119,
    coupon_code: "AURA20",
    status: "pagado",
    notes: "Guía DHL 7712345678",
    created_at: new Date(2026, 6, 19).toISOString(),
  },
  {
    id: "ord-3",
    order_number: "AF-000123",
    customer_name: "Sofía Lara",
    phone: "5215599887766",
    items: [
      {
        product_id: "p-011",
        name: "Hoodie Chrome — Limited",
        sku: "AF-HC-011",
        size: "S",
        color: "Plata",
        quantity: 1,
        unit_price: 1899,
        image: seeds[10]!.images[0]!,
      },
      {
        product_id: "p-005",
        name: "Top Impact Support",
        sku: "AF-TI-005",
        size: "S",
        color: "Negro",
        quantity: 1,
        unit_price: 599,
        image: seeds[4]!.images[0]!,
      },
    ],
    subtotal: 2498,
    discount: 0,
    total: 2498,
    coupon_code: null,
    status: "enviado",
    notes: null,
    created_at: new Date(2026, 6, 12).toISOString(),
  },
];
