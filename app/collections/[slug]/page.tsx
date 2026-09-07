import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBrandConfig,
  getCollections,
  getCollectionBySlug,
  getProducts,
} from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getCollections()).map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug((await params).slug);
  return {
    title: collection?.title ?? "Collection",
    description: collection?.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const [brand, collection, collections] = await Promise.all([
    getBrandConfig(),
    getCollectionBySlug(slug),
    getCollections(),
  ]);
  if (!collection) notFound();
  const products = await getProducts({ collectionId: collection.id });
  return (
    <div className="catalog-page container">
      <div
        className={`catalog-heading${brand.layout.collection === "editorial" ? " catalog-heading--editorial" : ""}`}
      >
        <div>
          <p className="eyebrow">The collection / {brand.name}</p>
          <h1>{collection.title}.</h1>
          <p>{collection.description}</p>
        </div>
        {brand.layout.collection === "editorial" ? (
          <div className="catalog-collection-image">
            <Image
              src={collection.image.src}
              alt={collection.image.alt}
              fill
              sizes="(max-width: 640px) 90vw, 30vw"
              priority
            />
          </div>
        ) : (
          <span className="catalog-heading__aside">
            Considered. Collected. Worn.
          </span>
        )}
      </div>
      <CatalogBrowser
        products={products}
        collections={collections}
        brand={brand}
        currentCollection={slug}
      />
    </div>
  );
}
