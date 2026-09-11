import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import {
  businessService,
  type BusinessCaseStudy,
  type ManagedPlan,
} from "@/data/business";

export function BusinessCta({
  children = "Get my store online",
  intent = "store",
  secondary = false,
  plan,
}: {
  children?: React.ReactNode;
  intent?: "store" | "preview" | "consultation";
  secondary?: boolean;
  plan?: ManagedPlan["id"];
}) {
  return (
    <Link
      className={`biz-button${secondary ? " biz-button--outline" : ""}`}
      href={`${businessService.enquiryPath}?intent=${intent}${plan ? `&plan=${plan}` : ""}`}
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="biz-checklist">
      {items.map((item) => (
        <li key={item}>
          <Check size={17} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingCard({ plan }: { plan: ManagedPlan }) {
  return (
    <article className={`biz-price-card biz-price-card--${plan.id}`}>
      <h3>{plan.name}</h3>
      <p className="biz-price">
        <span>From</span> {plan.price}
        <small>{plan.period}</small>
      </p>
      <p className="biz-plan-cost">{plan.costNote}</p>
      <p>{plan.description}</p>
      <CheckList items={plan.includes} />
      <BusinessCta intent="consultation" plan={plan.id}>
        {plan.cta}
      </BusinessCta>
      <p className="biz-small">{plan.footnote}</p>
    </article>
  );
}

export function CaseStudy({ study }: { study: BusinessCaseStudy }) {
  return (
    <article className="biz-case-study">
      {study.screenshot && (
        <Image
          src={study.screenshot.src}
          alt={study.screenshot.alt}
          width={900}
          height={600}
        />
      )}
      <p className="eyebrow">{study.industry}</p>
      <h3>{study.businessName}</h3>
      <dl>
        {[
          ["The challenge", study.problem],
          ["What I did", study.solution],
          ["The result", study.result],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {study.metrics && (
        <ul>
          {study.metrics.map((metric) => (
            <li key={metric.label}>
              <strong>{metric.value}</strong> {metric.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
