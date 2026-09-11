import assert from "node:assert/strict";
import { test } from "node:test";
import { validateBusinessEnquiry, enquiryDraft } from "../lib/business-enquiry";
import { POST } from "../app/api/business-enquiries/route";
import { getEnquiryDeliveryUrl } from "../lib/business-delivery";

const lead = {
  businessName: "  High Street Boutique  ",
  contactName: "Alex",
  email: "alex@example.com",
  sells: "Clothing",
  phone: "",
  website: "myshop.co.uk",
  social: "@myshop",
  productCount: "1–25",
  channel: "Physical shop only",
  needs: ["New online store"],
  message: "",
  intent: "preview",
  companyFax: "",
};
const key = "10000000-0000-4000-8000-000000000001";
function request(body: unknown, extra: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/business-enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      "Idempotency-Key": key,
      ...extra,
    },
    body: JSON.stringify(body),
  });
}

test("business leads trim and normalise input and reject invalid qualifications", () => {
  const valid = validateBusinessEnquiry(lead);
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.value.businessName, "High Street Boutique");
  assert.equal(valid.value.website, "https://myshop.co.uk/");
  assert.match(enquiryDraft(valid.value), /Request: preview/);
  assert.doesNotMatch(enquiryDraft(valid.value), /companyFax/);
  for (const change of [
    { email: "not-email" },
    { businessName: " " },
    { contactName: 15 },
    { website: "javascript:alert(1)" },
    { website: "https://user:password@shop.com" },
    { website: "http://my shop.com" },
    { phone: "12" },
    { intent: "unknown" },
    { needs: ["fabricated option"] },
    { productCount: "999" },
    { message: "a".repeat(1501) },
  ])
    assert.equal(
      validateBusinessEnquiry({ ...lead, ...change }).ok,
      false,
      JSON.stringify(change),
    );
});

test("enquiry endpoint rejects cross-origin, oversized and invalid requests", async () => {
  assert.equal(
    (await POST(request(lead, { Origin: "https://other.example" }))).status,
    403,
  );
  assert.equal(
    (await POST(request(lead, { "Content-Type": "text/plain" }))).status,
    415,
  );
  assert.equal((await POST(request({ ...lead, email: "bad" }))).status, 400);
  assert.equal(
    (await POST(request({ ...lead, companyFax: "spam" }))).status,
    400,
  );
  assert.equal(
    (await POST(request({ message: "a".repeat(17_000) }))).status,
    413,
  );
});

test("delivery fails honestly when unconfigured or rejected; confirms only receiver acceptance", async () => {
  const oldUrl = process.env.BUSINESS_ENQUIRY_WEBHOOK_URL;
  const oldToken = process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN;
  const originalFetch = globalThis.fetch;
  try {
    delete process.env.BUSINESS_ENQUIRY_WEBHOOK_URL;
    assert.equal((await POST(request(lead))).status, 503);
    process.env.BUSINESS_ENQUIRY_WEBHOOK_URL = "http://insecure.example";
    assert.equal(getEnquiryDeliveryUrl(), null);
    process.env.BUSINESS_ENQUIRY_WEBHOOK_URL = "https://leads.example/receive";
    process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN = "test-only-token";
    assert.equal(
      (await POST(request(lead, { "Idempotency-Key": "invalid" }))).status,
      400,
    );
    globalThis.fetch = async () => new Response(null, { status: 500 });
    assert.equal((await POST(request(lead))).status, 502);
    globalThis.fetch = async () => {
      throw new Error("timeout");
    };
    assert.equal((await POST(request(lead))).status, 502);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://leads.example/receive");
      const headers = new Headers(options?.headers);
      assert.equal(headers.get("Idempotency-Key"), key);
      assert.equal(headers.get("Authorization"), "Bearer test-only-token");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.enquiry.businessName, "High Street Boutique");
      assert.equal(body.enquiry.intent, "preview");
      assert.equal(body.enquiry.companyFax, undefined);
      return new Response(null, { status: 202 });
    };
    const accepted = await POST(request(lead));
    assert.equal(accepted.status, 200);
    assert.deepEqual(await accepted.json(), { ok: true });
  } finally {
    globalThis.fetch = originalFetch;
    if (oldUrl === undefined) delete process.env.BUSINESS_ENQUIRY_WEBHOOK_URL;
    else process.env.BUSINESS_ENQUIRY_WEBHOOK_URL = oldUrl;
    if (oldToken === undefined)
      delete process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN;
    else process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN = oldToken;
  }
});
