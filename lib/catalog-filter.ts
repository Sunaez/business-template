import type { Product, ProductFilters } from "@/types";
import { getVariantPrice } from "./pricing";
import { isVariantPurchasable } from "./variants";

/** Pure query implementation shared by local DAL and interactive browsing. */
export function filterProducts(
  products: Product[],
  filters: ProductFilters = {},
): Product[] {
  const query = filters.query?.trim().toLocaleLowerCase();
  const optionFilters = { ...filters.options };
  if (filters.sizes?.length) optionFilters.Size = filters.sizes;
  if (filters.colours?.length) optionFilters.Colour = filters.colours;
  const activeOptions = Object.entries(optionFilters).filter(
    ([, values]) => values.length,
  );
  const hasVariantFilter =
    activeOptions.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;
  const filtered = products.filter((product) => {
    if (filters.businessId && product.businessId !== filters.businessId)
      return false;
    if (
      query &&
      ![
        product.name,
        product.shortDescription,
        product.description,
        product.material,
        product.fitDescription,
        ...product.tags,
        ...product.options.flatMap((option) => option.values),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    const collection = filters.collectionId ?? filters.collection;
    if (collection && !product.collectionIds.includes(collection)) return false;
    if (filters.featured !== undefined && product.featured !== filters.featured)
      return false;
    if (
      filters.newArrival !== undefined &&
      product.newArrival !== filters.newArrival
    )
      return false;
    if (
      filters.bestSeller !== undefined &&
      product.bestSeller !== filters.bestSeller
    )
      return false;
    if (
      filters.tags?.length &&
      !filters.tags.some((tag) => product.tags.includes(tag))
    )
      return false;
    const purchasable = product.variants.some((variant) =>
      isVariantPurchasable(product, variant),
    );
    if (filters.available !== undefined && purchasable !== filters.available)
      return false;
    if (
      hasVariantFilter &&
      !product.variants.some((variant) => {
        // An explicit unavailable filter can inspect future/out-of-stock variants.
        if (
          filters.available !== false &&
          !isVariantPurchasable(product, variant)
        )
          return false;
        if (
          !activeOptions.every(([name, values]) =>
            values.includes(variant.selectedOptions[name]),
          )
        )
          return false;
        const price = getVariantPrice(product, variant);
        return (
          (filters.minPrice === undefined || price >= filters.minPrice) &&
          (filters.maxPrice === undefined || price <= filters.maxPrice)
        );
      })
    )
      return false;
    return true;
  });
  filtered.sort((a, b) => {
    if (filters.sort === "price-asc")
      return a.price - b.price || a.sortOrder - b.sortOrder;
    if (filters.sort === "price-desc")
      return b.price - a.price || a.sortOrder - b.sortOrder;
    if (filters.sort === "newest")
      return (
        b.createdAt.localeCompare(a.createdAt) || a.sortOrder - b.sortOrder
      );
    return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder;
  });
  return filters.limit === undefined
    ? filtered
    : filtered.slice(0, Math.max(0, filters.limit));
}
