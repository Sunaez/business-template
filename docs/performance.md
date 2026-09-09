# Loading and responsive account improvements

Measured on 9 September 2026 using Next.js 16.3.4 production builds, Chromium, a 1440 × 900 viewport, and a fresh browser context for every route. The initial page is allowed to reach network idle without scrolling or hovering. Sizes use KiB (1,024 bytes). These are local payload measurements, not field Core Web Vitals or a claim about a particular connection's loading time.

| Page             | HTML before → after | Initial image downloads before → after |
| ---------------- | ------------------: | -------------------------------------: |
| Home             |   180.5 → 165.3 KiB |                       121.2 → 81.0 KiB |
| Shop             |   222.4 → 211.2 KiB |                        87.4 → 47.2 KiB |
| Account chooser  |   194.8 → 112.1 KiB |                        31.4 → 31.4 KiB |
| Customer account |   206.8 → 122.1 KiB |                        31.1 → 22.7 KiB |
| Admin account    |   197.9 → 116.9 KiB |                          0.9 → 0.9 KiB |
| Box tee product  |   232.4 → 219.7 KiB |                       116.0 → 84.1 KiB |

The account screens have approximately 41–42% less uncompressed HTML. Their compressed HTML transfers fell from 30.6–32.0 KiB to 19.2–20.9 KiB. The shop downloads about 46% fewer image bytes on initial load. Account chooser JavaScript fell from 165.3 to 152.3 KiB. Other routes have similar JavaScript totals: the small client component for hover images trades a little code for substantially fewer image downloads.

## What changed

- `StorefrontProvider` supplies the catalogue once. Accounts reuse that data rather than serialising a second product catalogue and brand configuration. Its stable context is separate from cart changes.
- Header search, mobile navigation, the cart drawer, secondary account sections, and editing drawers load on demand. Local loading boundaries keep the current screen and focused trigger mounted while a chunk is fetched. Closed zoom dialogs no longer render the enlarged image.
- Product cards request their alternate photo only on mouse hover. Touch browsing does not fetch decorative hover images. Homepage and account product grids defer below-fold photography, and wishlist images provide sizes matching their actual layout. Hero images use the current Next.js preload API.
- Customer, inventory and order state have separate contexts. Inventory summaries are memoised. Update functions validate variant ownership and quantities, order statuses, profile details and addresses before applying changes. CSV export escapes values and neutralises formula prefixes. These are still public visual demo accounts.
- Account controllers compose dedicated views in `customer/`, `admin/`, `orders/` and `shared/`. Shared types live in `types/account.ts`; validation, stock summaries and CSV formatting live in `lib/account.ts`.
- Phones use a native account section selector, stacked admin records with visible labels/actions, larger text and touch targets, compact summary metrics, and safe-area padding in drawers. Desktop retains tables and a sticky sidebar. Drawers restore focus when dismissed; changing sections focuses the new heading.

## Reproduce the measurements

```sh
npm run build
npm run start -- --port 3001
```

In another terminal:

```sh
node scripts/measure-loading.mjs http://localhost:3001
```

The script reports uncompressed HTML and encoded response sizes for scripts, images and all subresources. Automatic route prefetching is included; caches, viewport, device pixel ratio, image formats and hosting compression can change the totals. Loading speed should also be checked on the deployed host with real mobile connections.

## Verification

Production build, TypeScript and ESLint passed. All 20 domain tests and 18 browser tests passed, including account switching, order updates, stock validation, address defaults, wishlist changes, checkout, search, filtering, mobile navigation, deferred image loading and focus restoration. Layout checks cover 320, 390, 768 and 1440 pixel widths. Automated accessibility checks cover the account entry, both dashboards, a narrow stock drawer, and the existing storefront flows.
