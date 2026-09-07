import type {
  Product,
  ProductImage,
  ProductOption,
  ProductVariant,
} from "@/types";
import { DEMO_BUSINESS_ID } from "./brand";

const swatches: Record<string, string> = {
  Black: "#292a28",
  Chalk: "#e7e3d9",
  White: "#fafaf6",
  Olive: "#747865",
  Stone: "#b8b1a2",
  Heather: "#b2b0a9",
  Navy: "#343b48",
  Sand: "#c1b39b",
  Espresso: "#5a483e",
};
const apparelSizes = ["XS", "S", "M", "L", "XL"];
const image = (src: string, alt: string): ProductImage => ({
  src: `/images/${src}.jpg`,
  alt,
});
const colourOption = (colours: string[]): ProductOption => ({
  name: "Colour",
  values: colours,
  swatches: Object.fromEntries(
    colours.map((colour) => [colour, swatches[colour]]),
  ),
});

/** Enumerate real combinations; no component assumes that an option is a size or colour. */
function variants(
  productId: string,
  options: ProductOption[],
  priceOverride?: { option: string; value: string; price: number },
): ProductVariant[] {
  const combinations = options.reduce<Record<string, string>[]>(
    (rows, option) =>
      rows.flatMap((row) =>
        option.values.map((value) => ({ ...row, [option.name]: value })),
      ),
    [{}],
  );
  return combinations.map((selectedOptions, index) => {
    let stock = [8, 15, 4, 0, 6, 12, 3, 18, 7, 0, 9, 2, 11, 5, 0][index % 15];
    if (
      productId === "box-tee" &&
      selectedOptions.Colour === "Black" &&
      selectedOptions.Size === "M"
    )
      stock = 4;
    if (
      productId === "box-tee" &&
      selectedOptions.Colour === "Black" &&
      selectedOptions.Size === "L"
    )
      stock = 0;
    if (
      productId === "box-tee" &&
      selectedOptions.Colour === "White" &&
      selectedOptions.Size === "M"
    )
      stock = 12;
    const suffix = Object.values(selectedOptions)
      .map((value) => value.toLowerCase().replace(/\s+/g, "-"))
      .join("-");
    return {
      id: `${productId}-${suffix}`,
      businessId: DEMO_BUSINESS_ID,
      productId,
      sku: `NF-${productId.toUpperCase()}-${Object.values(selectedOptions)
        .map((value) => value.slice(0, 3).toUpperCase())
        .join("-")}`,
      selectedOptions,
      stock,
      available: stock > 0,
      ...(priceOverride &&
      selectedOptions[priceOverride.option] === priceOverride.value
        ? { price: priceOverride.price }
        : {}),
    };
  });
}

interface ProductSeed extends Partial<Product> {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  collectionIds: string[];
  options: ProductOption[];
}

function createProduct(seed: ProductSeed, index: number): Product {
  const product: Product = {
    businessId: DEMO_BUSINESS_ID,
    slug: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    currency: "GBP",
    tags: ["essentials", "relaxed-fit"],
    available: true,
    featured: false,
    newArrival: false,
    bestSeller: false,
    material: "100% cotton. Substantial by nature, soft with wear.",
    careInstructions:
      "Machine wash cold at 30°C with similar colours. Wash inside out. Reshape while damp and air dry. Do not tumble dry. Cool iron on the reverse.",
    fitDescription:
      "A relaxed, contemporary fit. Take your usual size; size down for a closer silhouette.",
    modelInformation: "Model is 185 cm / 6'1\" and wears size M.",
    shippingInformation:
      "Dispatched in 1–2 working days. Complimentary UK standard delivery on orders of £100 and over. Returns accepted within 30 days.",
    variants: variants(seed.id, seed.options),
    inventoryStatus: "in-stock",
    sizeGuideId: "tops",
    createdAt: `2026-08-${String(28 - index).padStart(2, "0")}T09:00:00.000Z`,
    sortOrder: index,
    ...seed,
  };
  if (product.inventoryStatus !== "in-stock") {
    product.available = false;
    product.variants = product.variants.map((variant) => ({
      ...variant,
      stock: 0,
      available: false,
    }));
  }
  return product;
}

