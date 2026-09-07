import type { Address, Brand, CartItem, Order, Product } from "@/types";
import { calculateCartTotals, getVariantPrice } from "./pricing";
import { isVariantPurchasable } from "./variants";

export interface CheckoutRequest {
  businessId: string;
  items: CartItem[];
  email: string;
  phone?: string;
  shippingAddress: Address;
  deliveryMethod: "standard" | "express";
}

export interface CheckoutSession {
  order: Order;
  redirectUrl: string;
}

/** Replace this boundary with a server-created Stripe/Connect session in a live store. */
export interface CheckoutGateway {
  createSession(request: CheckoutRequest): Promise<CheckoutSession>;
}

export const demoOrderStorageKey = (businessId: string) =>
  `storefront:${businessId}:demo-order:v1`;

/** Re-resolve prices, stock and tenant membership from the catalogue, never stored cart totals. */
export function createDemoOrder(
  request: CheckoutRequest,
  brand: Brand,
  products: Product[],
): Order {
  if (request.businessId !== brand.businessId)
    throw new Error("This bag belongs to a different store.");
  if (!request.items.length)
    throw new Error("Add an item to your bag before checking out.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim()))
    throw new Error("Enter a valid email address.");
  const address = request.shippingAddress;
  if (
    address.fullName.trim().length < 2 ||
    address.line1.trim().length < 3 ||
    address.city.trim().length < 2 ||
    address.postcode.trim().length < 3
  )
    throw new Error("Complete your delivery address.");
  if (address.country !== brand.country)
    throw new Error("Delivery is not available to this country in the demo.");
  if (!["standard", "express"].includes(request.deliveryMethod))
    throw new Error("Choose a valid delivery method.");
  const merged = new Map<string, CartItem>();
  for (const item of request.items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1)
      throw new Error("Choose a valid quantity.");
    const key = `${item.productId}:${item.variantId}`;
    const previous = merged.get(key);
    merged.set(key, {
      ...item,
      quantity: item.quantity + (previous?.quantity ?? 0),
    });
  }
  const lines = [...merged.values()].map((item) => {
    const product = products.find(
      (candidate) =>
        candidate.id === item.productId &&
        candidate.businessId === brand.businessId,
    );
    const variant = product?.variants.find(
      (candidate) => candidate.id === item.variantId,
    );
    if (
      !product ||
      !variant ||
      product.currency !== brand.currency ||
      !isVariantPurchasable(product, variant, item.quantity)
    )
      throw new Error(
        "An item is no longer available in the requested quantity. Please review your bag.",
      );
    return { product, variant, quantity: item.quantity };
  });
  const totals = calculateCartTotals(lines, {
    freeShippingThreshold: brand.freeShippingThreshold,
    shippingPrice:
      request.deliveryMethod === "express"
        ? brand.shipping.expressPrice
        : brand.shipping.standardPrice,
    allowFreeShipping: request.deliveryMethod === "standard",
  });
  const id = crypto.randomUUID();
  return {
    id,
    businessId: brand.businessId,
    orderNumber: `DEMO-${id.slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    customer: {
      id: `guest-${id}`,
      businessId: brand.businessId,
      email: request.email.trim(),
      phone: request.phone?.trim() || undefined,
    },
    shippingAddress: structuredClone(address),
    items: lines.map(({ product, variant, quantity }) => ({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      sku: variant.sku,
      selectedOptions: { ...variant.selectedOptions },
      image: variant.image ?? product.images[0],
      quantity,
      unitPrice: getVariantPrice(product, variant),
    })),
    currency: brand.currency,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    deliveryMethod: request.deliveryMethod,
    status: "demo",
  };
}

export function createLocalCheckoutGateway(
  brand: Brand,
  products: Product[],
  storage: Pick<Storage, "setItem">,
): CheckoutGateway {
  return {
    async createSession(request) {
      const order = createDemoOrder(request, brand, products);
      storage.setItem(
        demoOrderStorageKey(brand.businessId),
        JSON.stringify(order),
      );
      return { order, redirectUrl: "/order-confirmation" };
    },
  };
}
