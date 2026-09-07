import assert from "node:assert/strict";
import test from "node:test";
import { brandConfig } from "../data/brand";
import { products } from "../data/products";
import { buildMerchantFeed, escapeXml } from "../lib/merchant-feed";
import { getSiteOrigin } from "../lib/site";
import { GET } from "../app/feeds/google.xml/route";

const origin = "https://shop.example";
const makeFeed = (items = products, preview = true) =>
  buildMerchantFeed({ brand: brandConfig, products: items, origin, preview });
const itemFor = (xml: string, variant: string) =>
  xml
    .split("<item>")
    .find((item) => item.includes(`variant=${variant}</g:link>`))!;

test("Merchant preview exports real combinations, stable IDs and matching stock", () => {
  const xml = makeFeed();
  const count = products
    .filter((product) => product.inventoryStatus === "in-stock")
    .reduce((sum, product) => sum + product.variants.length, 0);
  assert.equal((xml.match(/<item>/g) ?? []).length, count);
  const ids = [...xml.matchAll(/<g:id>(.*?)<\/g:id>/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(ids).size, count);
  assert.ok(ids.every((id) => id.length <= 50));
  const medium = itemFor(xml, "box-tee-black-m");
  assert.match(medium, /<g:availability>in_stock/);
  assert.match(medium, /<g:price>34.00 GBP/);
  assert.match(itemFor(xml, "box-tee-black-l"), /<g:availability>out_of_stock/);
  assert.match(itemFor(xml, "box-tee-white-m"), /images\/tee-white.jpg/);
  assert.doesNotMatch(xml, /transit-jacket|fine-merino-knit/);
  assert.match(xml, /<g:excluded_destination>Free_listings/);
  const changed = structuredClone(products);
  changed[0].name = "A renamed tee";
  assert.equal(
    itemFor(makeFeed(changed), "box-tee-black-m").match(
      /<g:id>(.*?)<\/g:id>/,
    )?.[1],
    medium.match(/<g:id>(.*?)<\/g:id>/)?.[1],
  );
});

test("Merchant live export is opt-in and tenant-scoped with authentic optional identifiers", () => {
  assert.doesNotMatch(makeFeed(products, false), /<item>/);
  const product = structuredClone(products[0]);
  product.merchant = {
    enabled: true,
    titleSource: "default",
    descriptionSource: "default",
  };
  product.variants[0].merchant = { mpn: "ACTUAL-MANUFACTURER-REFERENCE" };
  const otherTenant = { ...product, businessId: "other-business" };
  const xml = makeFeed([product, otherTenant], false);
  assert.equal((xml.match(/<item>/g) ?? []).length, product.variants.length);
  assert.match(xml, /<g:mpn>ACTUAL-MANUFACTURER-REFERENCE/);
  assert.doesNotMatch(
    xml,
    /excluded_destination|<g:gtin>|<g:identifier_exists>|structured_title/,
  );
  const badVariant = structuredClone(product);
  badVariant.variants[0].businessId = "other-business";
  assert.equal(
    (makeFeed([badVariant], false).match(/<item>/g) ?? []).length,
    product.variants.length - 1,
  );
  product.variants[0].merchant.identifierExists = false;
  assert.throws(() => makeFeed([product]), /Conflicting Merchant identifiers/);
});

test("Merchant prices include discounts and pack overrides, with generic variant attributes", () => {
  const xml = makeFeed();
  const saleProduct = products.find((product) => product.id === "crewneck")!;
  const sale = itemFor(xml, saleProduct.variants[0].id);
  assert.match(sale, /<g:price>80.00 GBP/);
  assert.match(sale, /<g:sale_price>68.00 GBP/);
  const pair = itemFor(xml, "canvas-tote-chalk-pair");
  assert.match(pair, /<g:price>42.00 GBP/);
  assert.match(pair, /<g:multipack>2/);
  assert.match(pair, /<g:name>Pack size<\/g:name><g:value>Pair/);
  assert.match(xml, /<g:name>Length<\/g:name>/);
  assert.match(xml, /<g:structured_title>/);
  assert.match(xml, /<g:structured_description>/);
});

test("XML escaping, invalid values and unsafe origins are handled", () => {
  assert.equal(
    escapeXml('<a & "b">\u0000\ud800'),
    "&lt;a &amp; &quot;b&quot;&gt;",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://user:pass@shop.example",
    "https://shop.example/path",
    "https://shop.example?evil=yes",
  ]) {
    assert.throws(() => getSiteOrigin(url));
  }
  const product = structuredClone(products[0]);
  product.description = 'Cotton & linen <soft> "everyday"';
  assert.match(
    makeFeed([product]),
    /Cotton &amp; linen &lt;soft&gt; &quot;everyday&quot;/,
  );
  product.variants[0].price = -1;
  assert.throws(() => makeFeed([product]), /Invalid Merchant price/);
});

test("HTTP feed keeps preview separate from publication and ignores the request host", async () => {
  const saved = {
    merchant: process.env.GOOGLE_MERCHANT_ENABLED,
    indexing: process.env.SITE_INDEXING_ENABLED,
    origin: process.env.NEXT_PUBLIC_SITE_URL,
  };
  try {
    process.env.GOOGLE_MERCHANT_ENABLED = "false";
    process.env.SITE_INDEXING_ENABLED = "false";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    assert.equal(
      (await GET(new Request("https://untrusted.example/feeds/google.xml")))
        .status,
      503,
    );
    const response = await GET(
      new Request("https://untrusted.example/feeds/google.xml?preview=1"),
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type")!, /application\/xml/);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const xml = await response.text();
    assert.match(xml, /http:\/\/localhost:3000\/product\//);
    assert.doesNotMatch(xml, /untrusted.example/);
    process.env.GOOGLE_MERCHANT_ENABLED = "true";
    process.env.SITE_INDEXING_ENABLED = "true";
    assert.equal(
      (await GET(new Request("https://untrusted.example/feeds/google.xml")))
        .status,
      503,
    );
    process.env.NEXT_PUBLIC_SITE_URL = "https://northform.store";
    const live = await GET(
      new Request("https://untrusted.example/feeds/google.xml"),
    );
    assert.equal(live.status, 200);
    assert.doesNotMatch(await live.text(), /<item>/);
  } finally {
    for (const [name, value] of Object.entries({
      GOOGLE_MERCHANT_ENABLED: saved.merchant,
      SITE_INDEXING_ENABLED: saved.indexing,
      NEXT_PUBLIC_SITE_URL: saved.origin,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
