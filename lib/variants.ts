import type { Product, ProductVariant } from "@/types";

export function findVariant(
  product: Product,
  selectedOptions: Record<string, string>,
): ProductVariant | undefined {
  if (Object.keys(selectedOptions).length !== product.options.length)
    return undefined;
  if (
    !product.options.every((option) =>
      option.values.includes(selectedOptions[option.name]),
    )
  )
    return undefined;
  return product.variants.find((variant) =>
    product.options.every(
      (option) =>
        variant.selectedOptions[option.name] === selectedOptions[option.name],
    ),
  );
}

/** A variant must belong to the product and tenant, and its catalog record is authoritative. */
export function isVariantPurchasable(
  product: Product,
  variant?: ProductVariant,
  quantity = 1,
): boolean {
  if (!variant || !Number.isSafeInteger(quantity) || quantity < 1) return false;
  if (!product.available || product.inventoryStatus !== "in-stock")
    return false;
  const catalogVariant = product.variants.find(
    (candidate) => candidate.id === variant.id,
  );
  return Boolean(
    catalogVariant &&
    catalogVariant.businessId === product.businessId &&
    catalogVariant.productId === product.id &&
    variant.businessId === product.businessId &&
    variant.productId === product.id &&
    catalogVariant.available &&
    Number.isSafeInteger(catalogVariant.stock) &&
    catalogVariant.stock >= quantity,
  );
}

/** Is this option value compatible with the other selected values and actual stock? */
export function getOptionAvailability(
  product: Product,
  optionName: string,
  value: string,
  selectedOptions: Record<string, string> = {},
): boolean {
  const option = product.options.find(
    (candidate) => candidate.name === optionName,
  );
  if (!option?.values.includes(value)) return false;
  const candidateSelection = { ...selectedOptions, [optionName]: value };
  return product.variants.some(
    (variant) =>
      isVariantPurchasable(product, variant) &&
      Object.entries(candidateSelection).every(
        ([name, selectedValue]) =>
          !selectedValue || variant.selectedOptions[name] === selectedValue,
      ),
  );
}

export function getDefaultVariant(
  product: Product,
): ProductVariant | undefined {
  return product.variants.find((variant) =>
    isVariantPurchasable(product, variant),
  );
}

export function formatVariantOptions(variant: ProductVariant): string {
  return Object.values(variant.selectedOptions).join(" / ");
}
