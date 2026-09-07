"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Brand, CartItem, Product, ProductVariant } from "@/types";
import { getVariantPrice } from "@/lib/pricing";
import { isVariantPurchasable } from "@/lib/variants";
import { useBrowserReady } from "./useBrowserReady";
import "./commerce.css";

export interface CartLine {
  key: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

type CartResult = { success: boolean; message?: string };
interface CartContextValue {
  brand: Brand;
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  persistenceError: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    productId: string,
    variantId: string,
    quantity?: number,
  ) => CartResult;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
export const cartItemKey = (productId: string, variantId: string) =>
  `${productId}:${variantId}`;

function normalizeCart(value: unknown, products: Product[]): CartItem[] {
  if (!Array.isArray(value)) return [];
  const valid: CartItem[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const { productId, variantId, quantity } = candidate as CartItem;
    const product = products.find((item) => item.id === productId);
    const variant = product?.variants.find((item) => item.id === variantId);
    if (
      !product ||
      !variant ||
      !isVariantPurchasable(product, variant) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    )
      continue;
    const existing = valid.find(
      (item) => item.productId === productId && item.variantId === variantId,
    );
    if (existing)
      existing.quantity = Math.min(variant.stock, existing.quantity + quantity);
    else
      valid.push({
        productId,
        variantId,
        quantity: Math.min(variant.stock, quantity),
      });
  }
  return valid;
}

export function CartProvider({
  products,
  brand,
  children,
}: {
  products: Product[];
  brand: Brand;
  children: ReactNode;
}) {
  const storageKey = `storefront:${brand.businessId}:cart:v1`;
  const [initialCart] = useState(() => {
    if (typeof window === "undefined")
      return { items: [] as CartItem[], error: false };
    try {
      const stored = localStorage.getItem(storageKey);
      return {
        items: normalizeCart(stored ? JSON.parse(stored) : [], products),
        error: false,
      };
    } catch {
      return { items: [] as CartItem[], error: true };
    }
  });
  const [storedItems, setItems] = useState<CartItem[]>(initialCart.items);
  const itemsRef = useRef<CartItem[]>(initialCart.items);
  const hydrated = useBrowserReady();
  const items = useMemo(
    () => (hydrated ? storedItems : []),
    [hydrated, storedItems],
  );
  const [persistenceError, setPersistenceError] = useState(initialCart.error);
  const [isOpen, setIsOpen] = useState(false);
  const commit = useCallback(
    (next: CartItem[]) => {
      itemsRef.current = next;
      setItems(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        setPersistenceError(false);
      } catch {
        setPersistenceError(true);
      }
    },
    [storageKey],
  );

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      try {
        const next = normalizeCart(
          event.newValue ? JSON.parse(event.newValue) : [],
          products,
        );
        itemsRef.current = next;
        setItems(next);
      } catch {
        /* Ignore an invalid write from another tab. */
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey, products]);

  const addItem = useCallback(
    (productId: string, variantId: string, quantity = 1): CartResult => {
      const product = products.find((item) => item.id === productId);
      const variant = product?.variants.find((item) => item.id === variantId);
      if (!product || !variant || !isVariantPurchasable(product, variant))
        return {
          success: false,
          message: "This combination is currently unavailable.",
        };
      if (!Number.isSafeInteger(quantity) || quantity < 1)
        return { success: false, message: "Please choose a valid quantity." };
      const existing = itemsRef.current.find(
        (item) => item.productId === productId && item.variantId === variantId,
      );
      if ((existing?.quantity ?? 0) + quantity > variant.stock)
        return {
          success: false,
          message: `Only ${variant.stock} available. ${existing?.quantity ?? 0} already in your bag.`,
        };
      commit(
        existing
          ? itemsRef.current.map((item) =>
              item === existing
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...itemsRef.current, { productId, variantId, quantity }],
      );
      return { success: true };
    },
    [products, commit],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string) =>
      commit(
        itemsRef.current.filter(
          (item) =>
            item.productId !== productId || item.variantId !== variantId,
        ),
      ),
    [commit],
  );
  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) return;
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      const product = products.find((item) => item.id === productId);
      const variant = product?.variants.find((item) => item.id === variantId);
      if (!product || !variant || !isVariantPurchasable(product, variant)) {
        removeItem(productId, variantId);
        return;
      }
      commit(
        itemsRef.current.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.min(quantity, variant.stock) }
            : item,
        ),
      );
    },
    [products, commit, removeItem],
  );

  const lines = useMemo(
    () =>
      items.flatMap((item): CartLine[] => {
        const product = products.find((entry) => entry.id === item.productId);
        const variant = product?.variants.find(
          (entry) => entry.id === item.variantId,
        );
        if (!product || !variant) return [];
        const unitPrice = getVariantPrice(product, variant);
        return [
          {
            key: cartItemKey(item.productId, item.variantId),
            product,
            variant,
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
          },
        ];
      }),
    [items, products],
  );
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        brand,
        items,
        lines,
        count,
        subtotal,
        hydrated,
        persistenceError: hydrated && persistenceError,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clearCart: () => commit([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
