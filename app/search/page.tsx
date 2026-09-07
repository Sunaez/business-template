import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandConfig, getCollections, getProducts } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Search",
  description: "Find your next everyday essential.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const query =
    (Array.isArray(parameters.q) ? parameters.q[0] : parameters.q)?.trim() ??
    "";
  const [brand, products, collections] = await Promise.all([
    getBrandConfig(),
    getProducts(),
    getCollections(),
  ]);
  return (
    <div className="catalog-page container">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">Something in mind?</p>
          <h1>{query ? "The search is on." : "Find your everyday."}</h1>
          <p>Search by piece, colour, material, or mood.</p>
        </div>
      </div>
      <form className="search-form" action="/search" method="get" role="search">
        <label className="sr-only" htmlFor="search-query">
          Search products
        </label>
        <input
          id="search-query"
          type="search"
          name="q"
          placeholder="Try ‘heavyweight’"
          defaultValue={query}
          key={query}
          autoComplete="off"
        />
        <button type="submit" aria-label="Search">
          <ArrowRight size={24} strokeWidth={1.5} />
        </button>
      </form>
      <div className="search-suggestions">
        <span>Explore:</span>
        {collections
          .filter((collection) => collection.featured)
          .slice(0, 4)
          .map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`}>
              {collection.title}
            </Link>
          ))}
      </div>
      <CatalogBrowser
        products={products}
        collections={collections}
        brand={brand}
        query={query}
        showCategories={false}
      />
    </div>
  );
}
