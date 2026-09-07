import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Brand } from "@/types";

type HeroProps = { hero: Brand["hero"] };
function HeroCopy({ hero }: HeroProps) {
  return (
    <div className="hero-copy">
      <p className="eyebrow">
        <span className="status-dot" />
        {hero.eyebrow}
      </p>
      <h1>{hero.title}</h1>
      <p className="hero-description">{hero.description}</p>
      <div className="hero-actions">
        <Link href={hero.primaryCta.href} className="button button-light">
          {hero.primaryCta.label}
          <ArrowUpRight size={18} />
        </Link>
        <Link className="hero-secondary" href={hero.secondaryCta.href}>
          {hero.secondaryCta.label}
          <ArrowRightSmall />
        </Link>
      </div>
    </div>
  );
}
function ArrowRightSmall() {
  return <ArrowUpRight size={15} />;
}
export function HeroFullBleed({ hero }: HeroProps) {
  return (
    <section className="hero hero-full-bleed">
      <Image
        className="hero-image"
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        priority
        sizes="100vw"
      />
      <div className="hero-shade" />
      <HeroCopy hero={hero} />
      <div className="hero-foot">
        <span>{hero.issue}</span>
        <a href="#essentials" aria-label="Explore the essentials">
          <ArrowDown size={16} />
        </a>
        <span>{hero.caption}</span>
      </div>
    </section>
  );
}
export function HeroSplit({ hero }: HeroProps) {
  return (
    <section className="hero hero-split">
      <HeroCopy hero={hero} />
      <div className="hero-split-image">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          priority
          sizes="(max-width: 760px) 100vw, 55vw"
        />
      </div>
    </section>
  );
}
export function HeroEditorial({ hero }: HeroProps) {
  return (
    <section className="hero hero-editorial">
      <div className="hero-editorial-label">
        <span>{hero.eyebrow}</span>
        <span>{hero.issue}</span>
      </div>
      <HeroCopy hero={hero} />
      <div className="hero-editorial-image">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          priority
          sizes="(max-width: 760px) 100vw, 60vw"
        />
      </div>
    </section>
  );
}
export function Hero({ brand }: { brand: Brand }) {
  const Component = {
    "full-bleed": HeroFullBleed,
    split: HeroSplit,
    editorial: HeroEditorial,
  }[brand.layout.hero];
  return <Component hero={brand.hero} />;
}
