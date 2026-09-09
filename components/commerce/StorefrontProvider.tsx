"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Brand, Collection, Product } from "@/types";

interface StorefrontData {
  brand: Brand;
  products: Product[];
  collections: Collection[];
}
const StorefrontContext = createContext<StorefrontData | null>(null);

/** Read-only catalogue data is shared independently of cart and account edits. */
export function StorefrontProvider({
  brand,
  products,
  collections,
  children,
}: StorefrontData & { children: ReactNode }) {
  const value = useMemo(
    () => ({ brand, products, collections }),
    [brand, products, collections],
  );
  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const data = useContext(StorefrontContext);
  if (!data) throw new Error("useStorefront requires StorefrontProvider");
  return data;
}
