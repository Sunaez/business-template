import type { Product, ProductVariant } from "./product";

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartLine extends CartItem {
  product: Product;
  variant: ProductVariant;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
  qualifiesForFreeShipping: boolean;
}
