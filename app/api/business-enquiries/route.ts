import { validateBusinessEnquiry } from "@/lib/business-enquiry";
import {
  deliverBusinessEnquiry,
  getEnquiryDeliveryUrl,
} from "@/lib/business-delivery";

const headers = { "Cache-Control": "no-store" };
const reply = (body: object, status: number) =>
  Response.json(body, { status, headers });
const maxBytes = 16_384;

export async function POST(request: Request) {
  // This is a public lead form. Reject cross-origin browser submissions.
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply({ error: "Please send your enquiry from this website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply(
      { error: "Use the business enquiry form to send your details." },
      415,
    );
  if (Number(request.headers.get("content-length")) > maxBytes)
    return reply(
      { error: "Your enquiry is too long. Please shorten it." },
      413,
    );
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader)
      return reply({ error: "Please complete the enquiry form." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return reply(
          { error: "Your enquiry is too long. Please shorten it." },
          413,
        );
      }
      chunks.push(chunk.value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    input = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return reply(
      { error: "We couldn’t read that enquiry. Please try again." },
      400,
    );
  }
  const result = validateBusinessEnquiry(input);
  if (!result.ok)
    return reply(
      { errors: result.errors, error: "Check the highlighted details." },
      400,
    );
  if (result.value.companyFax)
    return reply(
      { error: "We couldn’t accept that enquiry. Please try again." },
      400,
    );
  if (!getEnquiryDeliveryUrl())
    return reply(
      {
        error:
          "Enquiry delivery is not connected yet. Your details have not been sent. You can keep a copy below.",
      },
      503,
    );
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[a-f\d-]{36}$/i.test(key))
    return reply({ error: "Please refresh the form and try again." }, 400);
  try {
    if (await deliverBusinessEnquiry(result.value, key))
      return reply({ ok: true }, 200);
  } catch {
    /* Do not expose receiver configuration or log lead details. */
  }
  return reply(
    {
      error:
        "Delivery could not be confirmed. Your details are still here. Try again, or save a copy below.",
    },
    502,
  );
}
