import test from "node:test";
import assert from "node:assert/strict";
import { getBrandConfig, getProducts } from "../lib/catalog";
import {
  createDemoOrder,
  createLocalCheckoutGateway,
  type CheckoutRequest,
} from "../lib/checkout";

const request: CheckoutRequest = {
  businessId: "demo-brand",
  items: [{ productId: "box-tee", variantId: "box-tee-black-m", quantity: 3 }],
  email: "shopper@example.com",
  shippingAddress: {
    fullName: "Alex Example",
    line1: "42 Demo Street",
    city: "London",
    postcode: "SW1A 1AA",
    country: "GB",
  },
  deliveryMethod: "standard",
};

test("checkout reprices against the catalogue and applies standard or express shipping", async () => {
  const [brand, products] = await Promise.all([
    getBrandConfig(),
    getProducts(),
  ]);
  const order = createDemoOrder(request, brand, products);
  assert.equal(order.total, 10200);
  assert.equal(order.shipping, 0);
  assert.equal(order.status, "demo");
  assert.equal(
    createDemoOrder({ ...request, deliveryMethod: "express" }, brand, products)
      .total,
    10995,
  );
  const pair = createDemoOrder(
    {
      ...request,
      items: [
        {
          productId: "canvas-tote",
          variantId: "canvas-tote-chalk-pair",
          quantity: 1,
        },
      ],
    },
    brand,
    products,
  );
  assert.equal(pair.subtotal, 4200);
});

test("checkout rejects mixed tenants, unavailable variants and duplicated stock overages", async () => {
  const [brand, products] = await Promise.all([
    getBrandConfig(),
    getProducts(),
  ]);
  assert.throws(
    () =>
      createDemoOrder(
        { ...request, businessId: "another-brand" },
        brand,
        products,
      ),
    /different store/,
  );
  assert.throws(
    () =>
      createDemoOrder(
        {
          ...request,
          items: [{ ...request.items[0], variantId: "box-tee-black-l" }],
        },
        brand,
        products,
      ),
    /no longer available/,
  );
  assert.throws(
    () =>
      createDemoOrder(
        { ...request, items: [...request.items, ...request.items] },
        brand,
        products,
      ),
    /no longer available/,
  );
  assert.throws(
    () =>
      createDemoOrder(
        {
          ...request,
          shippingAddress: { ...request.shippingAddress, country: "US" },
        },
        brand,
        products,
      ),
    /country/,
  );
  assert.throws(
    () => createDemoOrder({ ...request, items: [] }, brand, products),
    /Add an item/,
  );
});

test("a storage failure does not return a completed checkout session", async () => {
  const [brand, products] = await Promise.all([
    getBrandConfig(),
    getProducts(),
  ]);
  const gateway = createLocalCheckoutGateway(brand, products, {
    setItem() {
      throw new Error("Storage unavailable");
    },
  });
  await assert.rejects(gateway.createSession(request), /Storage unavailable/);
});