const seeds: ProductSeed[] = [
  {
    id: "box-tee",
    name: "Heavyweight Box Tee",
    price: 3400,
    description:
      "The foundation of a considered wardrobe. Cut from substantial 280 gsm cotton jersey, our signature tee has a softly structured hand, a generous boxy body, and a ribbed neckline that holds its shape. Finished with a small tonal mark at the hem. An everyday essential, made with intention.",
    shortDescription:
      "A substantial everyday tee with a quietly confident shape.",
    images: [
      image("tee", "Heavyweight Box Tee in washed charcoal cotton, front view"),
      image(
        "tee-detail",
        "Heavyweight Box Tee ribbed neckline and cotton fabric detail",
      ),
      image("tee-white", "Heavyweight Box Tee in white cotton, front view"),
    ],
    collectionIds: ["new-arrivals", "t-shirts", "best-sellers", "autumn-26"],
    options: [
      colourOption(["Black", "Chalk", "White", "Olive"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "100% cotton, 280 gsm compact jersey. Ribbed crew neckline.",
    featured: true,
    newArrival: true,
    bestSeller: true,
  },
  {
    id: "zip-hoodie",
    name: "Core Zip Hoodie",
    price: 7800,
    description:
      "Comfort with a little more structure. A two-way metal zip meets dense 450 gsm loopback cotton, finished with a double-layer hood and roomy split pockets. The slightly cropped body layers easily over your favourite tee, while dropped shoulders keep the silhouette unhurried.",
    shortDescription: "Heavyweight loopback. An easy layer for every day.",
    images: [
      image(
        "hoodie",
        "Core Zip Hoodie in heather grey with a two-way metal zip",
      ),
      image(
        "hoodie-detail",
        "Core Zip Hoodie relaxed silhouette and hood detail",
      ),
    ],
    collectionIds: ["new-arrivals", "hoodies", "best-sellers", "autumn-26"],
    options: [
      colourOption(["Heather", "Black", "Olive"]),
      { name: "Size", values: apparelSizes },
    ],
    material:
      "100% cotton, 450 gsm loopback. Two-way metal zip and cotton drawcord.",
    featured: true,
    newArrival: true,
    bestSeller: true,
  },
  {
    id: "overshirt",
    name: "Structured Overshirt",
    price: 9200,
    description:
      "For the weather between seasons. Washed cotton twill gives this overshirt an easy drape without losing its shape. Two generous chest pockets, corozo buttons, and a straight hem make it as useful open over a tee as it is buttoned on its own.",
    shortDescription: "The layer that brings it all together.",
    images: [
      image("overshirt", "Structured Overshirt in olive washed cotton twill"),
      image(
        "overshirt-detail",
        "Structured Overshirt pocket and natural button detail",
      ),
    ],
    collectionIds: ["new-arrivals", "outerwear", "autumn-26"],
    options: [
      colourOption(["Olive", "Stone", "Black"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "100% cotton, 320 gsm washed twill. Natural corozo buttons.",
    featured: true,
    newArrival: true,
  },
  {
    id: "sweatpant",
    name: "Relaxed Sweatpant",
    price: 6400,
    description:
      "A slower pace, a better fit. Dense cotton loopback gives our sweatpant a clean drape, with an adjustable elasticated waist and an open, straight leg. Deep side pockets and a single rear patch pocket keep the useful things close.",
    shortDescription: "Room to move. A clean, straight-leg finish.",
    images: [
      image(
        "sweatpants",
        "Relaxed Sweatpant in stone with an open straight leg",
      ),
      image(
        "sweatpants-detail",
        "Relaxed Sweatpant waistband and pocket detail",
      ),
    ],
    collectionIds: ["new-arrivals", "bottoms", "best-sellers", "autumn-26"],
    options: [
      colourOption(["Stone", "Black", "Espresso"]),
      { name: "Size", values: apparelSizes },
    ],
    material:
      "100% cotton, 450 gsm loopback. Elasticated waist with an internal drawcord.",
    featured: true,
    newArrival: true,
    bestSeller: true,
    sizeGuideId: "bottoms",
  },
  {
    id: "logo-cap",
    name: "Logo Cap",
    price: 2800,
    description:
      "The finishing touch, without overthinking it. A six-panel cap in washed cotton canvas with a curved peak, subtle embroidered wordmark, and an adjustable metal fastening. Designed to feel like an old favourite from the first wear.",
    shortDescription: "Washed cotton. A familiar favourite.",
    images: [
      image("cap", "Logo Cap in black cotton with a subtle tonal monogram"),
    ],
    collectionIds: ["accessories", "best-sellers", "autumn-26"],
    options: [
      colourOption(["Black", "Olive", "Sand"]),
      { name: "Size", values: ["One size"] },
    ],
    material: "100% cotton canvas. Metal buckle adjuster.",
    fitDescription:
      "One adjustable size, suitable for head circumferences of 54–62 cm.",
    modelInformation: "Unisex fit. Adjustable rear fastening.",
    careInstructions:
      "Spot clean gently with a damp cloth. Air dry out of direct sunlight. Do not machine wash.",
    bestSeller: true,
    sizeGuideId: undefined,
  },
  {
    id: "long-sleeve",
    name: "Everyday Long Sleeve",
    price: 4600,
    description:
      "A familiar silhouette with a weightier feel. This long-sleeve tee balances a roomy body with neat ribbed cuffs. The 240 gsm cotton jersey is soft from the first wear and layers cleanly under an overshirt when the temperature dips.",
    shortDescription: "An everyday layer, quietly refined.",
    images: [
      image(
        "long-sleeve",
        "Everyday Long Sleeve in chalk cotton with ribbed cuffs",
      ),
    ],
    collectionIds: ["t-shirts", "autumn-26"],
    options: [
      colourOption(["Chalk", "Black", "Navy"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "100% cotton, 240 gsm jersey. Ribbed cuffs and neckline.",
  },
  {
    id: "crewneck",
    name: "Essential Crewneck",
    price: 6800,
    compareAtPrice: 8000,
    description:
      "A good sweatshirt earns its place. Made from brushed-back cotton with a rounded, generous silhouette, our crewneck has ribbed side panels for freedom of movement and a subtle tonal chest embroidery. Warm enough for the first cool mornings, easy enough for every day.",
    shortDescription: "Soft on the inside. Considered on the outside.",
    images: [
      image(
        "crewneck",
        "Essential Crewneck in heather grey heavyweight cotton",
      ),
    ],
    collectionIds: ["hoodies", "sale", "best-sellers"],
    options: [
      colourOption(["Heather", "Navy", "Black"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "100% cotton, 400 gsm brushed-back fleece.",
    tags: ["essentials", "relaxed-fit", "sale"],
    bestSeller: true,
  },
  {
    id: "cargo-pant",
    name: "Utility Cargo Pant",
    price: 8800,
    description:
      "Function, pared back. A relaxed straight leg in durable cotton ripstop, with discreet cargo pockets and adjustable hems. Finished with a zip fly and a partly elasticated waist, these are trousers for whatever the day turns into.",
    shortDescription: "Useful details. A relaxed point of view.",
    images: [
      image(
        "cargo-pant",
        "Utility Cargo Pant in olive with generous side pockets and straight legs",
      ),
    ],
    collectionIds: ["bottoms", "new-arrivals", "autumn-26"],
    options: [
      colourOption(["Olive", "Black"]),
      { name: "Size", values: apparelSizes },
      { name: "Length", values: ["Regular", "Long"] },
    ],
    material: "100% cotton ripstop, 250 gsm. Metal zip and adjustable hems.",
    newArrival: true,
    sizeGuideId: "bottoms",
  },
  {
    id: "rib-tank",
    name: "Ribbed Tank",
    price: 2600,
    compareAtPrice: 3200,
    description:
      "The piece underneath everything. Soft ribbed cotton with a little stretch sits close to the body, with a considered neckline and neatly bound edges. Wear it on its own on warmer days or as the first layer when the seasons change.",
    shortDescription: "A close-fitting essential in soft cotton rib.",
    images: [
      image(
        "rib-tank",
        "Ribbed Tank in soft white cotton with a clean bound neckline",
      ),
    ],
    collectionIds: ["t-shirts", "sale"],
    options: [
      colourOption(["White", "Black"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "95% cotton, 5% elastane. 220 gsm rib knit.",
    fitDescription: "A close fit with natural stretch. Take your usual size.",
    tags: ["essentials", "fitted", "sale"],
  },
  {
    id: "transit-jacket",
    name: "Transit Jacket",
    price: 14500,
    description:
      "A new layer for changing days. Our forthcoming Transit Jacket pairs a clean, cropped silhouette with a lined body and a stand collar. Designed with room to layer, hidden internal pockets, and a two-way zip for movement. Arriving later this season.",
    shortDescription: "Your next everyday jacket. Coming this season.",
    images: [
      image(
        "transit-jacket",
        "Transit Jacket in matte black with a full front zip and hood",
      ),
    ],
    collectionIds: ["outerwear", "autumn-26"],
    options: [
      colourOption(["Black", "Olive"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "Shell: 65% cotton, 35% nylon. Lining: 100% cotton.",
    inventoryStatus: "coming-soon",
    tags: ["outerwear", "coming-soon"],
  },
  {
    id: "canvas-tote",
    name: "Studio Canvas Tote",
    price: 2400,
    description:
      "Room for the everyday extras. A generously proportioned tote in sturdy, unbleached cotton canvas with shoulder-length handles and an internal slip pocket. A small printed wordmark keeps it simple.",
    shortDescription: "A little more room for everyday life.",
    images: [
      image(
        "canvas-tote",
        "Studio Canvas Tote in natural canvas with a small black monogram",
      ),
    ],
    collectionIds: ["accessories", "new-arrivals"],
    options: [
      colourOption(["Chalk", "Black"]),
      { name: "Pack size", values: ["Single", "Pair"] },
    ],
    material: "100% heavyweight cotton canvas, 340 gsm.",
    fitDescription: "42 cm wide × 40 cm high. Handle drop: 28 cm.",
    modelInformation: "One size. Fits a 15-inch laptop.",
    careInstructions:
      "Hand wash cold. Reshape and air dry. Do not bleach or tumble dry.",
    newArrival: true,
    sizeGuideId: undefined,
  },
  {
    id: "merino-knit",
    name: "Fine Merino Knit",
    price: 11000,
    description:
      "Lightweight warmth with an easy drape. Our first fine-gauge merino knit is designed for layering, with a relaxed body and gently ribbed edges. This piece is part of a future release. Join the studio list to hear when it becomes available.",
    shortDescription: "An upcoming layer, made to take the chill off.",
    images: [
      image(
        "merino-knit",
        "Fine Merino Knit in espresso brown with ribbed cuffs and neckline",
      ),
    ],
    collectionIds: ["hoodies", "autumn-26"],
    options: [
      colourOption(["Espresso", "Stone"]),
      { name: "Size", values: apparelSizes },
    ],
    material: "100% extra-fine merino wool, 12 gauge.",
    careInstructions:
      "Hand wash cold using wool detergent. Gently reshape and dry flat. Do not wring, bleach, or tumble dry.",
    inventoryStatus: "pre-order",
    tags: ["knitwear", "pre-order"],
  },
];

export const products: Product[] = seeds.map(createProduct);

// A real variant price override, and an alternate variant image, are included in the demo.
const tote = products.find((product) => product.id === "canvas-tote")!;
tote.variants = variants(tote.id, tote.options, {
  option: "Pack size",
  value: "Pair",
  price: 4200,
});
const tee = products.find((product) => product.id === "box-tee")!;
tee.variants = tee.variants.map((variant) => ({
  ...variant,
  image: tee.images[variant.selectedOptions.Colour === "White" ? 2 : 0],
}));

// Example Merchant attributes. These fictional products are preview-only until
// a business replaces the catalogue and explicitly opts each real product in.
for (const product of products) {
  product.merchant = {
    enabled: false,
    brand: "NORTHFORM",
    googleProductCategory:
      product.id === "canvas-tote"
        ? "Luggage & Bags > Shopping Totes"
        : "Apparel & Accessories > Clothing",
    productType:
      product.id === "canvas-tote"
        ? "Accessories > Totes"
        : "Clothing > Everyday essentials",
    condition: "new",
    ageGroup: "adult",
    gender: "unisex",
    sizeSystem: "UK",
    titleSource: "trained_algorithmic_media",
    descriptionSource: "trained_algorithmic_media",
    ...product.merchant,
  };
}
for (const variant of tote.variants) {
  variant.merchant = {
    multipack: variant.selectedOptions["Pack size"] === "Pair" ? 2 : 1,
  };
}
