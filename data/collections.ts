import type { Collection } from "@/types";
import { DEMO_BUSINESS_ID } from "./brand";
import { products } from "./products";

const collectionSeeds: Omit<
  Collection,
  "businessId" | "productIds" | "sortOrder"
>[] = [
  {
    id: "new-arrivals",
    title: "New arrivals",
    slug: "new-arrivals",
    description:
      "Fresh additions to the everyday rotation. Considered shapes, substantial fabrics, and a new point of view.",
    image: {
      src: "/images/tee.jpg",
      alt: "The latest Northform heavyweight essentials",
    },
    featured: true,
  },
  {
    id: "best-sellers",
    title: "Most worn",
    slug: "best-sellers",
    description:
      "The pieces you come back for. Our community's most-worn essentials, for good reason.",
    image: {
      src: "/images/hoodie.jpg",
      alt: "Northform's best-selling cotton layers",
    },
    featured: true,
  },
  {
    id: "t-shirts",
    title: "T-shirts",
    slug: "t-shirts",
    description:
      "The foundation of a considered wardrobe. Substantial cotton, familiar shapes, an exceptional everyday fit.",
    image: {
      src: "/images/tee.jpg",
      alt: "Northform heavyweight cotton T-shirts",
    },
    featured: true,
  },
  {
    id: "hoodies",
    title: "Hoodies & sweats",
    slug: "hoodies",
    description:
      "A little more weight. A lot more comfort. Our signature cotton layers are made for an unhurried everyday.",
    image: {
      src: "/images/hoodie.jpg",
      alt: "Northform relaxed hoodies and cotton sweatshirts",
    },
    featured: true,
  },
  {
    id: "outerwear",
    title: "Outerwear",
    slug: "outerwear",
    description:
      "For the days between seasons. Thoughtful outer layers with room for whatever comes next.",
    image: {
      src: "/images/overshirt.jpg",
      alt: "Northform olive overshirt and outerwear collection",
    },
    featured: true,
  },
  {
    id: "bottoms",
    title: "Bottoms",
    slug: "bottoms",
    description:
      "Room to move, space to slow down. Relaxed trousers and sweatpants in fabrics with substance.",
    image: {
      src: "/images/sweatpants.jpg",
      alt: "Northform relaxed trousers and sweatpants",
    },
    featured: true,
  },
  {
    id: "accessories",
    title: "Accessories",
    slug: "accessories",
    description:
      "The little things that make it yours. Useful, understated additions to your daily rotation.",
    image: {
      src: "/images/cap.jpg",
      alt: "Northform caps and everyday accessories",
    },
    featured: true,
  },
  {
    id: "sale",
    title: "Last of a good thing",
    slug: "sale",
    description:
      "Selected pieces from past collections, at a considered price. Once they're gone, they're gone.",
    image: {
      src: "/images/hoodie.jpg",
      alt: "Selected Northform essentials at reduced prices",
    },
    featured: false,
  },
  {
    id: "autumn-26",
    title: "The everyday collection",
    slug: "autumn-26",
    description:
      "Autumn / Winter 2026. Familiar forms, a fresh perspective. A collection for the days in between.",
    image: {
      src: "/images/campaign.jpg",
      alt: "Northform Autumn Winter 2026 campaign",
    },
    featured: true,
  },
];

export const collections: Collection[] = collectionSeeds.map(
  (collection, sortOrder) => ({
    ...collection,
    businessId: DEMO_BUSINESS_ID,
    productIds: products
      .filter((product) => product.collectionIds.includes(collection.id))
      .map((product) => product.id),
    sortOrder,
  }),
);
