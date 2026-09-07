import { createHash } from "node:crypto";
import type { Brand, Product, ProductVariant } from "@/types";
import { getVariantPrice } from "./pricing";
import { isVariantPurchasable } from "./variants";
import { getSiteOrigin } from "./site";

export function escapeXml(value: string) {
  return Array.from(value)
    .filter((char) => {
      const code = char.codePointAt(0)!;
      return (
        code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 0xd7ff) ||
        (code >= 0xe000 && code <= 0xfffd) ||
        code >= 0x10000
      );
    })
    .join("")
    .replace(
      /[<>&"']/g,
      (char) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[char]!,
    );
}

const tag = (name: string, value: string | number | undefined) =>
  value === undefined
    ? ""
    : `<g:${name}>${escapeXml(String(value))}</g:${name}>`;
const stableId = (...parts: string[]) =>
  createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 40);
const money = (amount: number, currency: string) =>
  `${(amount / 100).toFixed(2)} ${currency}`;
const textField = (name: string, value: string, source?: string) =>
  source === "trained_algorithmic_media"
    ? `<g:structured_${name}>${tag("digital_source_type", source)}${tag("content", value)}</g:structured_${name}>`
    : tag(name, value);

export function productVariantUrl(
  origin: string,
  product: Product,
  variant: ProductVariant,
) {
  const url = new URL(`/product/${encodeURIComponent(product.slug)}`, origin);
  url.searchParams.set("variant", variant.id);
  return url.href;
}

export function buildMerchantFeed({
  brand,
  products,
  origin,
  preview = false,
}: {
  brand: Brand;
  products: Product[];
  origin: string;
  preview?: boolean;
}) {
  origin = getSiteOrigin(origin);
  const ids = new Set<string>();
  const items: string[] = [];
  for (const product of products) {
    if (
      product.businessId !== brand.businessId ||
      product.inventoryStatus !== "in-stock" ||
      (!preview && !product.merchant?.enabled)
    )
      continue;
    for (const variant of product.variants) {
      if (
        variant.businessId !== brand.businessId ||
        variant.productId !== product.id
      )
        continue;
      const id = stableId(brand.businessId, product.id, variant.id);
      if (ids.has(id))
        throw new Error(`Duplicate Merchant variant: ${variant.id}`);
      ids.add(id);
      const price = getVariantPrice(product, variant);
      if (!Number.isSafeInteger(price) || price <= 0)
        throw new Error(`Invalid Merchant price: ${variant.id}`);
      const mainImage = variant.image ?? product.images[0];
      if (!mainImage) throw new Error(`Missing Merchant image: ${variant.id}`);
      const imageUrl = new URL(mainImage.src, origin);
      if (!/^https?:$/.test(imageUrl.protocol))
        throw new Error(`Invalid Merchant image: ${variant.id}`);
      const option = (name: RegExp) =>
        Object.entries(variant.selectedOptions).find(([key]) =>
          name.test(key),
        )?.[1];
      const data = product.merchant;
      const identifiers = variant.merchant;
      if (
        identifiers?.identifierExists === false &&
        (identifiers.gtin || identifiers.mpn)
      )
        throw new Error(`Conflicting Merchant identifiers: ${variant.id}`);
      const sale =
        product.compareAtPrice !== undefined && product.compareAtPrice > price;
      items.push(
        `<item>${[
          tag("id", id),
          textField(
            "title",
            `${product.name} - ${Object.values(variant.selectedOptions).join(" / ")}`.slice(
              0,
              150,
            ),
            data?.titleSource,
          ),
          textField(
            "description",
            product.description.slice(0, 5000),
            data?.descriptionSource,
          ),
          tag("link", productVariantUrl(origin, product, variant)),
          tag("image_link", imageUrl.href),
          tag(
            "availability",
            isVariantPurchasable(product, variant)
              ? "in_stock"
              : "out_of_stock",
          ),
          tag(
            "price",
            money(sale ? product.compareAtPrice! : price, product.currency),
          ),
          sale ? tag("sale_price", money(price, product.currency)) : "",
          tag("condition", data?.condition ?? "new"),
          tag("brand", data?.brand ?? brand.name),
          tag("gtin", identifiers?.gtin),
          tag("mpn", identifiers?.mpn),
          identifiers?.identifierExists !== undefined
            ? tag(
                "identifier_exists",
                identifiers.identifierExists ? "yes" : "no",
              )
            : "",
          tag("multipack", identifiers?.multipack),
          tag("google_product_category", data?.googleProductCategory),
          tag("product_type", data?.productType),
          tag("item_group_id", stableId(brand.businessId, product.id)),
          tag("item_group_title", product.name),
          tag("color", option(/^colou?r$/i)),
          tag("size", option(/^size$/i)),
          tag("material", option(/^material$/i) ?? data?.material),
          tag("pattern", option(/^pattern$/i)),
          tag("age_group", data?.ageGroup),
          tag("gender", data?.gender),
          option(/^size$/i) ? tag("size_system", data?.sizeSystem) : "",
          ...Object.entries(variant.selectedOptions).map(
            ([name, value]) =>
              `<g:variant_option>${tag("name", name)}${tag("value", value)}</g:variant_option>`,
          ),
          preview
            ? tag("excluded_destination", "Shopping_ads") +
              tag("excluded_destination", "Free_listings")
            : "",
        ].join("\n")}</item>`,
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>\n<title>${escapeXml(brand.name)} products${preview ? " — PREVIEW ONLY" : ""}</title>\n<link>${escapeXml(origin)}</link>\n<description>${preview ? "Demo preview. Replace sample data before publication." : "Current product catalogue"}</description>\n${items.join("\n")}\n</channel></rss>`;
}
