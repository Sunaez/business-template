import type { BusinessEnquiry } from "./business-enquiry";

/** Server-only delivery boundary. The receiver must durably accept before returning 2xx. */
export function getEnquiryDeliveryUrl() {
  const configured = process.env.BUSINESS_ENQUIRY_WEBHOOK_URL;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.username || url.password || url.hash)
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export async function deliverBusinessEnquiry(
  value: BusinessEnquiry,
  requestId: string,
) {
  const url = getEnquiryDeliveryUrl();
  if (!url) return false;
  const { companyFax: _honeypot, ...enquiry } = value;
  void _honeypot;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": requestId,
      ...(process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN
        ? {
            Authorization: `Bearer ${process.env.BUSINESS_ENQUIRY_WEBHOOK_TOKEN}`,
          }
        : {}),
    },
    body: JSON.stringify({
      type: "business.enquiry",
      requestId,
      receivedAt: new Date().toISOString(),
      enquiry,
    }),
    signal: AbortSignal.timeout(10_000),
    redirect: "error",
    cache: "no-store",
  });
  return response.ok;
}
