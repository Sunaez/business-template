"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { Brand, Product } from "@/types";
import { ProductGrid } from "@/components/catalog/ProductGrid";

const eventName = "storefront:recently-viewed";
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(eventName, listener);
  };
};
const serverSnapshot = () => null;
const parseIds = (value: string | null): string[] => {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string").slice(0, 12)
      : [];
  } catch {
    return [];
  }
};

export function RecentlyViewed({
  currentProductId,
  products,
  brand,
}: {
  currentProductId: string;
  products: Product[];
  brand: Brand;
}) {
  const storageKey = `storefront:${brand.businessId}:recent:v1`;
  const read = useCallback(() => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }, [storageKey]);
  const stored = useSyncExternalStore(subscribe, read, serverSnapshot);
  const recent = useMemo(
    () =>
      parseIds(stored)
        .filter((id) => id !== currentProductId)
        .flatMap((id) => {
          const product = products.find(
            (item) => item.id === id && item.businessId === brand.businessId,
          );
          return product ? [product] : [];
        })
        .slice(0, 4),
    [stored, currentProductId, products, brand.businessId],
  );

  useEffect(() => {
    try {
      const ids = [
        currentProductId,
        ...parseIds(localStorage.getItem(storageKey)).filter(
          (id) => id !== currentProductId,
        ),
      ].slice(0, 12);
      localStorage.setItem(storageKey, JSON.stringify(ids));
      window.dispatchEvent(new Event(eventName));
    } catch {
      /* Browsing remains fully usable without storage. */
    }
  }, [currentProductId, storageKey]);

  if (!recent.length) return null;
  return (
    <section className="product-related recently-viewed">
      <div className="product-related__heading">
        <div>
          <p className="eyebrow">Worth a second look</p>
          <h2>Recently viewed.</h2>
        </div>
      </div>
      <ProductGrid
        products={recent}
        variant={brand.layout.productCard}
        gridVariant={brand.layout.productGrid}
        locale={brand.locale}
      />
    </section>
  );
}
