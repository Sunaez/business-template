"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { Drawer } from "@/components/ui/Drawer";
import { filterProducts } from "@/lib/catalog-filter";
import { formatPrice } from "@/lib/pricing";
import { ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export function SearchDrawer({ onClose }: { onClose: () => void }) {
  const { brand, products, collections } = useStorefront();
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => (query.trim() ? filterProducts(products, { query }).slice(0, 4) : []),
    [products, query],
  );

  return (
    <Drawer open onClose={onClose} title={brand.headerCopy.searchTitle}>
      <div className="header-search-body">
        <form
          action="/search"
          className="header-search-form"
          onSubmit={onClose}
        >
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <Search size={20} />
          <input
            id="header-search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={brand.headerCopy.searchPlaceholder}
            autoComplete="off"
          />
          <button
            aria-label="Submit search"
            type="submit"
            className="icon-button"
          >
            <ArrowRight size={21} />
          </button>
        </form>
        {query ? (
          <div className="predictive-results" aria-live="polite">
            <p className="eyebrow">
              {matches.length
                ? brand.headerCopy.searchResultsTitle
                : "No matches just yet"}
            </p>
            {matches.map((product) => (
              <Link
                onClick={onClose}
                href={`/product/${product.slug}`}
                key={product.id}
                className="predictive-product"
              >
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  width={72}
                  height={88}
                />
                <div>
                  <span>{product.name}</span>
                  <small>
                    {formatPrice(product.price, product.currency, brand.locale)}
                  </small>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
            {!matches.length && (
              <p className="muted">{brand.headerCopy.searchEmptyDescription}</p>
            )}
            <Link
              onClick={onClose}
              className="button button-outline"
              href={`/search?q=${encodeURIComponent(query)}`}
            >
              View all results
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="header-search-suggestions">
            <p className="eyebrow">{brand.headerCopy.searchSuggestionsTitle}</p>
            {collections.slice(0, 5).map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                onClick={onClose}
              >
                {collection.title}
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        )}
        {query && (
          <button
            className="text-link clear-search"
            onClick={() => setQuery("")}
          >
            <X size={14} /> Clear search
          </button>
        )}
      </div>
    </Drawer>
  );
}
