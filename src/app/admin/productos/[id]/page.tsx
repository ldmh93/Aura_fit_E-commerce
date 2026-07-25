import { notFound } from "next/navigation";
import { AdminPage } from "@/features/admin/components/AdminUI";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getCategories } from "@/services/categories.service";
import { getProductById } from "@/services/products.mutations";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <AdminPage
      title={product.name}
      description={`SKU ${product.sku} · ${product.stock} unidades en inventario.`}
    >
      <div className="max-w-4xl">
        <ProductForm categories={categories} product={product} />
      </div>
    </AdminPage>
  );
}
