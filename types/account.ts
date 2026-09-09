import type { Address, OrderItem } from "./order";

export const orderStatuses = [
  "Processing",
  "Dispatched",
  "Delivered",
  "Cancelled",
] as const;
export type DemoOrderStatus = (typeof orderStatuses)[number];
export type CustomerSection =
  "overview" | "orders" | "wishlist" | "addresses" | "details";
export type AdminSection = "overview" | "orders" | "inventory" | "customers";
export type StockFilter = "all" | "low" | "out";
export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  joined: string;
}
export interface DemoAddress extends Address {
  id: string;
  label: string;
  isDefault: boolean;
}
export interface DemoOrder {
  number: string;
  customerId: string;
  placed: string;
  status: DemoOrderStatus;
  items: OrderItem[];
  shipping: number;
  total: number;
  address: Address;
}
export interface AccountPreferences {
  news: boolean;
  restocks: boolean;
}
export type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; message: string };
