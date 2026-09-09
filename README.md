# NORTHFORM storefront

A complete, configurable clothing storefront built with Next.js App Router, React, TypeScript and Tailwind CSS 4. NORTHFORM is the fictional demo identity. The catalogue, imagery, brand content and theme are separated from the storefront components.

## Run locally

Requires Node.js 20.9 or later and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. No accounts, API keys or environment variables are required. `npm run dev -- --port 3001` uses a different port.

```sh
npm run build
npm start
```

For production, set `NEXT_PUBLIC_SITE_URL` to the storefront's actual origin. The demo deliberately supplies `noindex` metadata; change that when launching a real store.

## What works

- Configurable homepage modules; three header, hero, product-card and product-grid styles; two footer variants.
- Twelve products and nine collections, with catalogue search, predictive search, filters and sorting.
- Generic variant combinations with individual SKUs, stock and price overrides. Size is explicitly selected before purchase. Unavailable combinations, coming-soon and pre-order products cannot be bought.
- Responsive product galleries, thumbnails, keyboard controls, zoom, hover images, alternate white tee photography and recently viewed products.
- Tenant-scoped cart persistence, cross-tab cart updates, quantities, removal, cart drawer, full cart, delivery estimates and free-shipping progress.
- Validated demo checkout, standard and express delivery, locally saved order confirmation and order deletion. Prices and inventory are re-resolved through a dedicated checkout adapter.
- Demo customer and admin accounts with personal order history, tracking previews, wishlist, saved addresses, profile preferences, order management, CSV exports and variant stock controls.
- Mobile menu and filters, swipeable galleries, a fixed purchase bar with safe-area padding, readable form inputs, accessible modal dialogs, focus styles and reduced-motion support.

## Pages

| Page                 | Route                                                  |
| -------------------- | ------------------------------------------------------ |
| Homepage             | `/`                                                    |
| All products         | `/shop`                                                |
| Collection           | `/collections/new-arrivals` and other collection slugs |
| Product              | `/product/heavyweight-box-tee` and other product slugs |
| Search               | `/search?q=hoodie`                                     |
| Cart                 | `/cart`                                                |
| Checkout             | `/checkout`                                            |
| Order confirmation   | `/order-confirmation`                                  |
| Demo account chooser | `/account`                                             |
| Customer account     | `/account/customer`                                    |
| Admin dashboard      | `/account/admin`                                       |
| Brand story          | `/about`                                               |
| Contact              | `/contact`                                             |
| Size guide           | `/size-guide`                                          |
| Shipping and returns | `/shipping-returns`                                    |
| Privacy              | `/privacy`                                             |
| Terms                | `/terms`                                               |

Unknown pages have a custom not-found screen.

## Change the brand

Start with **`data/brand.ts`**. `brandConfig` controls identity, navigation, marketing copy, service messages, announcement bar, shipping, return window, currency, locale, contact details, size tables, theme and component variants. Types live in `types/brand.ts`.

Change `homepageSections` to reorder or omit modules:

```ts
homepageSections: [
  "hero",
  "newArrivals",
  "editorialSplit",
  "categoryTiles",
  "newsletter",
];
```

Other supported modules: `featuredCollection`, `bestSellers`, `campaign`, `promotion`, `brandStory` and `socialGallery`. Content for each module is supplied by the configuration. `featuredCollectionSlug` determines the featured collection's actual products.

`lib/theme.ts` turns the theme into CSS variables. Change colours, display/body typography, image/button radii, navigation casing, spacing or dark/light mode in the configuration. The bundled Manrope font is self-hosted by Next.js; swap the font loader in `app/layout.tsx` when adding another downloaded typeface.

Three optional presets in `data/presets.ts` demonstrate how much the same storefront can change. Copy `.env.example` to `.env.local`, set `STOREFRONT_PRESET` to `studio`, `gallery` or `after-dark`, then restart the dev server. Production presets are selected at build time.

- **studio:** warm neutrals, full-bleed campaign, minimal product cards.
- **gallery:** serif display typography, centred header, asymmetrical editorial hero and spacious cards.
- **after-dark:** dark surfaces, split hero, editorial header, detailed cards and softer corners.

## Catalogue and integration boundaries

```text
app/                    Server page routes and layout
components/layout/      Header, hero, footer and newsletter variants
components/catalog/     Product cards, grids and interactive discovery
components/commerce/    Cart, gallery, variants, checkout and order UI
components/content/     Storytelling, contact and size-guide components
components/ui/          Shared accessible drawer
data/                   Brand configuration, presets, products, collections
types/                  Brand, Product, Variant, CartItem, Order and Address
lib/catalog.ts          Async, tenant-scoped data access
lib/catalog-filter.ts   Shared pure filtering and sorting
lib/variants.ts          Generic combination and purchase validation
lib/inventory.ts         Variant stock state
lib/pricing.ts           Integer-money arithmetic and shipping totals
lib/checkout.ts          CheckoutGateway interface and demo adapter
public/images/          Optimised, local demo photography
tests/                  Domain, shopper and accessibility checks
```

