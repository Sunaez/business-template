import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import type { Product, ProductCardVariant } from "@/types";
import "./catalog.css";

export interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant;
  index?: number;
  locale?: string;
}

export function ProductCard({
  product,
  variant = "minimal",
  index = 0,
  locale,
}: ProductCardProps) {
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const colourOption = product.options.find((option) =>
    /^(colour|color)$/i.test(option.name),
  );
  const onSale =
    !!product.compareAtPrice && product.compareAtPrice > product.price;
  const inStock =
    product.available &&
    product.inventoryStatus === "in-stock" &&
    product.variants.some((item) => item.available && item.stock > 0);
  const badge =
    product.inventoryStatus === "coming-soon"
      ? "Coming soon"
      : product.inventoryStatus === "pre-order"
        ? "Pre-order soon"
        : !inStock
          ? "Sold out"
          : onSale
            ? "Sale"
            : product.newArrival
              ? "New arrival"
              : product.bestSeller
                ? "Best seller"
                : undefined;

  return (
    <article className={`product-card product-card--${variant}`}>
      <Link
        className="product-card__image-link"
        href={`/product/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        {primaryImage && (
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 24vw"
            className="product-card__image product-card__image--primary"
            loading={index < 4 ? "eager" : "lazy"}
          />
        )}
        {secondaryImage && (
          <Image
            src={secondaryImage.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 24vw"
            className="product-card__image product-card__image--secondary"
          />
        )}
        {badge && <span className="product-card__badge">{badge}</span>}
        <span className="product-card__quick-add">
          {inStock ? "Choose options" : "View product"}
          <Plus size={13} strokeWidth={1.5} aria-hidden="true" />
        </span>
      </Link>
      <div className="product-card__info">
        <div className="product-card__heading">
          <h3>
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <span className="product-card__price">
            <span>{formatPrice(product.price, product.currency, locale)}</span>
            {onSale && (
              <del
                aria-label={`Original price ${formatPrice(product.compareAtPrice!, product.currency, locale)}`}
              >
                {formatPrice(product.compareAtPrice!, product.currency, locale)}
              </del>
            )}
          </span>
        </div>
        {variant !== "minimal" && (
          <p className="product-card__description">
            {product.shortDescription}
          </p>
        )}
        {colourOption && (
          <div
            className="product-card__swatches"
            aria-label={`Available colours: ${colourOption.values.join(", ")}`}
          >
            {colourOption.values.slice(0, 5).map((colour) => (
              <span
                key={colour}
                className="product-card__swatch"
                style={{
                  backgroundColor:
                    colourOption.swatches?.[colour] ?? "var(--brand-muted)",
                }}
                title={colour}
              />
            ))}
            <span className="product-card__colours">
              {colourOption.values.length}{" "}
              {colourOption.values.length === 1 ? "colour" : "colours"}
            </span>
          </div>
        )}
        {variant === "detailed" && (
          <div className="product-card__details">
            <span>{inStock ? "In stock" : "Currently unavailable"}</span>
            <span>
              {product.options
                .find((option) => /^size$/i.test(option.name))
                ?.values.join(" · ")}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardMinimal(props: Omit<ProductCardProps, "variant">) {
  return <ProductCard {...props} variant="minimal" />;
}
export function ProductCardEditorial(props: Omit<ProductCardProps, "variant">) {
  return <ProductCard {...props} variant="editorial" />;
}
export function ProductCardDetailed(props: Omit<ProductCardProps, "variant">) {
  return <ProductCard {...props} variant="detailed" />;
}
