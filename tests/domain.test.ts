import assert from "node:assert/strict";
import test from "node:test";
import {
  getBrandConfig,
  getCollectionBySlug,
  getCollections,
  getProductBySlug,
  getProducts,
} from "../lib/catalog";
import { filterProducts } from "../lib/catalog-filter";
import {
  calculateCartTotals,
  formatPrice,
  getDiscountPercentage,
  getVariantPrice,
} from "../lib/pricing";
import {
  findVariant,
  getOptionAvailability,
  isVariantPurchasable,
} from "../lib/variants";
import { getAvailableQuantity, getStockStatus } from "../lib/inventory";
import { products } from "../data/products";

const tee = products.find((product) => product.id === "box-tee")!;
const tote = products.find((product) => product.id === "canvas-tote")!;
const blackMedium = findVariant(tee, { Colour: "Black", Size: "M" })!;
const blackLarge = findVariant(tee, { Colour: "Black", Size: "L" })!;
const whiteMedium = findVariant(tee, { Colour: "White", Size: "M" })!;

test("tenant-scoped reads never expose a different business", async () => {
  assert.equal((await getProducts()).length, 12);
  assert.deepEqual(await getProducts({ businessId: "another-brand" }), []);
  assert.deepEqual(await getCollections("another-brand"), []);
  assert.equal(await getProductBySlug(tee.slug, "another-brand"), undefined);
  assert.equal(
    await getCollectionBySlug("new-arrivals", "another-brand"),
    undefined,
  );
  await assert.rejects(getBrandConfig("another-brand"), /Storefront not found/);
});

test("local reads return isolated snapshots instead of shared mutable catalog records", async () => {
  const first = await getProductBySlug(tee.slug);
  first!.variants[0].stock = 900;
  first!.name = "Changed elsewhere";
  const second = await getProductBySlug(tee.slug);
  assert.equal(second!.name, "Heavyweight Box Tee");
  assert.notEqual(second!.variants[0].stock, 900);
});

test("generic options require a complete, valid combination", () => {
  assert.equal(findVariant(tee, { Colour: "Black" }), undefined);
  assert.equal(findVariant(tee, { Colour: "Black", Size: "XXL" }), undefined);
  assert.equal(
    findVariant(tee, { Colour: "Black", Size: "M", Length: "Long" }),
    undefined,
  );
  assert.equal(blackMedium.stock, 4);
  assert.equal(blackLarge.stock, 0);
  assert.equal(whiteMedium.stock, 12);
  const cargo = products.find((product) => product.id === "cargo-pant")!;
  assert.equal(findVariant(cargo, { Colour: "Olive", Size: "S" }), undefined);
  assert.ok(findVariant(cargo, { Colour: "Olive", Size: "S", Length: "Long" }));
});

test("stock, tenant ownership, and positive integer quantities are enforced", () => {
  assert.equal(isVariantPurchasable(tee, blackMedium, 4), true);
  assert.equal(isVariantPurchasable(tee, blackMedium, 5), false);
  assert.equal(isVariantPurchasable(tee, blackLarge), false);
  for (const invalid of [0, -1, 0.5, NaN, Infinity]) {
    assert.equal(isVariantPurchasable(tee, blackMedium, invalid), false);
  }
  assert.equal(
    isVariantPurchasable(tee, { ...blackMedium, stock: 999 }, 5),
    false,
  );
  assert.equal(
    isVariantPurchasable(tee, { ...blackMedium, businessId: "another-brand" }),
    false,
  );
  assert.equal(isVariantPurchasable(tee, tote.variants[0]), false);
  assert.equal(getAvailableQuantity(tee, blackMedium.id), 4);
  assert.equal(getStockStatus(tee, blackMedium), "low-stock");
  assert.equal(getStockStatus(tee, blackLarge), "out-of-stock");
});

test("unavailable combinations and future products cannot be selected for purchase", () => {
  assert.equal(
    getOptionAvailability(tee, "Size", "L", { Colour: "Black" }),
    false,
  );
  assert.equal(
    getOptionAvailability(tee, "Size", "M", { Colour: "Black" }),
    true,
  );
  assert.equal(
    getOptionAvailability(tee, "Size", "XXL", { Colour: "Black" }),
    false,
  );
  for (const product of products.filter(
    (item) => item.inventoryStatus !== "in-stock",
  )) {
    assert.equal(isVariantPurchasable(product, product.variants[0]), false);
    assert.equal(getAvailableQuantity(product, product.variants[0].id), 0);
    assert.equal(getStockStatus(product), product.inventoryStatus);
  }
});

