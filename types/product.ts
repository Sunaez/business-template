export type MoneyCurrency = "GBP" | "USD" | "EUR";

export interface MerchantProductData {
  /** Opt in only after reviewing real product data and images for publication. */
  enabled: boolean;
  brand?: string;
  googleProductCategory?: string;
  productType?: string;
  condition?: "new" | "refurbished" | "used";
  ageGroup?: "newborn" | "infant" | "toddler" | "kids" | "adult";
  gender?: "male" | "female" | "unisex";
  sizeSystem?: "UK" | "US" | "EU";
  material?: string;
  titleSource?: "default" | "trained_algorithmic_media";
  descriptionSource?: "default" | "trained_algorithmic_media";
}

export interface MerchantVariantData {
  gtin?: string;
  mpn?: string;
  /** Set false only if the manufacturer has assigned no identifiers. */
  identifierExists?: boolean;
  multipack?: number;
}

export interface ProductImage {
  src: string;
  alt: string;
}

/** Options are deliberately generic: Colour, Size, Length, Fit, Material, etc. */
export interface ProductOption {
  name: string;
  values: string[];
  swatches?: Record<string, string>;
}

export interface ProductVariant {
  merchant?: MerchantVariantData;
  id: string;
  businessId: string;
  productId: string;
  sku: string;
  selectedOptions: Record<string, string>;
  stock: number;
  available: boolean;
  /** Optional override in the currency's minor unit (pence for GBP). */
  price?: number;
  image?: ProductImage;
}

export type InventoryStatus = "in-stock" | "coming-soon" | "pre-order";

export interface Product {
  merchant?: MerchantProductData;
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  /** All monetary values are integer minor units. */
  price: number;
  compareAtPrice?: number;
  currency: MoneyCurrency;
  images: ProductImage[];
  collectionIds: string[];
  tags: string[];
  available: boolean;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  material: string;
  careInstructions: string;
  fitDescription: string;
  modelInformation: string;
  shippingInformation: string;
  options: ProductOption[];
  variants: ProductVariant[];
  inventoryStatus: InventoryStatus;
  sizeGuideId?: string;
  createdAt: string;
  sortOrder: number;
}

export interface Collection {
  id: string;
  businessId: string;
  title: string;
  slug: string;
  description: string;
  image: ProductImage;
  productIds: string[];
  sortOrder: number;
  featured: boolean;
}

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  businessId?: string;
  query?: string;
  collection?: string;
  collectionId?: string;
  sizes?: string[];
  colours?: string[];
  /** Arbitrary option filters, e.g. { Length: ["Regular"] }. */
  options?: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  tags?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sort?: ProductSort;
  limit?: number;
}
