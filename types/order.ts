import type { MoneyCurrency, ProductImage } from "./product";

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Customer {
  id: string;
  businessId: string;
  email: string;
  phone?: string;
  shippingAddress?: Address;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  selectedOptions: Record<string, string>;
  image: ProductImage;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  businessId: string;
  orderNumber: string;
  createdAt: string;
  customer: Customer;
  shippingAddress: Address;
  items: OrderItem[];
  currency: MoneyCurrency;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  deliveryMethod: "standard" | "express";
  status: "demo" | "pending" | "paid" | "fulfilled" | "cancelled";
}
