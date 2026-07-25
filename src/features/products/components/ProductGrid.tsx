import { PackageSearch } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";
import { cn } from "@/utils";

export function ProductGrid({
  products,
  className,
  emptyMessage = "No encontramos productos con esos filtros.",
}: {
  products: Product[];
  className?: string;
  emptyMessage?: string;
}) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-graphite/40 px-8 py-20 text-center">
        <PackageSearch className="h-8 w-8 text-mist/50" />
        <p className="text-sm text-mist">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <RevealGroup
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <RevealItem key={product.id}>
          <ProductCard product={product} priority={index < 4} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
