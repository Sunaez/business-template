"use client";

import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { createDemoOrders, demoAddresses, demoCustomer } from "@/data/accounts";
import {
  getInventorySummary,
  isOrderStatus,
  normalizeAddresses,
  validateAddress,
  validateStock,
} from "@/lib/account";
import type {
  AccountPreferences,
  DemoAddress,
  DemoOrder,
  DemoProfile,
  ValidationResult,
} from "@/types/account";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SaveResult = ValidationResult<true>;
interface OrdersContextValue {
  orders: DemoOrder[];
  updateOrder: (number: string, status: unknown) => SaveResult;
}
interface InventoryContextValue {
  stock: Record<string, number>;
  summary: ReturnType<typeof getInventorySummary>;
  updateStock: (
    productId: string,
    values: Record<string, unknown>,
  ) => SaveResult;
}
interface CustomerContextValue {
  profile: DemoProfile;
  preferences: AccountPreferences;
  addresses: DemoAddress[];
  wishlist: string[];
  removePiece: (id: string) => void;
  restorePiece: (id: string) => void;
  saveAddress: (address: DemoAddress) => SaveResult;
  removeAddress: (id: string) => void;
  makeDefault: (id: string) => void;
  saveProfile: (
    name: string,
    email: string,
    preferences: AccountPreferences,
  ) => SaveResult;
}
const OrdersContext = createContext<OrdersContextValue | null>(null);
const InventoryContext = createContext<InventoryContextValue | null>(null);
const CustomerContext = createContext<CustomerContextValue | null>(null);

function OrdersProvider({ children }: { children: ReactNode }) {
  const { products, brand } = useStorefront();
  const [orders, setOrders] = useState(() => createDemoOrders(products, brand));
  const updateOrder = useCallback(
    (number: string, status: unknown): SaveResult => {
      if (
        !isOrderStatus(status) ||
        !orders.some((order) => order.number === number)
      )
        return { ok: false, message: "Choose a valid order and status." };
      setOrders((current) =>
        current.map((order) =>
          order.number === number ? { ...order, status } : order,
        ),
      );
      return { ok: true, value: true };
    },
    [orders],
  );
  const value = useMemo(() => ({ orders, updateOrder }), [orders, updateOrder]);
  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

function InventoryProvider({ children }: { children: ReactNode }) {
  const { products } = useStorefront();
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      products.flatMap((product) =>
        product.variants.map((variant) => [variant.id, variant.stock]),
      ),
    ),
  );
  const summary = useMemo(
    () => getInventorySummary(products, stock),
    [products, stock],
  );
  const updateStock = useCallback(
    (productId: string, values: Record<string, unknown>): SaveResult => {
      const product = products.find((item) => item.id === productId);
      if (!product)
        return { ok: false, message: "This product is unavailable." };
      const result = validateStock(product, values);
      if (!result.ok) return result;
      setStock((current) => ({ ...current, ...result.value }));
      return { ok: true, value: true };
    },
    [products],
  );
  const value = useMemo(
    () => ({ stock, summary, updateStock }),
    [stock, summary, updateStock],
  );
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

function CustomerProvider({ children }: { children: ReactNode }) {
  const { products } = useStorefront();
  const [profile, setProfile] = useState(demoCustomer);
  const [preferences, setPreferences] = useState<AccountPreferences>({
    news: true,
    restocks: false,
  });
  const [addresses, setAddresses] = useState(demoAddresses);
  const [wishlist, setWishlist] = useState(() =>
    ["overshirt", "cargo-pant", "crewneck", "merino-knit"].filter((id) =>
      products.some((product) => product.id === id),
    ),
  );
  const removePiece = useCallback(
    (id: string) =>
      setWishlist((current) => current.filter((item) => item !== id)),
    [],
  );
  const restorePiece = useCallback(
    (id: string) => {
      if (products.some((product) => product.id === id))
        setWishlist((current) =>
          current.includes(id) ? current : [...current, id],
        );
    },
    [products],
  );
  const saveAddress = useCallback((address: DemoAddress): SaveResult => {
    const result = validateAddress(address);
    if (!result.ok) return result;
    const saved = { ...result.value, id: address.id || crypto.randomUUID() };
    setAddresses((current) =>
      normalizeAddresses(
        current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      ),
    );
    return { ok: true, value: true };
  }, []);
  const removeAddress = useCallback(
    (id: string) =>
      setAddresses((current) =>
        normalizeAddresses(current.filter((item) => item.id !== id)),
      ),
    [],
  );
  const makeDefault = useCallback(
    (id: string) =>
      setAddresses((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) => ({ ...item, isDefault: item.id === id }))
          : current,
      ),
    [],
  );
  const saveProfile = useCallback(
    (
      name: string,
      email: string,
      nextPreferences: AccountPreferences,
    ): SaveResult => {
      name = name.trim();
      email = email.trim();
      if (
        !name ||
        name.length > 80 ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
        return {
          ok: false,
          message: "Enter a name and a valid email address.",
        };
      setProfile((current) => ({
        ...current,
        name,
        email,
        initials: name
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      }));
      setPreferences({
        news: !!nextPreferences.news,
        restocks: !!nextPreferences.restocks,
      });
      return { ok: true, value: true };
    },
    [],
  );
  const value = useMemo(
    () => ({
      profile,
      preferences,
      addresses,
      wishlist,
      removePiece,
      restorePiece,
      saveAddress,
      removeAddress,
      makeDefault,
      saveProfile,
    }),
    [
      profile,
      preferences,
      addresses,
      wishlist,
      removePiece,
      restorePiece,
      saveAddress,
      removeAddress,
      makeDefault,
      saveProfile,
    ],
  );
  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function DemoAccountProvider({ children }: { children: ReactNode }) {
  return (
    <CustomerProvider>
      <OrdersProvider>
        <InventoryProvider>{children}</InventoryProvider>
      </OrdersProvider>
    </CustomerProvider>
  );
}
export function useAccountOrders() {
  const value = useContext(OrdersContext);
  if (!value) throw new Error("OrdersProvider is required");
  return value;
}
export function useAccountInventory() {
  const value = useContext(InventoryContext);
  if (!value) throw new Error("InventoryProvider is required");
  return value;
}
export function useAccountCustomer() {
  const value = useContext(CustomerContext);
  if (!value) throw new Error("CustomerProvider is required");
  return value;
}
