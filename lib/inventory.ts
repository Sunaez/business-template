import type { Product, ProductVariant } from "@/types";
import { isVariantPurchasable } from "./variants";

export const LOW_STOCK_THRESHOLD = 5;
export type StockStatus =
  "in-stock" | "low-stock" | "out-of-stock" | "coming-soon" | "pre-order";

export function getStockStatus(
  product: Product,
  variant?: ProductVariant,
): StockStatus {
  if (product.inventoryStatus !== "in-stock") return product.inventoryStatus;
  if (!product.available) return "out-of-stock";
  if (!variant)
    return product.variants.some((candidate) =>
      isVariantPurchasable(product, candidate),
    )
      ? "in-stock"
      : "out-of-stock";
  if (!isVariantPurchasable(product, variant)) return "out-of-stock";
  const stock = product.variants.find(
    (candidate) => candidate.id === variant.id,
  )!.stock;
  return stock <= LOW_STOCK_THRESHOLD ? "low-stock" : "in-stock";
}

export function getAvailableQuantity(
  product: Product,
  variantId: string,
): number {
  const variant = product.variants.find(
    (candidate) => candidate.id === variantId,
  );
  return isVariantPurchasable(product, variant) ? variant!.stock : 0;
}

export function getStockMessage(
  product: Product,
  variant?: ProductVariant,
): string {
  switch (getStockStatus(product, variant)) {
    case "coming-soon":
      return "Coming soon";
    case "pre-order":
      return "Pre-order coming soon";
    case "out-of-stock":
      return "Out of stock";
    case "low-stock":
      return `Only ${getAvailableQuantity(product, variant!.id)} left in this option`;
    default:
      return "In stock — ready for your everyday";
  }
}

export { isVariantPurchasable } from "./variants";
