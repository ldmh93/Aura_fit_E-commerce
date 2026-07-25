import { AdminPage } from "@/features/admin/components/AdminUI";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getCategories } from "@/services/categories.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories(true);

  return (
    <AdminPage
      title="Nuevo producto"
      description="Las combinaciones de talla y color se crean en cero. Ajusta las existencias en Inventario cuando termines."
    >
      <div className="max-w-4xl">
        <ProductForm categories={categories} />
      </div>
    </AdminPage>
  );
}
