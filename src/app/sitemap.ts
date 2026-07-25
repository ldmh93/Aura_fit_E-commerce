import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import { SITE } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getAllProductSlugs(),
    getCategories(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE.url}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...[
      "como-comprar",
      "entregas",
      "guia-de-tallas",
      "cambios",
      "contacto",
      "privacidad",
      "terminos",
    ].map((path) => ({
      url: `${SITE.url}/${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE.url}/categoria/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE.url}/producto/${product.slug}`,
    lastModified: new Date(product.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
