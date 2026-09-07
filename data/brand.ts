import type { Brand, SizeGuide } from "@/types";

export const DEMO_BUSINESS_ID = "demo-brand";

export const sizeGuides: SizeGuide[] = [
  {
    id: "tops",
    businessId: DEMO_BUSINESS_ID,
    title: "Tops & layers",
    description:
      "Garment measurements, laid flat. Our tops are designed with a relaxed silhouette; take your usual size for the intended fit.",
    unit: "cm",
    columns: ["Chest", "Length", "Sleeve"],
    rows: [
      { size: "XS", measurements: [54, 66, 21] },
      { size: "S", measurements: [57, 68, 22] },
      { size: "M", measurements: [60, 70, 23] },
      { size: "L", measurements: [63, 72, 24] },
      { size: "XL", measurements: [66, 74, 25] },
    ],
    notes:
      "Chest is measured from underarm to underarm. Compare with a garment you own. Allow a tolerance of 1–2 cm; heavyweight cotton may contract slightly after its first wash.",
  },
  {
    id: "bottoms",
    businessId: DEMO_BUSINESS_ID,
    title: "Trousers & sweatpants",
    description:
      "Garment measurements, laid flat, with the waistband relaxed. Elasticated waist styles allow additional room.",
    unit: "cm",
    columns: ["Waist", "Inside leg", "Leg opening"],
    rows: [
      { size: "XS", measurements: [34, 72, 19] },
      { size: "S", measurements: [36, 73, 20] },
      { size: "M", measurements: [38, 74, 21] },
      { size: "L", measurements: [40, 75, 22] },
      { size: "XL", measurements: [42, 76, 23] },
    ],
    notes:
      "Waist measurements are half the circumference. If you sit between sizes, choose the larger size for a more relaxed fit.",
  },
];

