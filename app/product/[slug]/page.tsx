import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getBrandConfig, getProductBySlug, getProducts } from "@/lib/catalog";
import { ProductDetail } from "@/components/commerce/ProductDetail";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { RecentlyViewed } from "@/components/commerce/RecentlyViewed";
import { getSiteOrigin } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}
export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `${getSiteOrigin()}/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images
        .slice(0, 1)
        .map((image) => ({ url: image.src, alt: image.alt })),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const [product, brand, products] = await Promise.all([
    getProductBySlug(slug),
    getBrandConfig(),
    getProducts(),
  ]);
  if (!product) notFound();
  const { variant: variantId } = await searchParams;
  const selectedVariant =
    typeof variantId === "string"
      ? product.variants.find((variant) => variant.id === variantId)
      : undefined;
  if (variantId !== undefined && !selectedVariant) notFound();
  const related = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(
          b.collectionIds.some((id) => product.collectionIds.includes(id)),
        ) -
        Number(
          a.collectionIds.some((id) => product.collectionIds.includes(id)),
        ),
    )
    .slice(0, 4);
  return (
    <div className="product-page">
      <ProductDetail
        key={`${product.id}:${selectedVariant?.id ?? "default"}`}
        product={product}
        brand={brand}
        initialVariantId={selectedVariant?.id}
      />
      <section className="product-related">
        <div className="product-related__heading">
          <div>
            <p className="eyebrow">In good company</p>
            <h2>Complete your everyday.</h2>
          </div>
          <Link className="commerce-text-link" href="/shop">
            Explore all <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid
          products={related}
          variant={brand.layout.productCard}
          gridVariant={brand.layout.productGrid}
          locale={brand.locale}
        />
      </section>
      <RecentlyViewed
        currentProductId={product.id}
        products={products}
        brand={brand}
      />
    </div>
  );
}
