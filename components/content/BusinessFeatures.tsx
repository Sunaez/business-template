import Link from "next/link";
import {
  ArrowUpRight,
  PanelsTopLeft,
  PackageCheck,
  Search,
  Smartphone,
  SlidersHorizontal,
  HeartHandshake,
} from "lucide-react";
import type { Brand } from "@/types";
import "./business.css";

const icons = [
  PanelsTopLeft,
  PackageCheck,
  Search,
  Smartphone,
  SlidersHorizontal,
  HeartHandshake,
];

export function BusinessFeatures({
  brand,
  fullPage = false,
}: {
  brand: Brand;
  fullPage?: boolean;
}) {
  const copy = brand.businessFeatures;
  const Heading = fullPage ? "h1" : "h2";
  const FeatureHeading = fullPage ? "h2" : "h3";
  return (
    <section
      className={`business-feature ${fullPage ? "business-feature--page" : ""}`}
      aria-labelledby="business-heading"
    >
      <div className="business-feature__intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <Heading id="business-heading">{copy.title}</Heading>
        <p className="business-feature__description">{copy.description}</p>
        <Link
          className="business-feature__cta"
          href={fullPage ? copy.cta.href : "/for-business"}
        >
          {fullPage ? copy.cta.label : "Explore what we offer"}
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
        <div className="business-feature__signature" aria-hidden="true">
          <span>YOUR BRAND</span>
          <span>YOUR AMBITION</span>
          <span>YOUR STORE</span>
        </div>
      </div>
      <div className="business-feature__list">
        {copy.features
          .slice(0, fullPage ? undefined : 3)
          .map((feature, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article className="business-feature__item" key={feature.title}>
                <div className="business-feature__number">
                  <span>0{index + 1}</span>
                  <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
                </div>
                <div>
                  <FeatureHeading className="business-feature__item-title">
                    {feature.title}
                  </FeatureHeading>
                  <p>{feature.description}</p>
                  {fullPage && (
                    <p className="business-feature__detail">{feature.detail}</p>
                  )}
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
