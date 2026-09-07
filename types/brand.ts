import type { MoneyCurrency, ProductImage } from "./product";

export type HeaderVariant = "minimal" | "centered" | "editorial";
export type HeroVariant = "full-bleed" | "split" | "editorial";
export type ProductCardVariant = "minimal" | "editorial" | "detailed";
export type ProductGridVariant = "compact" | "standard" | "spacious";
export type HomepageSection =
  | "hero"
  | "businessFeatures"
  | "featuredCollection"
  | "newArrivals"
  | "bestSellers"
  | "editorialSplit"
  | "campaign"
  | "categoryTiles"
  | "promotion"
  | "brandStory"
  | "socialGallery"
  | "newsletter";

export interface BrandTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
  imageRadius: string;
  buttonRadius: string;
  navigationCase: "uppercase" | "none";
  spacing: "compact" | "spacious";
  mode: "light" | "dark";
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface SizeGuide {
  id: string;
  businessId: string;
  title: string;
  description: string;
  unit: "cm" | "in";
  columns: string[];
  rows: { size: string; measurements: number[] }[];
  notes: string;
}

export interface Brand {
  id: string;
  businessId: string;
  name: string;
  logo?: ProductImage;
  wordmark: string;
  wordmarkSuffix?: string;
  tagline: string;
  description: string;
  theme: BrandTheme;
  layout: {
    header: HeaderVariant;
    hero: HeroVariant;
    productGrid: ProductGridVariant;
    productCard: ProductCardVariant;
    collection: "grid" | "editorial";
    footer: "minimal" | "expanded";
    stickyHeader: boolean;
    transparentHeader: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    href?: string;
    aside?: string;
  };
  headerCopy: {
    editorialNote: string;
    searchTitle: string;
    searchPlaceholder: string;
    searchResultsTitle: string;
    searchEmptyDescription: string;
    searchSuggestionsTitle: string;
  };
  navigation: NavigationLink[];
  socialLinks: NavigationLink[];
  contact: { email: string; phone?: string; address: string };
  shipping: {
    standardPrice: number;
    standardLabel: string;
    expressPrice: number;
    expressLabel: string;
    summary: string;
  };
  returns: { windowDays: number; summary: string };
  freeShippingThreshold: number;
  currency: MoneyCurrency;
  country: string;
  locale: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: ProductImage;
    primaryCta: NavigationLink;
    secondaryCta: NavigationLink;
    issue: string;
    caption: string;
  };
  homepageSections: HomepageSection[];
  sectionCopy: Record<
    | "featuredCollection"
    | "newArrivals"
    | "bestSellers"
    | "categoryTiles"
    | "socialGallery",
    { eyebrow: string; title: string; description: string; linkLabel: string }
  >;
  discovery: {
    stripTitle: string;
    stripNote: string;
    stripCollectionSlugs: string[];
    categoryCollectionSlugs: string[];
    categoryCaption: string;
  };
  serviceCopy: Record<
    "shipping" | "returns" | "craft",
    { title: string; description: string }
  >;
  footerCopy: {
    noteTitle: string;
    noteDescription: string;
    noteLinkLabel: string;
    collectionSlugs: string[];
    helpLinks: NavigationLink[];
  };
  featuredCollectionSlug: string;
  businessFeatures: {
    eyebrow: string;
    title: string;
    description: string;
    cta: NavigationLink;
    features: { title: string; description: string; detail: string }[];
    closingTitle: string;
    closingDescription: string;
  };
  story: {
    eyebrow: string;
    title: string;
    description: string;
    image: ProductImage;
    imageCaption?: string;
    quote: string;
  };
  campaign: {
    eyebrow: string;
    title: string;
    description: string;
    image: ProductImage;
    cta: NavigationLink;
  };
  promotion: { title: string; description: string; cta: NavigationLink };
  newsletter: {
    eyebrow: string;
    title: string;
    description: string;
    signupNote: string;
    successTitle: string;
    successDescription: string;
  };
  sizeGuides: SizeGuide[];
}

export type BrandConfig = Brand;
