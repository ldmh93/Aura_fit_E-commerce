import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPage } from "@/features/admin/components/AdminUI";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getCategories } from "@/services/categories.service";
import { getProductById } from "@/services/products.service";
import { getInventoryForProduct } from "@/services/inventory.service";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, inventory] = await Promise.all([
    getProductById(id),
    getCategories(true),
    getInventoryForProduct(id),
  ]);

  if (!product) notFound();

  return (
    <AdminPage
      title={product.name}
      description={`SKU ${product.sku} · ${product.stock} piezas en inventario.`}
      action={
        <Link
          href={`/producto/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-aura hover:underline"
        >
          Ver en la tienda
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      <div className="max-w-4xl">
        <ProductForm
          categories={categories}
          product={product}
          inventory={inventory}
        />
      </div>
    </AdminPage>
  );
}
