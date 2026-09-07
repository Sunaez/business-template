import type { Brand, Collection, Product, ProductFilters } from "@/types";
import { brandConfig, DEMO_BUSINESS_ID } from "@/data/brand";
import { collections } from "@/data/collections";
import { products } from "@/data/products";
import { filterProducts } from "./catalog-filter";
import { applyStorefrontPreset } from "@/data/presets";

/**
 * Server data boundary. Swap implementations for Supabase queries without changing
 * storefront components. Every read is scoped before filtering. In production,
 * resolve businessId from a trusted domain mapping and enforce matching RLS policies.
 */
export async function getBrandConfig(
  businessId = DEMO_BUSINESS_ID,
): Promise<Brand> {
  if (businessId !== brandConfig.businessId)
    throw new Error("Storefront not found");
  return structuredClone(
    applyStorefrontPreset(
      brandConfig,
      process.env.STOREFRONT_PRESET ?? "studio",
    ),
  );
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const businessId = filters.businessId ?? DEMO_BUSINESS_ID;
  const scopedCollections = collections.filter(
    (collection) => collection.businessId === businessId,
  );
  const collectionId =
    filters.collectionId ??
    scopedCollections.find(
      (collection) => collection.slug === filters.collection,
    )?.id ??
    filters.collection;
  return structuredClone(
    filterProducts(
      products.filter((product) => product.businessId === businessId),
      { ...filters, businessId, collectionId },
    ),
  );
}

export async function getProductBySlug(
  slug: string,
  businessId = DEMO_BUSINESS_ID,
): Promise<Product | undefined> {
  const product = products.find(
    (item) => item.businessId === businessId && item.slug === slug,
  );
  return product ? structuredClone(product) : undefined;
}

export async function getProductById(
  id: string,
  businessId = DEMO_BUSINESS_ID,
): Promise<Product | undefined> {
  const product = products.find(
    (item) => item.businessId === businessId && item.id === id,
  );
  return product ? structuredClone(product) : undefined;
}

export async function getCollections(
  businessId = DEMO_BUSINESS_ID,
): Promise<Collection[]> {
  return structuredClone(
    collections
      .filter((collection) => collection.businessId === businessId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );
}

export async function getCollectionBySlug(
  slug: string,
  businessId = DEMO_BUSINESS_ID,
): Promise<Collection | undefined> {
  const collection = collections.find(
    (item) => item.businessId === businessId && item.slug === slug,
  );
  return collection ? structuredClone(collection) : undefined;
}

export { filterProducts } from "./catalog-filter";
