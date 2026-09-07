import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  RotateCcw,
  Sprout,
} from "lucide-react";
import { getBrandConfig, getCollections, getProducts } from "@/lib/catalog";
import { Hero } from "@/components/layout/Hero";
import { BusinessFeatures } from "@/components/content/BusinessFeatures";
import { Newsletter } from "@/components/layout/Newsletter";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  BrandStorySplit,
  CampaignFeature,
  EditorialImageGrid,
  QuoteSection,
} from "@/components/content/Editorial";
import type { Brand, Collection, HomepageSection, Product } from "@/types";

function CollectionStrip({
  collections,
  brand,
}: {
  collections: Collection[];
  brand: Brand;
}) {
  return (
    <nav
      id="essentials"
      className="collection-strip"
      aria-label="Shop by category"
    >
      <Link href="/shop" className="collection-strip-intro">
        {brand.discovery.stripTitle}
        <ArrowRight size={16} />
      </Link>
      <div>
        {collections
          .filter((c) => brand.discovery.stripCollectionSlugs.includes(c.slug))
          .map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`}>
              {collection.title}
              <ArrowUpRight size={13} />
            </Link>
          ))}
      </div>
      <span className="collection-strip-note">{brand.discovery.stripNote}</span>
    </nav>
  );
}

function ProductSection({
  brand,
  products,
  section,
}: {
  brand: Brand;
  products: Product[];
  section: "newArrivals" | "bestSellers" | "featuredCollection";
}) {
  const collectionSlug =
    section === "bestSellers"
      ? "best-sellers"
      : section === "newArrivals"
        ? "new-arrivals"
        : brand.featuredCollectionSlug;
  const copy = brand.sectionCopy[section];
  return (
    <section id={section} className="home-products container">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <Link href={`/collections/${collectionSlug}`} className="text-link">
          {copy.linkLabel}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <ProductGrid
        products={products}
        variant={brand.layout.productCard}
        gridVariant={brand.layout.productGrid}
        locale={brand.locale}
      />
      <div className="home-product-footnote">
        <span>{copy.description}</span>
        <span>01 — {String(products.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}

function CategoryTiles({
  brand,
  collections,
}: {
  brand: Brand;
  collections: Collection[];
}) {
  return (
    <section className="home-categories container">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{brand.sectionCopy.categoryTiles.eyebrow}</p>
          <h2>{brand.sectionCopy.categoryTiles.title}</h2>
        </div>
        <Link href="/shop" className="text-link">
          {brand.sectionCopy.categoryTiles.linkLabel}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className={`category-grid category-grid-${brand.layout.collection}`}>
        {collections
          .filter((c) =>
            brand.discovery.categoryCollectionSlugs.includes(c.slug),
          )
          .map((collection, index) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="category-tile"
            >
              <div className="category-tile-image">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(max-width: 640px) 78vw, 32vw"
                />
              </div>
              <div className="category-tile-caption">
                <span>
                  <small>
                    0{index + 1} / {brand.discovery.categoryCaption}
                  </small>
                  <h3>{collection.title}</h3>
                </span>
                <span className="category-arrow">
                  <ArrowUpRight size={22} />
                </span>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}

function ServiceStrip({ brand }: { brand: Brand }) {
  return (
    <div className="service-strip container">
      <Link href="/shipping-returns">
        <PackageCheck size={24} strokeWidth={1.3} />
        <div>
          <strong>{brand.serviceCopy.shipping.title}</strong>
          <span>
            {brand.serviceCopy.shipping.description.replace(
              "{threshold}",
              new Intl.NumberFormat(brand.locale, {
                style: "currency",
                currency: brand.currency,
                maximumFractionDigits: 0,
              }).format(brand.freeShippingThreshold / 100),
            )}
          </span>
        </div>
      </Link>
      <Link href="/shipping-returns">
        <RotateCcw size={23} strokeWidth={1.3} />
        <div>
          <strong>{brand.serviceCopy.returns.title}</strong>
          <span>
            {brand.serviceCopy.returns.description.replace(
              "{days}",
              String(brand.returns.windowDays),
            )}
          </span>
        </div>
      </Link>
      <Link href="/for-business">
        <Sprout size={24} strokeWidth={1.3} />
        <div>
          <strong>{brand.serviceCopy.craft.title}</strong>
          <span>{brand.serviceCopy.craft.description}</span>
        </div>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [brand, collections, products] = await Promise.all([
    getBrandConfig(),
    getCollections(),
    getProducts(),
  ]);
  const renderSection = (section: HomepageSection, index: number) => {
    switch (section) {
      case "businessFeatures":
        return <BusinessFeatures key={`${section}-${index}`} brand={brand} />;
      case "hero":
        return (
          <div key={`${section}-${index}`}>
            <Hero brand={brand} />
            <CollectionStrip collections={collections} brand={brand} />
          </div>
        );
      case "newArrivals":
      case "bestSellers":
      case "featuredCollection":
        return (
          <ProductSection
            key={`${section}-${index}`}
            section={section}
            brand={brand}
            products={products
              .filter((p) =>
                section === "bestSellers"
                  ? p.bestSeller
                  : section === "newArrivals"
                    ? p.newArrival
                    : p.collectionIds.includes(
                        collections.find(
                          (c) => c.slug === brand.featuredCollectionSlug,
                        )?.id ?? brand.featuredCollectionSlug,
                      ),
              )
              .slice(
                0,
                brand.layout.productGrid === "spacious"
                  ? 3
                  : brand.layout.productGrid === "compact"
                    ? 5
                    : 4,
              )}
          />
        );
      case "editorialSplit":
        return (
          <BrandStorySplit
            key={`${section}-${index}`}
            story={brand.story}
            brandName={brand.name}
          />
        );
      case "campaign":
        return (
          <CampaignFeature
            key={`${section}-${index}`}
            campaign={brand.campaign}
          />
        );
      case "categoryTiles":
        return (
          <CategoryTiles
            key={`${section}-${index}`}
            brand={brand}
            collections={collections}
          />
        );
      case "brandStory":
        return (
          <QuoteSection
            key={`${section}-${index}`}
            quote={brand.story.quote}
            attribution={brand.name}
          />
        );
      case "promotion":
        return (
          <section key={`${section}-${index}`} className="promotion-section">
            <p className="eyebrow">{brand.promotion.description}</p>
            <h2>{brand.promotion.title}</h2>
            <Link className="button" href={brand.promotion.cta.href}>
              {brand.promotion.cta.label}
              <ArrowUpRight size={17} />
            </Link>
          </section>
        );
      case "socialGallery":
        return (
          <EditorialImageGrid
            key={`${section}-${index}`}
            title={brand.sectionCopy.socialGallery.title}
            images={[
              brand.hero.image,
              brand.story.image,
              ...products.slice(0, 2).map((p) => p.images[0]),
            ]}
          />
        );
      case "newsletter":
        return <Newsletter key={`${section}-${index}`} brand={brand} />;
    }
  };
  return (
    <>
      {brand.homepageSections.map(renderSection)}
      <ServiceStrip brand={brand} />
    </>
  );
}
