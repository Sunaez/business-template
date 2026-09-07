import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getBrandConfig } from "@/lib/catalog";
import { BusinessFeatures } from "@/components/content/BusinessFeatures";

export const metadata: Metadata = {
  title: "Websites for independent businesses",
  description:
    "A personalised ecommerce website, online order management integrations and Google Shopping product feeds. Build an online presence around your business.",
};

export default async function BusinessPage() {
  const brand = await getBrandConfig();
  const copy = brand.businessFeatures;
  return (
    <>
      <BusinessFeatures brand={brand} fullPage />
      <section className="business-closing">
        <p className="eyebrow">LET’S MAKE IT HAPPEN</p>
        <h2>{copy.closingTitle}</h2>
        <p>{copy.closingDescription}</p>
        <Link href={copy.cta.href} className="button">
          {copy.cta.label}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
