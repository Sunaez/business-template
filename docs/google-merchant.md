# Google Merchant Center integration

The storefront exports an RSS 2.0 XML product feed from the same tenant-scoped catalogue as the product pages. No Google API key is needed for a hosted file source. This integration generates the file; it does not create a Merchant Center account or submit products automatically.

## Preview locally

Run `npm run dev` and open [the preview feed](http://localhost:3000/feeds/google.xml?preview=1). Save the XML from your browser if you want to inspect an offline copy.

The preview includes the fictional catalogue and excludes both Shopping ads and free listings. It is for development, not submission. The ordinary `/feeds/google.xml` endpoint returns HTTP 503 until publication is configured. Products have a separate explicit publication flag, so enabling the endpoint alone does not publish the sample products.

## Prepare the business catalogue

Replace the mock data through `lib/catalog.ts` or edit `data/products.ts`. Keep product and variant IDs stable: feed IDs are deterministic, tenant-scoped hashes of those IDs. They do not change when titles, stock or prices change.

Each product supports `merchant` metadata:

```ts
merchant: {
  enabled: true, // Only after reviewing the real product and its variants
  brand: "Your actual brand",
  googleProductCategory: "Apparel & Accessories > Clothing > Shirts & Tops",
  productType: "Clothing > T-shirts",
  condition: "new",
  ageGroup: "adult",
  gender: "unisex",
  sizeSystem: "UK",
  material: "Cotton",
  titleSource: "default",
  descriptionSource: "default",
}
```

Each variant supports `merchant.gtin`, `merchant.mpn`, `merchant.identifierExists`, and `merchant.multipack`. Use actual manufacturer identifiers; the exporter never invents a GTIN or turns a store SKU into an MPN. Set `identifierExists: false` only when the product has no assigned identifiers. For products with identifiers, supply the relevant values. [Google's identifier guidance](https://support.google.com/merchants/answer/160161?hl=en).

Replace demo photographs with accurate images for **every colour and pack configuration**. Set `variant.image` when a variant needs a different main image. The sample generated photographs reuse some colours and do not provide production-ready provenance metadata. AI-generated images must preserve the required IPTC digital-source metadata. For AI-generated product titles or descriptions, set the corresponding source to `trained_algorithmic_media`; the exporter uses Google's structured text attributes. [Image requirements](https://support.google.com/merchants/answer/6324350?hl=en), [AI-generated content requirements](https://support.google.com/merchants/answer/14743464?hl=en-GB).

## Publish and connect

1. Deploy a real store with working payments, order processing, business contact details, delivery and return policies. This template's checkout and account dashboards are local demonstrations; production order management still requires a backend integration.
2. Set `NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com`, `SITE_INDEXING_ENABLED=true` and `GOOGLE_MERCHANT_ENABLED=true` in the deployment environment, then rebuild/redeploy. The URL must be an origin without a path. It controls feed links and metadata; incoming request host headers are not used. Ensure the host/CDN does not block Google from fetching product pages, images or the feed.
3. Mark each reviewed real product `merchant.enabled: true`. Do not simply enable the demo catalogue.
4. In Google Merchant Center, verify/claim the storefront domain and configure the sales country, currency, shipping and returns to match the store. Shipping rules are managed in Merchant Center, including the free-delivery order threshold; they are not guessed per feed item.
5. Add a product source, choose **Add products from a file**, and supply `https://your-actual-domain.com/feeds/google.xml` (without the preview query). Configure scheduled fetching. Google supports fetching a hosted feed on a schedule. [File-source setup](https://support.google.com/merchants/answer/12158380?hl=en), [scheduled updates](https://support.google.com/merchants/answer/14991445?hl=en).
6. Run the initial fetch and review processing errors and product eligibility in Merchant Center. A valid feed does not guarantee approval or placement. Free listings and paid Shopping campaigns are separate destinations; paid campaigns require their own setup.

## Export behaviour

- One item per variant, with a stable ID and shared product group ID. Specific landing links such as `/product/heavyweight-box-tee?variant=box-tee-white-m` preselect the matching options and main image. Invalid variant links return a not-found page.
- Integer minor-unit prices become two-decimal currency values. Variant price overrides and genuine catalogue markdowns are reflected in `price` and `sale_price`.
- Zero-stock and disabled variants are `out_of_stock`. Future releases (`coming-soon` / `pre-order`) are omitted because this checkout cannot accept their orders and the catalogue has no release dates.
- Colour, size, material, pattern, age group and gender map to standard attributes. All generic options, including length and pack size, are also emitted as `variant_option`, with `item_group_title`. [Google's variant-option format](https://support.google.com/merchants/answer/17085214?hl=en).
- Feed responses are generated at request time with `Cache-Control: no-store`. They reflect the catalogue at fetch time; Google's schedule determines when it receives subsequent changes. For frequent stock changes, increase fetch frequency as available or implement the Merchant API later.
- Feed data is scoped to the configured business, XML-escaped, and uses absolute links. No customer, cart, order or contact-form information is exported.

Review the [current product data specification](https://support.google.com/merchants/answer/7052112?hl=en) for requirements specific to the business, product category and target country. Google-side validation and a live checkout remain required before launch.
