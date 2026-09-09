import type { Product, ProductCardVariant, ProductGridVariant } from "@/types";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: Product[];
  variant?: ProductCardVariant;
  gridVariant?: ProductGridVariant;
  className?: string;
  locale?: string;
  eager?: boolean;
}

export function ProductGrid({
  products,
  variant = "minimal",
  gridVariant = "standard",
  className = "",
  locale,
  eager,
}: ProductGridProps) {
  return (
    <div
      className={`product-grid product-grid--${variant} product-grid--${gridVariant} ${className}`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          variant={variant}
          locale={locale}
          eager={eager}
        />
      ))}
    </div>
  );
}
