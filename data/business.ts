/** Service identity and commercial copy are independent of the demo shop brand. */
export const businessService = {
  name: "Stores, managed.",
  enquiryPath: "/for-business/start",
  demoPath: "/shop",
  headline: "Take your shop online.\nI’ll handle the hard part.",
  description:
    "I build and look after websites for independent businesses. Whether you need a place to show your products or a shop that takes orders, you deal directly with me, from the first conversation onwards.",
  contractNote:
    "I’ll agree the scope, support hours, contract length and cancellation terms with you before you commit.",
};

export interface ManagedPlan {
  id: "showcase" | "managed-store";
  name: string;
  price: string;
  period: string;
  description: string;
  includes: string[];
  footnote: string;
  costNote: string;
  cta: string;
}

/** Example starting prices, not confirmed commercial terms or checkout prices. */
export const managedPlans: ManagedPlan[] = [
  {
    id: "showcase",
    name: "Product showcase",
    price: "£399",
    period: "one-off build",
    description:
      "For a shop that wants people to browse its range, get in touch or visit in person.",
    costNote:
      "Hosting & domain costs are separate. Optional care from £19/month.",
    includes: [
      "Your branding, mobile layout & product listings",
      "An agreed starting catalogue added by me",
      "Contact links, opening hours & directions",
      "Basic search-engine setup & domain connection",
    ],
    footnote:
      "A simpler website: no online payment, live stock or management dashboard. I make product changes for you; edits are quoted separately or included within an agreed care allowance.",
    cta: "Ask about a showcase",
  },
  {
    id: "managed-store",
    name: "Managed online shop",
    price: "£99",
    period: "/ month",
    description:
      "For a business that wants customers to order and pay online, with me handling the technical side.",
    costNote:
      "Setup quoted separately, based on your products and integrations.",
    includes: [
      "Branded store, sizes, colours & collections",
      "Payment, delivery & order-management setup",
      "Hosting, maintenance & technical support from me",
      "Google product-feed & analytics setup assistance",
    ],
    footnote:
      "The monthly service pays for ongoing care. Catalogue changes, extra integrations and marketing are scoped separately. Payment-processing fees and domain costs are additional.",
    cta: "Ask about an online shop",
  },
];

export const priceExplanations = [
  {
    title: "The build gets you ready",
    description:
      "You pay for my time to shape the design, prepare the agreed products, connect the services you need and test the result. A simple catalogue needs less setup than a shop that takes payments.",
  },
  {
    title: "The monthly fee keeps it cared for",
    description:
      "For a managed shop, I handle hosting, technical maintenance and support. For a showcase, care is optional: from £19/month for hosting and agreed maintenance. Content edits and backup arrangements are defined in the quote.",
  },
  {
    title: "The quote shows the full cost",
    description:
      "I’ll set out the initial cost, recurring charges, included work, applicable VAT and any third-party fees. Advertising, extra product uploads and new features are only added when you agree to them.",
  },
];

export const onboardingSteps = [
  {
    title: "Work out what is worth building",
    description:
      "Tell me what you sell, your budget and how customers find you. Together, you and I choose a sensible goal: enquiries and shop visits for a showcase, or profitable orders for an online shop.",
  },
  {
    title: "I build it and check the details",
    description:
      "I handle the design and agreed setup. You review it before launch. I test mobile browsing, contact links and, for an online shop, payments, delivery and the order journey.",
  },
  {
    title: "Review what is working",
    description:
      "I agree a follow-up review with you and explain the available figures. If results are weak, I help identify the issue and suggest the next step. Ongoing reporting, marketing and extra changes are scoped separately.",
  },
];

export const businessFaqs = [
  [
    "Do I need technical knowledge?",
    "No. I handle the setup and explain the everyday tasks. You provide your business information, products and decisions. If you need help, you contact me directly; I’ll agree support hours and response expectations with you.",
  ],
  [
    "Can I keep my domain, branding and existing products?",
    "Yes. I can work with your logo, colours and domain. If you already have a website, I’ll review the platform and product export before quoting for migration or changes. You approve any account or domain changes first.",
  ],
  [
    "Can I update products and prices myself?",
    "A showcase has no management dashboard: I make edits for you, charged separately or within an agreed care allowance. For a managed shop, I’ll agree the editing tools you need. The current demo supports sample stock edits; adding products, editing prices and shared live stock still need production integration.",
  ],
  [
    "How do online orders and payments work?",
    "For a connected shop, your customer pays online, a confirmed order appears in your dashboard and you fulfil it. Card payments and Apple Pay or Google Pay depend on the chosen provider and device. The demo uses sample orders and takes no money; live payments, stock reservations and authenticated order management must be connected before launch.",
  ],
  [
    "Will my products appear on Google?",
    "I include basic search-engine setup and can help with a managed shop’s product feed and Merchant Center configuration. Google decides eligibility and approval. The demo has a feed preview, not live listings. Search position, traffic and sales are not guaranteed, and paid ads require a separate budget.",
  ],
  [
    "What if the website doesn’t bring in sales?",
    "I’ll help you look at where the difficulty is: reaching people, getting enquiries or turning visits into orders. Demand, pricing, photography, stock and promotion all matter. Maintenance fees pay for the agreed work and care, not guaranteed revenue; they continue under the agreed contract even in a quiet month. Reviews and any additional work are agreed in advance.",
  ],
  [
    "Can I start small or get help with an existing website?",
    "Yes. A showcase can be a sensible first step. Adding checkout or a dashboard later is a separate project, quoted before work starts. If you already have a site, tell me what you need fixed or managed and I’ll quote for that scope after checking compatibility.",
  ],
  [
    "What am I committing to?",
    "The prices are indicative starting points. I’ll give you a written proposal covering setup costs, monthly charges, support, content-change allowances and any commission before you decide. Contract length, cancellation terms, backup arrangements and any ongoing reviews are agreed there. An initial conversation is free.",
  ],
];

export interface BusinessCaseStudy {
  businessName: string;
  industry: string;
  problem: string;
  solution: string;
  result: string;
  screenshot?: { src: string; alt: string };
  metrics?: { label: string; value: string }[];
}
/** Publish only approved real client stories. Empty means no section is rendered. */
export const businessCaseStudies: BusinessCaseStudy[] = [];
