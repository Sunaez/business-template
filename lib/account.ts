import type { Product } from "@/types";
import {
  orderStatuses,
  type DemoAddress,
  type DemoOrderStatus,
  type ValidationResult,
} from "@/types/account";

export function isOrderStatus(value: unknown): value is DemoOrderStatus {
  return (
    typeof value === "string" &&
    orderStatuses.some((status) => status === value)
  );
}

export function validateStock(
  product: Product,
  values: Record<string, unknown>,
): ValidationResult<Record<string, number>> {
  const allowed = new Set(product.variants.map((variant) => variant.id));
  if (
    Object.keys(values).length !== allowed.size ||
    Object.keys(values).some((id) => !allowed.has(id))
  )
    return { ok: false, message: "Stock must match this product’s variants." };
  const stock: Record<string, number> = {};
  for (const variant of product.variants) {
    const raw = values[variant.id];
    if (
      (typeof raw !== "number" && typeof raw !== "string") ||
      String(raw).trim() === ""
    )
      return {
        ok: false,
        message: "Enter a stock quantity for every variant.",
      };
    const quantity = Number(raw);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 9999)
      return {
        ok: false,
        message: "Stock must be a whole number between 0 and 9,999.",
      };
    stock[variant.id] = quantity;
  }
  return { ok: true, value: stock };
}

export function validateAddress(
  address: DemoAddress,
): ValidationResult<DemoAddress> {
  const fields = [
    "label",
    "fullName",
    "line1",
    "city",
    "postcode",
    "country",
  ] as const;
  if (
    fields.some(
      (key) =>
        typeof address[key] !== "string" ||
        !address[key].trim() ||
        address[key].trim().length > 120,
    ) ||
    (address.line2?.length ?? 0) > 120
  )
    return {
      ok: false,
      message:
        "Complete the required address details using 120 characters or fewer.",
    };
  const trimmed = {
    ...address,
    ...Object.fromEntries(fields.map((key) => [key, address[key].trim()])),
    line2: address.line2?.trim(),
  };
  return { ok: true, value: trimmed };
}

/** Keep exactly one default while allowing the address book to become empty. */
export function normalizeAddresses(addresses: DemoAddress[]): DemoAddress[] {
  const preferred =
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id;
  return addresses.map((address) => ({
    ...address,
    isDefault: address.id === preferred,
  }));
}

export function getInventorySummary(
  products: Product[],
  stock: Record<string, number>,
) {
  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      product,
      variant,
      quantity: stock[variant.id] ?? variant.stock,
    })),
  );
  const active = variants.filter(
    ({ product }) => product.inventoryStatus === "in-stock",
  );
  return {
    variants,
    lowStock: active.filter(({ quantity }) => quantity > 0 && quantity <= 5),
    outOfStock: active.filter(({ quantity }) => quantity === 0),
  };
}

export function accountDate(date: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Quote every cell and neutralise spreadsheet formulas, including leading whitespace. */
export function createCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${cell.replace(/^(?=\s*[=+@-])/, "'").replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
}