/** The storefront identity lives here. Replace this record to create another brand. */
export const brandConfig: Brand = {
  id: DEMO_BUSINESS_ID,
  businessId: DEMO_BUSINESS_ID,
  name: "NORTHFORM",
  wordmark: "NORTHFORM",
  wordmarkSuffix: "®",
  tagline: "Good things. Worn often.",
  description:
    "Considered essentials for the everyday. Independent by design, made to become part of your rotation.",
  theme: {
    primary: "#252823",
    secondary: "#deded4",
    accent: "#e4ebaf",
    background: "#faf9f6",
    surface: "#efeee9",
    text: "#252823",
    muted: "#5f6158",
    border: "#deded7",
    fontDisplay: "var(--font-sans), Arial, sans-serif",
    fontBody: "var(--font-sans), Arial, sans-serif",
    radius: "0px",
    imageRadius: "0px",
    buttonRadius: "0px",
    navigationCase: "uppercase",
    spacing: "spacious",
    mode: "light",
  },
  layout: {
    header: "minimal",
    hero: "full-bleed",
    productGrid: "standard",
    productCard: "minimal",
    collection: "editorial",
    footer: "expanded",
    stickyHeader: true,
    transparentHeader: false,
  },
  announcement: {
    enabled: true,
    aside: "Thoughtfully made. Endlessly worn.",
    text: "A little less, a little better. Complimentary UK delivery over £100.",
    href: "/shipping-returns",
  },
  navigation: [
    { label: "Shop all", href: "/shop" },
    { label: "New arrivals", href: "/collections/new-arrivals" },
    { label: "Collections", href: "/collections/autumn-26" },
    { label: "For businesses", href: "/for-business" },
  ],
  headerCopy: {
    editorialNote: "Independent by design.",
    searchTitle: "Find your everyday essentials",
    searchPlaceholder: "Try a hoodie, tee, or colour…",
    searchResultsTitle: "A few good finds",
    searchEmptyDescription: "Try a broader search, like ‘tee’ or ‘cotton’.",
    searchSuggestionsTitle: "Start somewhere good",
  },
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Pinterest", href: "https://www.pinterest.com/" },
  ],
  contact: {
    email: "hello@northform.example",
    address: "Independent design studio · London, United Kingdom",
  },
  shipping: {
    standardPrice: 495,
    standardLabel: "Standard delivery · 3–5 working days",
    expressPrice: 795,
    expressLabel: "Express delivery · 1–2 working days",
    summary:
      "UK standard delivery is £4.95, or complimentary on orders of £100 and over. Orders are packed within two working days. Express delivery is available for £7.95.",
  },
  returns: {
    windowDays: 30,
    summary:
      "Take your time. Return unworn pieces with their original tags within 30 days of delivery. Contact our studio to arrange your return; original delivery charges are excluded.",
  },
  freeShippingThreshold: 10000,
  currency: "GBP",
  country: "GB",
  locale: "en-GB",
  hero: {
    eyebrow: "THE EVERYDAY UNIFORM — VOL. 04",
    title: "Made for\nthe everyday.",
    description:
      "Considered essentials. Uncompromising quality.\nFor wherever the day takes you.",
    image: {
      src: "/images/campaign.jpg",
      alt: "Northform campaign: relaxed contemporary essentials in a quiet urban setting",
    },
    primaryCta: { label: "Discover the collection", href: "/shop" },
    secondaryCta: { label: "Build your own store", href: "/for-business" },
    issue: "AUTUMN / WINTER 2026",
    caption: "Made for the days in between.",
  },
  homepageSections: [
    "hero",
    "newArrivals",
    "businessFeatures",
    "categoryTiles",
    "newsletter",
  ],
  sectionCopy: {
    featuredCollection: {
      eyebrow: "THE CONSIDERED EDIT",
      title: "Good things, together.",
      description: "Familiar favourites. A fresh point of view.",
      linkLabel: "Explore the collection",
    },
    newArrivals: {
      eyebrow: "NEW TO THE ROTATION",
      title: "Good clothes. On repeat.",
      description: "Thoughtfully designed. Made to be lived in.",
      linkLabel: "Shop new arrivals",
    },
    bestSellers: {
      eyebrow: "THE MOST REACHED FOR",
      title: "The daily rotation.",
      description: "Thoughtfully designed. Made to be lived in.",
      linkLabel: "Shop best sellers",
    },
    categoryTiles: {
      eyebrow: "A PLACE FOR EVERY PIECE",
      title: "Build your everyday.",
      description: "Good pieces for the way you live.",
      linkLabel: "Explore all essentials",
    },
    socialGallery: {
      eyebrow: "NORTHFORM, IN GOOD COMPANY",
      title: "In good company. @northform",
      description: "An ongoing journal of people, places, and pieces.",
      linkLabel: "Follow along",
    },
  },
  discovery: {
    stripTitle: "Find your everyday",
    stripNote: "Less, but better.",
    stripCollectionSlugs: [
      "t-shirts",
      "hoodies",
      "outerwear",
      "bottoms",
      "accessories",
    ],
    categoryCollectionSlugs: ["t-shirts", "hoodies", "outerwear"],
    categoryCaption: "THE ESSENTIALS",
  },
  serviceCopy: {
    shipping: {
      title: "Good things, delivered.",
      description: "Complimentary delivery over {threshold}",
    },
    returns: {
      title: "A little room to decide.",
      description: "{days}-day returns, made simple",
    },
    craft: {
      title: "Made for your business.",
      description: "Your brand. Your store. New possibilities.",
    },
  },
  footerCopy: {
    noteTitle: "Your next chapter, online.",
    noteDescription:
      "A personalised website. Simpler orders.\nMore ways for customers to find you.",
    noteLinkLabel: "Explore business features",
    collectionSlugs: ["new-arrivals", "t-shirts", "hoodies", "outerwear"],
    helpLinks: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "Size guide", href: "/size-guide" },
      { label: "My account", href: "/account" },
    ],
  },
  featuredCollectionSlug: "new-arrivals",
  businessFeatures: {
    eyebrow: "FOR INDEPENDENT BUSINESSES",
    title: "Your business.\nBuilt to grow.",
    description:
      "Turn what makes your business special into an online store that feels like you. From the first impression to the next order, we help you make it yours.",
    cta: { label: "Let’s build your store", href: "/contact" },
    features: [
      {
        title: "A website that’s yours.",
        description:
          "Customised design, your colours, your story. A personalised website built around your business and the products you love.",
        detail:
          "Choose your layout, shape your collections and bring your own photography. Your storefront can grow and change with your brand.",
      },
      {
        title: "Online orders, simplified.",
        description:
          "Make it easy for customers to browse, choose and order. We can connect online order management to keep your day running smoothly.",
        detail:
          "Plan the right setup for stock, customer details and fulfilment, with the order management and payment integrations your business needs.",
      },
      {
        title: "Get discovered on Google.",
        description:
          "Bring your products to Google Shopping and reach people looking for exactly what you sell, with a feed connected to your catalogue.",
        detail:
          "Share product images, prices, options and availability with Google Merchant Center. Eligible products can appear in free listings; Google reviews and approves participation.",
      },
      {
        title: "Made for mobile.",
        description:
          "A considered shopping experience on every screen, from a quick browse on the go to a full basket at home.",
        detail:
          "Easy navigation, clear product options and a responsive checkout help customers shop comfortably on their phones.",
      },
      {
        title: "Room for every product.",
        description:
          "Colours, sizes, collections and seasonal releases, all presented clearly so customers can find their next favourite.",
        detail:
          "Flexible product options, search, filters, stock messaging and size guides make a growing catalogue easier to explore.",
      },
      {
        title: "The details that build trust.",
        description:
          "Give customers the information they need with clear delivery, returns, contact and product care pages.",
        detail:
          "Make your policies and customer support easy to find, with content and navigation tailored to how your business works.",
      },
    ],
    closingTitle: "A small business.\nA bigger online presence.",
    closingDescription:
      "Tell us what you sell and where you want to go. We’ll help shape a website and the integrations that fit your business.",
  },
  story: {
    eyebrow: "LESS, BUT CONSIDERED",
    imageCaption: "In good company.",
    title: "An everyday kind of extraordinary.",
    description:
      "We started NORTHFORM with a simple idea: the clothes you reach for most should be the ones made with the most thought. Familiar shapes, substantial fabrics, and details that reveal themselves over time. Pieces to live in, on your own terms.",
    image: {
      src: "/images/story.jpg",
      alt: "A quiet moment in the Northform studio, where everyday essentials take shape",
    },
    quote: "A wardrobe built slowly. A life lived fully.",
  },
  campaign: {
    eyebrow: "THE ART OF EVERYDAY",
    title: "Less noise.\nMore you.",
    description:
      "Quiet confidence, in every layer. Discover a collection shaped by the way we really live.",
    image: {
      src: "/images/campaign.jpg",
      alt: "Northform seasonal campaign exploring modern everyday dressing",
    },
    cta: { label: "Explore the edit", href: "/collections/autumn-26" },
  },
  promotion: {
    title: "Your everyday, elevated.",
    description: "Build your rotation with our most-worn essentials.",
    cta: { label: "Shop best sellers", href: "/collections/best-sellers" },
  },
  newsletter: {
    eyebrow: "THE INNER CIRCLE",
    title: "Stay in good company.",
    description:
      "New collections, studio notes, and a few things worth sharing. Straight to your inbox.",
    signupNote: "Good things, occasionally. By signing up, you agree to our",
    successTitle: "Thanks for being here.",
    successDescription:
      "This is a demo signup. No subscription was created and no email was sent.",
  },
  sizeGuides,
};
