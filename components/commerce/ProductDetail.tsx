"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  Ruler,
  Truck,
  RotateCcw,
} from "lucide-react";
import type { Brand, Product } from "@/types";
import { formatPrice, getVariantPrice } from "@/lib/pricing";
import { isVariantPurchasable } from "@/lib/variants";
import { ProductGallery } from "./ProductGallery";
import { QuantitySelector } from "./QuantitySelector";
import { useCart } from "./CartProvider";
import { Drawer } from "@/components/ui/Drawer";

export function ProductDetail({
  product,
  brand,
  initialVariantId,
}: {
  product: Product;
  brand: Brand;
  initialVariantId?: string;
}) {
  const galleryImages = useMemo(() => {
    const image = product.variants.find(
      (variant) => variant.id === initialVariantId,
    )?.image;
    return image
      ? [image, ...product.images.filter((entry) => entry.src !== image.src)]
      : product.images;
  }, [product, initialVariantId]);
  const first =
    product.variants.find((variant) => variant.id === initialVariantId) ??
    product.variants.find(
      (variant) => variant.available && variant.stock > 0,
    ) ??
    product.variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(first?.selectedOptions ?? {}).filter(
        ([name]) => Boolean(initialVariantId) || !/^size$/i.test(name),
      ),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addItem, openCart, items, hydrated } = useCart();
  const router = useRouter();
  const variant = product.variants.find((entry) =>
    product.options.every(
      (option) => entry.selectedOptions[option.name] === selection[option.name],
    ),
  );
  const unitPrice = getVariantPrice(product, variant);
  const inBag =
    items.find(
      (item) => item.productId === product.id && item.variantId === variant?.id,
    )?.quantity ?? 0;
  const remaining = Math.max((variant?.stock ?? 0) - inBag, 0);
  const available = isVariantPurchasable(product, variant) && remaining > 0;
  const missingOption = product.options.find(
    (option) => !selection[option.name],
  );
  const sizeGuide = brand.sizeGuides.find(
    (guide) => guide.id === product.sizeGuideId,
  );
  const money = (price: number) =>
    formatPrice(price, product.currency, brand.locale);
  const actionLabel =
    product.inventoryStatus === "coming-soon"
      ? "Coming soon"
      : product.inventoryStatus === "pre-order"
        ? "Pre-order · coming soon"
        : missingOption
          ? `Select ${missingOption.name.toLowerCase()}`
          : !available
            ? inBag > 0 && remaining === 0
              ? "All available stock in your bag"
              : "Out of stock"
            : "Add to bag";

  function chooseOption(name: string, value: string) {
    const next = { ...selection, [name]: value };
    if (product.options.some((option) => !next[option.name])) {
      setSelection(next);
      setQuantity(1);
      setMessage("");
      return;
    }
    const exact = product.variants.find(
      (entry) =>
        product.options.every(
          (option) => entry.selectedOptions[option.name] === next[option.name],
        ) &&
        entry.available &&
        entry.stock > 0,
    );
    const fallback = product.variants.find(
      (entry) =>
        entry.selectedOptions[name] === value &&
        entry.available &&
        entry.stock > 0,
    );
    setSelection(exact?.selectedOptions ?? fallback?.selectedOptions ?? next);
    setQuantity(1);
    setMessage("");
  }

  function add(buyNow = false) {
    if (!variant || !available) return;
    const result = addItem(
      product.id,
      variant.id,
      Math.min(quantity, remaining),
    );
    if (!result.success) {
      setMessage(result.message ?? "This item could not be added.");
      return;
    }
    setMessage("Added to your bag.");
    if (buyNow) router.push("/checkout");
    else openCart();
  }

  return (
    <>
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="product-detail">
        <ProductGallery
          images={galleryImages}
          selectedImage={variant?.image}
          productName={product.name}
        />
        <div className="product-detail__information">
          <div className="product-detail__heading">
            <p className="eyebrow">
              {product.newArrival
                ? "The latest addition"
                : product.bestSeller
                  ? "An everyday favourite"
                  : "Considered essentials"}
            </p>
            <h1>{product.name}</h1>
            <div className="product-detail__price">
              <span>{money(unitPrice)}</span>
              {product.compareAtPrice && product.compareAtPrice > unitPrice && (
                <>
                  <del>{money(product.compareAtPrice)}</del>
                  <span className="product-sale-label">
                    Save{" "}
                    {Math.round((1 - unitPrice / product.compareAtPrice) * 100)}
                    %
                  </span>
                </>
              )}
            </div>
            <p className="product-detail__intro">{product.shortDescription}</p>
          </div>
          <div id="product-options" className="product-options">
            {product.options.map((option) => (
              <fieldset key={option.name} className="product-option">
                <legend>
                  {option.name}{" "}
                  <span>— {selection[option.name] ?? "Select"}</span>
                </legend>
                {sizeGuide && option.name.toLowerCase() === "size" && (
                  <button
                    type="button"
                    className="product-size-guide"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    <Ruler size={13} /> Size guide
                  </button>
                )}
                <div
                  className={`product-option__values${option.swatches ? " product-option__values--swatches" : ""}`}
                >
                  {option.values.map((value) => {
                    const optionAvailable =
                      product.available &&
                      product.inventoryStatus === "in-stock" &&
                      product.variants.some(
                        (entry) =>
                          entry.selectedOptions[option.name] === value &&
                          entry.available &&
                          entry.stock > 0 &&
                          (option.swatches ||
                            product.options.every(
                              (other) =>
                                other.name === option.name ||
                                !selection[other.name] ||
                                entry.selectedOptions[other.name] ===
                                  selection[other.name],
                            )),
                      );
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`product-option__value${selection[option.name] === value ? " is-selected" : ""}${option.swatches ? " product-option__swatch" : ""}`}
                        style={
                          option.swatches
                            ? ({
                                "--swatch": option.swatches[value],
                              } as React.CSSProperties)
                            : undefined
                        }
                        aria-pressed={selection[option.name] === value}
                        aria-label={`${option.name}: ${value}${!optionAvailable ? " — unavailable" : ""}`}
                        title={value}
                        disabled={!optionAvailable}
                        onClick={() => chooseOption(option.name, value)}
                      >
                        {option.swatches ? (
                          <span className="sr-only">{value}</span>
                        ) : (
                          value
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <p
            className={`product-stock${!available ? " product-stock--unavailable" : ""}`}
          >
            <span />
            {product.inventoryStatus === "coming-soon"
              ? "Coming soon. A new essential is on its way."
              : product.inventoryStatus === "pre-order"
                ? "Pre-orders will open soon."
                : missingOption
                  ? `Choose your ${missingOption.name.toLowerCase()} to check availability`
                  : available
                    ? variant!.stock <= 4
                      ? `Only ${variant!.stock} left in this combination`
                      : "In stock — ready for your everyday"
                    : remaining === 0 && inBag > 0
                      ? "You've added all available stock."
                      : "This combination is currently unavailable"}
          </p>
          <div className="product-purchase">
            <QuantitySelector
              quantity={Math.min(quantity, remaining || 1)}
              onChange={setQuantity}
              max={remaining}
            />
            <button
              type="button"
              className="button product-add-button"
              onClick={() => add()}
              disabled={!available || !hydrated}
            >
              {actionLabel}
              <Plus size={17} strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            className="button button-outline product-buy-button"
            disabled={!available || !hydrated}
            onClick={() => add(true)}
          >
            Buy now <ArrowRight size={16} />
          </button>
          <p role="status" className="product-message">
            {message}
          </p>
          <div className="product-promises">
            <p>
              <Truck size={17} strokeWidth={1.5} />
              <span>
                Free standard delivery over {money(brand.freeShippingThreshold)}
              </span>
            </p>
            <p>
              <RotateCcw size={16} strokeWidth={1.5} />
              <span>
                {brand.returns.windowDays}-day returns. Find your right fit.
              </span>
            </p>
          </div>
          <div className="product-accordions">
            {[
              {
                title: "The details",
                content: `${product.description} ${product.material}`,
              },
              {
                title: "Fit & sizing",
                content: `${product.fitDescription} ${product.modelInformation}`,
              },
              {
                title: "Materials & care",
                content: `${product.material} ${product.careInstructions}`,
              },
              {
                title: "Delivery & returns",
                content: `${product.shippingInformation} ${brand.returns.summary}`,
                link: true,
              },
            ].map((section, index) => (
              <details key={section.title} open={index === 0}>
                <summary>
                  {section.title}
                  <Plus className="accordion-plus" size={15} />
                  <Minus className="accordion-minus" size={15} />
                </summary>
                <div>
                  <p>{section.content}</p>
                  {section.link && (
                    <Link
                      className="commerce-text-link"
                      href="/shipping-returns"
                    >
                      Delivery & returns policy <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
          <p className="product-sku">
            Style reference: {variant?.sku ?? product.id}
          </p>
        </div>
      </div>
      <div className="product-mobile-purchase">
        <div>
          <span>{product.name}</span>
          <strong>{money(unitPrice)}</strong>
        </div>
        <button
          type="button"
          className="button"
          disabled={
            (!available && !missingOption) ||
            !hydrated ||
            product.inventoryStatus !== "in-stock"
          }
          onClick={() => {
            if (missingOption) {
              document.getElementById("product-options")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
                block: "center",
              });
            } else add();
          }}
        >
          {missingOption && product.inventoryStatus === "in-stock"
            ? `Select ${missingOption.name.toLowerCase()}`
            : available
              ? "Add to bag"
              : "Unavailable"}
          <Plus size={16} />
        </button>
      </div>
      {sizeGuide && (
        <Drawer
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          title={sizeGuide.title}
        >
          <div className="commerce-drawer-content">
            <p>{sizeGuide.description}</p>
            <p className="eyebrow">Measurements in {sizeGuide.unit}</p>
            <div className="size-guide-scroll">
              <table className="commerce-size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    {sizeGuide.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.rows.map((row) => (
                    <tr key={row.size}>
                      <th>{row.size}</th>
                      {row.measurements.map((value, index) => (
                        <td key={index}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>{sizeGuide.notes}</p>
            <Link
              href="/size-guide"
              className="commerce-text-link"
              onClick={() => setSizeGuideOpen(false)}
            >
              View all size guides <ArrowRight size={14} />
            </Link>
            <p className="commerce-size-note">
              <Check size={14} /> All measurements are supplied by {brand.name}.
            </p>
          </div>
        </Drawer>
      )}
    </>
  );
}
