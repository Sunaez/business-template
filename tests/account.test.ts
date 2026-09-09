import assert from "node:assert/strict";
import test from "node:test";
import { products } from "@/data/products";
import { demoAddresses } from "@/data/accounts";
import {
  createCsv,
  isOrderStatus,
  normalizeAddresses,
  validateAddress,
  validateStock,
} from "@/lib/account";

test("stock changes reject missing, foreign and invalid variant quantities without modifying the catalogue", () => {
  const product = structuredClone(products[0]);
  const original = structuredClone(product);
  const values = Object.fromEntries(
    product.variants.map((variant) => [variant.id, String(variant.stock)]),
  );
  const id = product.variants[0].id;
  for (const invalid of [
    "",
    " ",
    -1,
    1.5,
    Infinity,
    NaN,
    10000,
    null,
    true,
    {},
  ])
    assert.equal(
      validateStock(product, { ...values, [id]: invalid }).ok,
      false,
      String(invalid),
    );
  const missing = { ...values };
  delete missing[id];
  assert.equal(validateStock(product, missing).ok, false);
  assert.equal(
    validateStock(product, { ...values, "foreign-variant": 10 }).ok,
    false,
  );
  const result = validateStock(product, { ...values, [id]: "12" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value[id], 12);
  assert.deepEqual(product, original);
});

test("address changes preserve one default and reject whitespace-only required details", () => {
  assert.equal(
    validateAddress({ ...demoAddresses[0], line1: "   " }).ok,
    false,
  );
  assert.equal(
    validateAddress({ ...demoAddresses[0], postcode: "A".repeat(121) }).ok,
    false,
  );
  const withTwoDefaults = demoAddresses.map((address) => ({
    ...address,
    isDefault: true,
  }));
  assert.equal(
    normalizeAddresses(withTwoDefaults).filter((address) => address.isDefault)
      .length,
    1,
  );
  assert.equal(normalizeAddresses([demoAddresses[1]])[0].isDefault, true);
  assert.deepEqual(normalizeAddresses([]), []);
  assert.equal(demoAddresses[1].isDefault, false);
});

test("order updates accept only supported statuses and CSV exports neutralise formula cells", () => {
  assert.equal(isOrderStatus("Delivered"), true);
  for (const value of [null, "Refunded", "delivered", {}, 0])
    assert.equal(isOrderStatus(value), false);
  const csv = createCsv([
    ["Alex, Example", 'A "quote"', "\t =1+1", "+SUM(1,2)", "ordinary"],
  ]);
  assert.equal(
    csv,
    '"Alex, Example","A ""quote""","\'\t =1+1","\'+SUM(1,2)","ordinary"',
  );
});