test("variant price overrides are authoritative and totals use integer pence", () => {
  const pair = findVariant(tote, { Colour: "Chalk", "Pack size": "Pair" })!;
  assert.equal(tote.price, 2400);
  assert.equal(getVariantPrice(tote, pair), 4200);
  assert.equal(getVariantPrice(tote, { ...pair, price: 1 }), 4200);
  const totals = calculateCartTotals(
    [{ product: tote, variant: pair, quantity: 2 }],
    { freeShippingThreshold: 10000, shippingPrice: 495 },
  );
  assert.deepEqual(totals, {
    subtotal: 8400,
    discount: 0,
    shipping: 495,
    total: 8895,
    freeShippingRemaining: 1600,
    qualifiesForFreeShipping: false,
  });
  assert.equal(formatPrice(3400), "£34");
  assert.equal(formatPrice(495), "£4.95");
  assert.equal(getDiscountPercentage(6800, 8000), 15);
});

test("shipping threshold, express delivery, discounts, and empty baskets are coherent", () => {
  const lines = [{ product: tee, variant: blackMedium, quantity: 3 }];
  assert.equal(
    calculateCartTotals(lines, {
      freeShippingThreshold: 10000,
      shippingPrice: 495,
    }).shipping,
    0,
  );
  assert.equal(
    calculateCartTotals(lines, {
      freeShippingThreshold: 10000,
      shippingPrice: 795,
      allowFreeShipping: false,
    }).shipping,
    795,
  );
  const discounted = calculateCartTotals(lines, {
    freeShippingThreshold: 10000,
    shippingPrice: 495,
    discount: 1000,
  });
  assert.equal(discounted.total, 9695);
  assert.equal(discounted.freeShippingRemaining, 800);
  assert.equal(
    calculateCartTotals([], {
      freeShippingThreshold: 10000,
      shippingPrice: 495,
    }).total,
    0,
  );
  assert.equal(
    calculateCartTotals(lines, {
      freeShippingThreshold: 10000,
      shippingPrice: 0,
      discount: 99999,
    }).total,
    0,
  );
  assert.throws(
    () =>
      calculateCartTotals([{ ...lines[0], quantity: -1 }], {
        freeShippingThreshold: 10000,
        shippingPrice: 495,
      }),
    RangeError,
  );
  assert.throws(
    () =>
      calculateCartTotals(lines, {
        freeShippingThreshold: 10000,
        shippingPrice: 4.95,
      }),
    RangeError,
  );
});

test("filters match actual available combinations and variant-specific prices", () => {
  assert.equal(
    filterProducts([tee], { options: { Colour: ["Black"], Size: ["L"] } })
      .length,
    0,
  );
  assert.equal(
    filterProducts([tee], { options: { Colour: ["Black"], Size: ["M"] } })
      .length,
    1,
  );
  assert.equal(filterProducts([tee], { query: "HEAVYWEIGHT" }).length, 1);
  assert.equal(filterProducts([tee], { query: "olive" }).length, 1);
  assert.equal(filterProducts([tee], { query: "280 gsm" }).length, 1);
  assert.equal(
    filterProducts([tee], { collectionId: "accessories" }).length,
    0,
  );
  assert.equal(
    filterProducts([tote], {
      minPrice: 4000,
      maxPrice: 4500,
      options: { "Pack size": ["Pair"] },
    }).length,
    1,
  );
  assert.equal(
    filterProducts([tote], {
      minPrice: 4000,
      options: { "Pack size": ["Single"] },
    }).length,
    0,
  );
  assert.equal(filterProducts(products, { available: false }).length, 2);
  assert.equal(filterProducts(products, { tags: ["sale"] }).length, 2);
});

test("sorts and collection metadata agree with the scoped catalog", async () => {
  const sorted = await getProducts({ sort: "price-asc" });
  assert.equal(sorted[0].id, "canvas-tote");
  assert.equal(sorted.at(-1)!.id, "transit-jacket");
  const arrivals = await getProducts({ newArrival: true, limit: 4 });
  assert.deepEqual(
    arrivals.map((product) => product.id),
    ["box-tee", "zip-hoodie", "overshirt", "sweatpant"],
  );
  for (const collection of await getCollections()) {
    const matches = await getProducts({ collection: collection.slug });
    assert.deepEqual(
      new Set(matches.map((product) => product.id)),
      new Set(collection.productIds),
    );
  }
});
