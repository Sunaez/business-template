"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type {
  Brand,
  Collection,
  Product,
  ProductFilters,
  ProductSort,
} from "@/types";
import { filterProducts } from "@/lib/catalog-filter";
import { formatPrice } from "@/lib/pricing";
import { Drawer } from "@/components/ui/Drawer";
import { ProductGrid } from "./ProductGrid";
import "./catalog.css";

interface CatalogBrowserProps {
  products: Product[];
  collections: Collection[];
  brand: Brand;
  currentCollection?: string;
  query?: string;
  showCategories?: boolean;
}

export function CatalogBrowser({
  products,
  collections,
  brand,
  currentCollection,
  query,
  showCategories = true,
}: CatalogBrowserProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<ProductSort>("featured");
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [collectionId, setCollectionId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [availability, setAvailability] = useState<
    "all" | "in-stock" | "unavailable"
  >("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const availableOptions = useMemo(() => {
    const gathered = new Map<string, Set<string>>();
    products.forEach((product) =>
      product.options.forEach((option) => {
        const existing = gathered.get(option.name) ?? new Set<string>();
        option.values.forEach((value) => existing.add(value));
        gathered.set(option.name, existing);
      }),
    );
    return Array.from(gathered, ([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [products]);
  const availableTags = useMemo(
    () =>
      Array.from(new Set(products.flatMap((product) => product.tags))).sort(),
    [products],
  );
  const relevantCollections = useMemo(
    () =>
      collections.filter((collection) =>
        products.some((product) =>
          product.collectionIds.includes(collection.id),
        ),
      ),
    [products, collections],
  );
  const filters: ProductFilters = {
    query,
    options,
    collectionId: collectionId || undefined,
    tags,
    minPrice: minPrice === "" ? undefined : Math.round(Number(minPrice) * 100),
    maxPrice: maxPrice === "" ? undefined : Math.round(Number(maxPrice) * 100),
    available: availability === "all" ? undefined : availability === "in-stock",
    sort,
  };
  const visibleProducts = filterProducts(products, filters);
  const filterCount =
    Object.values(options).reduce((count, values) => count + values.length, 0) +
    tags.length +
    Number(!!collectionId) +
    Number(availability !== "all") +
    Number(!!minPrice) +
    Number(!!maxPrice);
  const collectionTitle = collections.find(
    (collection) => collection.id === collectionId,
  )?.title;

  function toggleOption(name: string, value: string) {
    setOptions((current) => ({
      ...current,
      [name]: current[name]?.includes(value)
        ? current[name].filter((item) => item !== value)
        : [...(current[name] ?? []), value],
    }));
  }
  function clearFilters() {
    setOptions({});
    setCollectionId("");
    setTags([]);
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <>
      {showCategories && (
        <nav className="catalog-categories" aria-label="Shop collections">
          <Link
            href="/shop"
            aria-current={!currentCollection ? "page" : undefined}
          >
            All pieces
          </Link>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              aria-current={
                currentCollection === collection.slug ? "page" : undefined
              }
            >
              {collection.title}
            </Link>
          ))}
        </nav>
      )}
      <div className="catalog-toolbar">
        <div className="catalog-toolbar__left">
          <button
            type="button"
            className="catalog-filter-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
            Filter{filterCount > 0 && ` (${filterCount})`}
          </button>
          <span
            className="catalog-toolbar__count"
            role="status"
            aria-live="polite"
          >
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "piece" : "pieces"}
          </span>
        </div>
        <div className="catalog-toolbar__right">
          <label htmlFor="catalog-sort">Sort by</label>
          <select
            id="catalog-sort"
            className="catalog-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ProductSort)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
      {filterCount > 0 && (
        <div className="catalog-active-filters" aria-label="Active filters">
          {Object.entries(options).flatMap(([name, values]) =>
            values.map((value) => (
              <button
                type="button"
                key={`${name}-${value}`}
                onClick={() => toggleOption(name, value)}
                aria-label={`Remove ${name}: ${value} filter`}
              >
                {name}: {value}
                <X size={11} aria-hidden="true" />
              </button>
            )),
          )}
          {collectionId && (
            <button type="button" onClick={() => setCollectionId("")}>
              {collectionTitle}
              <X size={11} aria-hidden="true" />
            </button>
          )}
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() =>
                setTags((current) => current.filter((item) => item !== tag))
              }
            >
              {tag}
              <X size={11} aria-hidden="true" />
            </button>
          ))}
          {availability !== "all" && (
            <button type="button" onClick={() => setAvailability("all")}>
              {availability === "in-stock"
                ? "In stock"
                : "Out of stock / coming soon"}
              <X size={11} aria-hidden="true" />
            </button>
          )}
          {minPrice && (
            <button type="button" onClick={() => setMinPrice("")}>
              From{" "}
              {formatPrice(
                Number(minPrice) * 100,
                brand.currency,
                brand.locale,
              )}
              <X size={11} aria-hidden="true" />
            </button>
          )}
          {maxPrice && (
            <button type="button" onClick={() => setMaxPrice("")}>
              Up to{" "}
              {formatPrice(
                Number(maxPrice) * 100,
                brand.currency,
                brand.locale,
              )}
              <X size={11} aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={clearFilters}>
            Clear all
          </button>
        </div>
      )}
      {visibleProducts.length > 0 ? (
        <ProductGrid
          products={visibleProducts}
          variant={brand.layout.productCard}
          gridVariant={brand.layout.productGrid}
          locale={brand.locale}
        />
      ) : (
        <div className="catalog-empty">
          <h2>A fresh start?</h2>
          <p>
            {query
              ? `We couldn’t find any pieces matching “${query}”${filterCount ? " with these filters" : ""}.`
              : "No pieces match your selected filters. Try a little less specific."}
          </p>
          {filterCount > 0 ? (
            <button type="button" className="button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <Link href="/shop" className="button">
              Explore all pieces
            </Link>
          )}
        </div>
      )}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Find your pieces"
        side="left"
        className="catalog-filter-drawer"
      >
        <div className="catalog-filter-dialog__body">
          {availableOptions.map((option) => (
            <fieldset key={option.name} className="catalog-filter-group">
              <legend>{option.name}</legend>
              <div className="catalog-filter-options">
                {option.values.map((value) => (
                  <label key={value} className="catalog-filter-option">
                    <input
                      type="checkbox"
                      checked={options[option.name]?.includes(value) ?? false}
                      onChange={() => toggleOption(option.name, value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <fieldset className="catalog-filter-group">
            <legend>Collection</legend>
            <div className="catalog-filter-options catalog-filter-options--list">
              <label className="catalog-filter-option">
                <input
                  type="radio"
                  name="filter-collection"
                  checked={collectionId === ""}
                  onChange={() => setCollectionId("")}
                />
                All collections
              </label>
              {relevantCollections.map((collection) => (
                <label className="catalog-filter-option" key={collection.id}>
                  <input
                    type="radio"
                    name="filter-collection"
                    checked={collectionId === collection.id}
                    onChange={() => setCollectionId(collection.id)}
                  />
                  {collection.title}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="catalog-filter-group">
            <legend>Price ({brand.currency})</legend>
            <div className="catalog-filter-price">
              <label>
                From
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="Any price"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <fieldset className="catalog-filter-group">
            <legend>Availability</legend>
            <div className="catalog-filter-options">
              <label className="catalog-filter-option">
                <input
                  type="radio"
                  name="filter-availability"
                  checked={availability === "all"}
                  onChange={() => setAvailability("all")}
                />
                All pieces
              </label>
              <label className="catalog-filter-option">
                <input
                  type="radio"
                  name="filter-availability"
                  checked={availability === "in-stock"}
                  onChange={() => setAvailability("in-stock")}
                />
                In stock
              </label>
              <label className="catalog-filter-option">
                <input
                  type="radio"
                  name="filter-availability"
                  checked={availability === "unavailable"}
                  onChange={() => setAvailability("unavailable")}
                />
                Out of stock / coming soon
              </label>
            </div>
          </fieldset>
          {availableTags.length > 0 && (
            <fieldset className="catalog-filter-group">
              <legend>Details</legend>
              <div className="catalog-filter-options catalog-filter-options--list">
                {availableTags.map((tag) => (
                  <label className="catalog-filter-option" key={tag}>
                    <input
                      type="checkbox"
                      checked={tags.includes(tag)}
                      onChange={() =>
                        setTags((current) =>
                          current.includes(tag)
                            ? current.filter((item) => item !== tag)
                            : [...current, tag],
                        )
                      }
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
        <div className="catalog-filter-dialog__footer">
          <button
            type="button"
            className="catalog-filter-clear"
            onClick={clearFilters}
          >
            Clear all
          </button>
          <button
            type="button"
            className="button"
            onClick={() => setDrawerOpen(false)}
          >
            Show {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "piece" : "pieces"}
          </button>
        </div>
      </Drawer>
    </>
  );
}
