# Managed store service

`/for-business` presents a personal service from one independent operator: a simple product showcase or a managed online shop. Pricing follows the hero, with shared cost explanations and optional dashboard/viability detail. The process combines onboarding, launch checks and a results review. `/for-business/start` is the dedicated business enquiry route. Shopping support remains at `/contact` and links business visitors to the new form.

## Editing the offer

- `data/business.ts`: service identity, two package models, cost explanations, onboarding/results process, FAQs and pricing. Example prices are **£399 once** for a product showcase, optional showcase care from **£19/month**, and a managed shop from **£99/month with separately quoted setup**. These are editable proposals, not approved commercial terms. Showcase hosting/domain costs and changes are explained separately; it has no checkout or dashboard. No setup amount, VAT treatment, contract duration or response time is assumed.
- Package links carry a validated `plan` query parameter to the enquiry page and preselect the appropriate existing help checkbox. That choice travels in the validated `needs` array and the draft/webhook payload, without another qualification field.
- `components/business/BusinessPrimitives.tsx`: CTA, pricing and reusable case-study components. Add approved real stories to `businessCaseStudies`; an empty array renders nothing. Never insert fictional client outcomes.
- `components/business/BusinessPreviews.tsx`: live catalogue reads and the existing `createDemoOrders` / `getInventorySummary` structures power the previews. These are labelled sample records, not real merchant results.
- `components/business/BusinessChrome.tsx`: route-aware service header/footer. The temporary “Stores, managed.” identity is independent of NORTHFORM. The existing storefront chrome is passed through unchanged on shopping routes. The compact sticky header keeps an enquiry CTA available on phones without a bottom overlay.
- `components/business/business.css`: scoped retail palette, existing Manrope typography, responsive layouts and native accessible controls. No new packages or generated imagery.

## Enquiry delivery

There was no form backend to reuse: the consumer contact form only prepares an email draft to a reserved demo address. The business form has its own validation and server delivery boundary, without introducing a database or email SDK.

By default, the business form prepares a local, editable draft with download/copy actions. It explicitly says **not sent**, never invents an inbox, never stores lead data in localStorage and never claims a received enquiry. Closing or refreshing the page loses unsaved answers.

To enable delivery, configure these **server-only** environment variables:

```text
BUSINESS_ENQUIRY_WEBHOOK_URL=https://your-configured-service.example/enquiries
BUSINESS_ENQUIRY_WEBHOOK_TOKEN=your-optional-secret
```

The URL above is an example, not a working endpoint. Supply your own receiver. Only HTTPS URLs without embedded credentials are accepted. `app/for-business/start/page.tsx` reads configuration per request; do not expose secrets through `NEXT_PUBLIC_` variables.

`POST /api/business-enquiries` validates the same schema as the browser, rejects cross-origin browser submissions and honeypot entries, limits the streamed body to 16 KiB, and forwards only validated fields. It does not fetch submitted website/social URLs. Leads and credentials are not logged. Delivery has a 10-second timeout, blocks redirects, and returns success only on receiver 2xx acceptance. The browser times out at 15 seconds and preserves answers on failure.

The receiver gets:

```json
{
  "type": "business.enquiry",
  "requestId": "a-client-generated-uuid",
  "receivedAt": "ISO-8601 timestamp",
  "enquiry": {
    "businessName": "...",
    "contactName": "...",
    "email": "...",
    "sells": "...",
    "phone": "...",
    "website": "...",
    "social": "...",
    "productCount": "...",
    "channel": "...",
    "needs": ["New online store"],
    "message": "...",
    "intent": "preview"
  }
}
```

Optional fields are empty strings or an empty array. `intent` is `store`, `preview` or `consultation`. No payment or marketing-consent field is collected. A bearer Authorization header is sent when a token is configured. The same `Idempotency-Key` header is reused on retries of an unchanged enquiry.

The receiver must **durably store or enqueue the lead before returning 2xx** and deduplicate by the idempotency key. This app has no durable retry queue or lead database. Configure receiver notifications/routing to the business inbox, delivery monitoring and appropriate perimeter rate limiting before promotion. The honeypot and origin check are basic safeguards, not distributed rate limiting. Do not use the customer-support demo address.

Before collecting real leads, complete the service identity and business privacy information in the enquiry page, including the operator/contact, chosen processor and retention arrangements. The current copy explains preview versus delivery behavior; it is not a completed business privacy policy.

## What the demo actually does

| Area               | Current behavior                                                                       | Production work remaining                                                                 |
| ------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Storefront         | Catalogue, variants, filters, collections, cart, responsive product pages, trust pages | Client content and approved store policies                                                |
| Checkout           | Browser-local demo order; no money moves                                               | Payment provider, verified payment webhooks, persistent orders and inventory reservations |
| Dashboard          | Public sample orders, status edits, CSV exports and sample stock controls              | Authentication, persistent tenant data, live orders and shared stock                      |
| Product editing    | Catalogue search and sample stock edits                                                | Add products, edit prices and upload media                                                |
| Analytics          | Sample order-value summaries                                                           | Real reporting and agreed analytics integration                                           |
| Google Shopping    | Existing XML product-feed preview                                                      | Real product data, domain and Merchant Center configuration, eligibility and approval     |
| Managed operations | Described as a proposed service                                                        | Agreed hosting, backups, support process and maintenance responsibilities                 |
| Enquiries          | Draft preview or validated server webhook adapter                                      | Configure and verify a real lead receiver                                                 |

## Business decisions

Confirm the service name, final package price, setup charges, VAT presentation, product-upload/migration limits, provider fees, commission (if any), contract/cancellation terms, support hours and response expectations, backup scope and restore responsibilities. Define whether recurring catalogue work is included and the scope of the preview offer. All are left as proposal-level decisions rather than false commitments.

## Verification

`npm test` includes input validation, delivery misconfiguration, receiver errors, network failure, payload forwarding and successful acceptance. `tests/business.spec.ts` covers the CTA journey, draft preparation/download/editing, optional fields, keyboard FAQs, axe checks and 320/390/768/1440px layouts. Production receiver/inbox delivery still needs an end-to-end check with your chosen provider.

Next: connect the lead receiver and conversion measurement; finish live commerce/authenticated merchant tools; replace demonstration proof with approved client case studies after pilot launches.
