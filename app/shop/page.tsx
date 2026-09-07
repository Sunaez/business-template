import type { Metadata } from "next";
import { getBrandConfig, getCollections, getProducts } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig();
  return {
    title: "All pieces",
    description: `Explore clothing and everyday essentials from ${brand.name}. ${brand.description}`,
  };
}

export default async function ShopPage() {
  const [brand, products, collections] = await Promise.all([
    getBrandConfig(),
    getProducts(),
    getCollections(),
  ]);
  return (
    <div className="catalog-page container">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">The everyday, considered.</p>
          <h1>All pieces.</h1>
          <p>
            Good design starts with what you reach for every day. Explore the
            full collection and find your next constant.
          </p>
        </div>
        <span className="catalog-heading__aside">
          {brand.name} / The collection
        </span>
      </div>
      <CatalogBrowser
        products={products}
        collections={collections}
        brand={brand}
      />
    </div>
  );
}
