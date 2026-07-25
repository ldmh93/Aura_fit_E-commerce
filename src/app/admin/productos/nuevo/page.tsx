import { AdminPage } from "@/features/admin/components/AdminUI";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { getCategories } from "@/services/categories.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <AdminPage
      title="Nuevo producto"
      description="Las variantes de inventario se crean en cero y se ajustan después."
    >
      <div className="max-w-4xl">
        <ProductForm categories={categories} />
      </div>
    </AdminPage>
  );
}
