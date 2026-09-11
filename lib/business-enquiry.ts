export const enquiryNeeds = [
  "Product showcase",
  "New online store",
  "Replacing an existing website",
  "Adding ecommerce",
  "Google Shopping",
  "Online ordering",
  "Ongoing store management",
  "Not sure yet",
] as const;
export const productCounts = [
  "1–25",
  "26–100",
  "101–500",
  "500+",
  "Not sure yet",
] as const;
export const sellingChannels = [
  "Physical shop only",
  "Instagram / social media",
  "eBay",
  "Etsy",
  "Shopify",
  "Existing website",
  "Other",
] as const;
export const enquiryIntents = ["store", "preview", "consultation"] as const;

export interface BusinessEnquiry {
  businessName: string;
  contactName: string;
  email: string;
  sells: string;
  phone: string;
  website: string;
  social: string;
  productCount: string;
  channel: string;
  needs: string[];
  message: string;
  intent: string;
  companyFax: string;
}
export type EnquiryErrors = Partial<Record<keyof BusinessEnquiry, string>>;
const limits = {
  businessName: 120,
  contactName: 100,
  email: 254,
  sells: 300,
  phone: 40,
  website: 300,
  social: 300,
  productCount: 30,
  channel: 50,
  message: 1500,
  intent: 20,
  companyFax: 100,
};

export function validateBusinessEnquiry(
  input: unknown,
): { ok: true; value: BusinessEnquiry } | { ok: false; errors: EnquiryErrors } {
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const errors: EnquiryErrors = {};
  const value = {} as BusinessEnquiry;
  for (const [key, max] of Object.entries(limits)) {
    const field = key as keyof typeof limits;
    const candidate = raw[field] ?? "";
    value[field] = typeof candidate === "string" ? candidate.trim() : "";
    if (
      typeof candidate !== "string" ||
      value[field].length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value[field])
    )
      errors[field] =
        `Use ${max} characters or fewer, without special control characters.`;
  }
  for (const [key, label] of [
    ["businessName", "your business name"],
    ["contactName", "your name"],
    ["email", "your email address"],
    ["sells", "what you sell"],
  ] as const) {
    if (!value[key]) errors[key] = `Tell me ${label}.`;
  }
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    errors.email = "Enter an email address such as you@yourshop.co.uk.";
  if (
    value.phone &&
    (!/^[+()\d\s.-]+$/.test(value.phone) ||
      value.phone.replace(/\D/g, "").length < 7)
  )
    errors.phone =
      "Enter a phone number with at least 7 digits, or leave it blank.";
  if (value.website) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(value.website)
          ? value.website
          : `https://${value.website}`,
      );
      if (
        !/^https?:$/.test(url.protocol) ||
        !url.hostname.includes(".") ||
        url.username ||
        url.password ||
        /\s/.test(value.website)
      )
        throw new Error();
      value.website = url.href;
    } catch {
      errors.website =
        "Enter a website such as yourshop.co.uk, or leave it blank.";
    }
  }
  if (
    value.productCount &&
    !productCounts.some((option) => option === value.productCount)
  )
    errors.productCount = "Choose a product range from the list.";
  if (
    value.channel &&
    !sellingChannels.some((option) => option === value.channel)
  )
    errors.channel = "Choose a selling channel from the list.";
  if (!enquiryIntents.some((option) => option === value.intent))
    errors.intent = "Choose a valid enquiry type.";
  if (
    !Array.isArray(raw.needs) ||
    raw.needs.length > enquiryNeeds.length ||
    raw.needs.some(
      (need) =>
        typeof need !== "string" ||
        !enquiryNeeds.some((option) => option === need),
    )
  ) {
    errors.needs = "Choose help options from the list.";
    value.needs = [];
  } else value.needs = [...new Set(raw.needs)] as string[];
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

export function enquiryDraft(value: BusinessEnquiry) {
  return [
    "Business store enquiry",
    `Request: ${value.intent}`,
    `Business: ${value.businessName}`,
    `Contact: ${value.contactName}`,
    `Email: ${value.email}`,
    `Products: ${value.sells}`,
    value.phone && `Phone: ${value.phone}`,
    value.website && `Website: ${value.website}`,
    value.social && `Social: ${value.social}`,
    value.productCount && `Product count: ${value.productCount}`,
    value.channel && `Currently selling: ${value.channel}`,
    value.needs.length && `Help with: ${value.needs.join(", ")}`,
    value.message && `Message: ${value.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}