Pages read through `getProducts()`, `getProductBySlug()`, `getCollections()` and `getBrandConfig()`. Components receive serialisable data rather than importing mock arrays. Catalogue reads scope by `businessId` and return isolated snapshots.

All monetary values are **integer minor units**: `3400` means £34. Generic options use names and values; variants contain `selectedOptions`, SKU, stock, availability and optional price/image overrides. The tote's `Pack size: Pair` demonstrates a £42 override; cargo trousers demonstrate a third `Length` option. The black tee in M has four units; black L has none.

To connect Supabase, replace the async implementations in `lib/catalog.ts`, resolve the tenant from a trusted domain mapping, and enforce the same tenant boundary with database RLS. Do not accept a client-supplied tenant ID as authorization. The account and merchant dashboard are visual demos; no SaaS backend or authentication has been implemented.

To connect Stripe/Stripe Connect, implement `CheckoutGateway` through a server endpoint that re-prices products, validates/reserves inventory and creates a payment session. Keep credentials and fee calculations on the server. Mark an order paid only after a verified webhook. The local adapter intentionally makes no payment requests and reserves no real inventory.

## Explore the demo accounts

Open **`/account`** from the header account icon or the mobile menu. Choose either fictional account; no password is required.

- **Alex Morgan (customer):** three personal orders, order detail and tracking previews, four wishlist pieces, two saved addresses, editable profile details and email preferences.
- **Jamie Taylor (admin):** sample order totals, pending fulfilment, customer records, searchable/filterable orders, status updates, CSV export, and stock adjustments for every size and colour in the existing catalogue.

Account state is held in memory inside `app/account/layout.tsx`. Use **Switch account** to see an admin order update from the customer's perspective. Refreshing or leaving the account area resets the demo. Wishlist, address and profile edits only affect the preview; stock adjustments do not change the storefront catalogue or checkout. No authentication, payments, shipping, returns, subscriptions or emails are connected. Both demo roles are publicly accessible.

Seed profiles, addresses and orders live in `data/accounts.ts`; types live in `types/account.ts`. `StorefrontProvider` shares the existing catalogue with cart, search and accounts, avoiding a second catalogue payload. `components/account/AccountProviders.tsx` keeps customer, inventory and order state independent; its update functions validate edits through `lib/account.ts`.

The dashboards compose small components in `components/account/customer/`, `admin/`, `orders/` and `shared/`. Secondary sections and drawers load on demand. On phones, a native section selector and stacked admin records keep actions reachable without sideways scrolling. Desktop retains tables and a sticky account sidebar. See [the performance notes](docs/performance.md) for measurements, implementation boundaries and verification.

## Demo boundaries

Google Merchant Center compatibility is available through `/feeds/google.xml`, with a local preview at `/feeds/google.xml?preview=1`. The export includes variant links, prices, stock and configurable product identifiers. See [the setup guide](docs/google-merchant.md) before enabling live publication. The default sample products are excluded from the live feed.

The homepage and `/for-business` promote personalised storefronts, order management integration, Google Shopping and mobile shopping. `/about` permanently redirects to `/for-business`. Edit the copy in `data/brand.ts` under `businessFeatures`.

- Checkout saves one demo order in this browser; no payment is taken and no shipment or confirmation email is created.
- Card payments, Apple Pay, Google Pay, account authentication and discount-code validation are clearly marked placeholders.
- Newsletter submission shows a local preview response; no subscription is created. Contact prepares an email draft and does not send it.
- Cart, recent product IDs and demo order information use tenant-prefixed local storage keys. The confirmation page can delete the stored order. Clearing browser site data removes all local records.
- Product and campaign photography is generated demo imagery. Some colour options reuse the main photograph; the white tee demonstrates a distinct variant image. Supply real, colour-accurate product photos before trading.
- Social links lead to the social platforms, not fictional brand accounts. Contact details use a reserved `.example` address. Policy pages describe demo behaviour and must be adapted to the actual business before launch.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the dev server if necessary. It covers stock caps, refresh persistence, checkout totals, unavailable combinations, filtering, search, recently viewed products, keyboard gallery controls, all essential routes, 320/390/768/1440px layouts, and axe accessibility checks. The domain suite covers tenant isolation, tampered variant data, integer pricing, third-option combinations and checkout failure handling.

Generated image paths and prompts are recorded in **`docs/image-prompts.md`**.
