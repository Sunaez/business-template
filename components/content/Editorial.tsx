import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand, NavigationLink, ProductImage } from "@/types";
import "./content.css";

export function BrandStorySplit({
  story,
  brandName,
  cta = { label: "Our story", href: "/about" },
  reverse = false,
}: {
  story: Brand["story"];
  brandName?: string;
  cta?: NavigationLink;
  reverse?: boolean;
}) {
  return (
    <section className={`story-split${reverse ? " story-split--reverse" : ""}`}>
      <div className="story-split__image">
        <Image
          src={story.image.src}
          alt={story.image.alt}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
        />
        {brandName && (
          <span className="story-split__image-caption">
            {brandName} / {story.imageCaption}
          </span>
        )}
      </div>
      <div className="story-split__copy">
        <p className="eyebrow">{story.eyebrow}</p>
        <h2>{story.title}</h2>
        <p className="story-split__description">{story.description}</p>
        <Link href={cta.href} className="editorial-text-link">
          {cta.label}
          <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function CampaignFeature({ campaign }: { campaign: Brand["campaign"] }) {
  return (
    <section className="campaign-feature">
      <Image
        src={campaign.image.src}
        alt={campaign.image.alt}
        fill
        sizes="100vw"
      />
      <div className="campaign-feature__shade" />
      <div className="campaign-feature__copy container">
        <p className="eyebrow">{campaign.eyebrow}</p>
        <h2>{campaign.title}</h2>
        <p>{campaign.description}</p>
        <Link
          href={campaign.cta.href}
          className="button campaign-feature__button"
        >
          {campaign.cta.label}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function QuoteSection({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <section className="quote-section container">
      <span className="quote-section__mark" aria-hidden="true">
        “
      </span>
      <blockquote>{quote}</blockquote>
      {attribution && <p>{attribution}</p>}
    </section>
  );
}

export function FullWidthImageSection({
  image,
  caption,
}: {
  image: ProductImage;
  caption?: string;
}) {
  return (
    <figure className="full-width-image">
      <div>
        <Image src={image.src} alt={image.alt} fill sizes="100vw" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function EditorialImageGrid({
  images,
  title,
}: {
  images: ProductImage[];
  title?: string;
}) {
  return (
    <section className="editorial-image-section container">
      {title && <h2>{title}</h2>}
      <div className="editorial-image-grid">
        {images.map((item, index) => (
          <figure key={`${item.src}-${index}`}>
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 46vw, 24vw"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
