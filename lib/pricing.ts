import type {
  CartTotals,
  MoneyCurrency,
  Product,
  ProductVariant,
} from "@/types";

export function formatPrice(
  amount: number,
  currency: MoneyCurrency | string = "GBP",
  locale = "en-GB",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount / 100) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function getVariantPrice(
  product: Product,
  variant?: ProductVariant,
): number {
  if (!variant) return product.price;
  const record = product.variants.find(
    (candidate) =>
      candidate.id === variant.id &&
      candidate.productId === product.id &&
      candidate.businessId === product.businessId,
  );
  return record?.price ?? product.price;
}

export function getPriceRange(product: Product): { min: number; max: number } {
  const prices = product.variants.map((variant) =>
    getVariantPrice(product, variant),
  );
  return prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: product.price, max: product.price };
}

export function getDiscountPercentage(
  price: number,
  compareAtPrice?: number,
): number {
  return compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;
}

export interface CartTotalSettings {
  freeShippingThreshold: number;
  shippingPrice: number;
  discount?: number;
  /** Express delivery may explicitly bypass the standard free-shipping offer. */
  allowFreeShipping?: boolean;
}

function assertMinorUnits(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(
      `${label} must be a non-negative integer in minor currency units.`,
    );
}

/** Pricing only. Inventory is validated separately at add-to-cart and checkout. */
export function calculateCartTotals(
  lines: { product: Product; variant: ProductVariant; quantity: number }[],
  settings: CartTotalSettings,
): CartTotals {
  assertMinorUnits(settings.freeShippingThreshold, "Free shipping threshold");
  assertMinorUnits(settings.shippingPrice, "Shipping price");
  assertMinorUnits(settings.discount ?? 0, "Discount");
  const subtotal = lines.reduce((sum, line) => {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1)
      throw new RangeError("Cart quantity must be a positive integer.");
    const price = getVariantPrice(line.product, line.variant);
    assertMinorUnits(price, "Product price");
    const nextTotal = sum + price * line.quantity;
    if (!Number.isSafeInteger(nextTotal))
      throw new RangeError("Cart subtotal exceeds the safe integer range.");
    return nextTotal;
  }, 0);
  const discount = Math.min(settings.discount ?? 0, subtotal);
  const netSubtotal = subtotal - discount;
  const qualifiesForFreeShipping =
    lines.length > 0 && netSubtotal >= settings.freeShippingThreshold;
  const shipping =
    !lines.length ||
    (settings.allowFreeShipping !== false && qualifiesForFreeShipping)
      ? 0
      : settings.shippingPrice;
  const total = netSubtotal + shipping;
  if (!Number.isSafeInteger(total))
    throw new RangeError("Cart total exceeds the safe integer range.");
  return {
    subtotal,
    discount,
    shipping,
    total,
    freeShippingRemaining: Math.max(
      0,
      settings.freeShippingThreshold - netSubtotal,
    ),
    qualifiesForFreeShipping,
  };
}
