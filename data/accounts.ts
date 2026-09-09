import type { Brand, OrderItem, Product } from "@/types";
import type {
  DemoAddress,
  DemoOrder,
  DemoOrderStatus,
  DemoProfile,
} from "@/types/account";
export type {
  DemoAddress,
  DemoOrder,
  DemoOrderStatus,
  DemoProfile,
} from "@/types/account";

export const demoCustomer: DemoProfile = {
  id: "alex",
  name: "Alex Morgan",
  email: "alex@customer.example",
  initials: "AM",
  joined: "2026-06-12",
};
export const demoAdmin: DemoProfile = {
  id: "jamie",
  name: "Jamie Taylor",
  email: "jamie@admin.example",
  initials: "JT",
  joined: "2026-01-08",
};
export const demoCustomers: DemoProfile[] = [
  demoCustomer,
  {
    id: "sam",
    name: "Sam Ellis",
    email: "sam@customer.example",
    initials: "SE",
    joined: "2026-08-18",
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    email: "jordan@customer.example",
    initials: "JL",
    joined: "2026-07-24",
  },
  {
    id: "robin",
    name: "Robin Bennett",
    email: "robin@customer.example",
    initials: "RB",
    joined: "2026-09-07",
  },
];
export const demoAddresses: DemoAddress[] = [
  {
    id: "home",
    label: "Home",
    isDefault: true,
    fullName: "Alex Morgan",
    line1: "24 Example Lane",
    city: "London",
    postcode: "E2 8AA",
    country: "United Kingdom",
  },
  {
    id: "studio",
    label: "Studio",
    isDefault: false,
    fullName: "Alex Morgan",
    line1: "8 Sample Yard",
    line2: "Studio 4",
    city: "London",
    postcode: "E8 3AA",
    country: "United Kingdom",
  },
];

/** Fictional display records. Separate from checkout orders and live inventory. */
export function createDemoOrders(
  products: Product[],
  brand: Brand,
): DemoOrder[] {
  const seeds: {
    number: string;
    customerId: string;
    placed: string;
    status: DemoOrderStatus;
    productIds: string[];
  }[] = [
    {
      number: "NF-1048",
      customerId: "sam",
      placed: "2026-09-09",
      status: "Processing",
      productIds: ["overshirt", "canvas-tote"],
    },
    {
      number: "NF-1047",
      customerId: "alex",
      placed: "2026-09-08",
      status: "Dispatched",
      productIds: ["zip-hoodie", "box-tee"],
    },
    {
      number: "NF-1046",
      customerId: "jordan",
      placed: "2026-09-08",
      status: "Processing",
      productIds: ["cargo-pant"],
    },
    {
      number: "NF-1045",
      customerId: "robin",
      placed: "2026-09-07",
      status: "Processing",
      productIds: ["crewneck", "logo-cap"],
    },
    {
      number: "NF-1032",
      customerId: "alex",
      placed: "2026-08-22",
      status: "Delivered",
      productIds: ["sweatpant", "canvas-tote"],
    },
    {
      number: "NF-1016",
      customerId: "alex",
      placed: "2026-07-16",
      status: "Delivered",
      productIds: ["box-tee", "logo-cap"],
    },
  ];
  return seeds.map(({ productIds, ...seed }) => {
    const customer = demoCustomers.find(
      (person) => person.id === seed.customerId,
    )!;
    const items = productIds.flatMap((id): OrderItem[] => {
      const product = products.find((item) => item.id === id);
      if (!product) return [];
      const variant =
        product.variants.find(
          (item) => item.selectedOptions.Size === "M" && item.available,
        ) ?? product.variants[0];
      if (!variant) return [];
      return [
        {
          productId: id,
          variantId: variant.id,
          name: product.name,
          sku: variant.sku,
          selectedOptions: variant.selectedOptions,
          image: variant.image ?? product.images[0],
          quantity: 1,
          unitPrice: variant.price ?? product.price,
        },
      ];
    });
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shipping =
      subtotal >= brand.freeShippingThreshold
        ? 0
        : brand.shipping.standardPrice;
    return {
      ...seed,
      items,
      shipping,
      total: subtotal + shipping,
      address: {
        ...demoAddresses[0],
        fullName: customer.name,
        ...(customer.id === "alex"
          ? {}
          : {
              line1: "12 Demo Street",
              city: "Manchester",
              postcode: "M1 1AA",
            }),
      },
    };
  });
}
