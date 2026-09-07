import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";
import type { Brand, Collection } from "@/types";

interface FooterProps {
  brand: Brand;
  collections: Collection[];
}

export function FooterMinimal({ brand }: FooterProps) {
  return (
    <footer className="site-footer footer-minimal">
      <Link href="/" className="wordmark">
        {brand.wordmark}
        {brand.wordmarkSuffix && <sup>{brand.wordmarkSuffix}</sup>}
      </Link>
      <p>{brand.tagline}</p>
      <nav aria-label="Footer">
        {brand.footerCopy.helpLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <FooterBottom brand={brand} />
    </footer>
  );
}
function FooterBottom({ brand }: { brand: Brand }) {
  return (
    <div className="footer-bottom">
      <span>
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </span>
      <div>
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/terms">Terms & conditions</Link>
      </div>
      <span className="footer-region">
        <Globe2 size={14} />
        {new Intl.DisplayNames([brand.locale], { type: "region" }).of(
          brand.country,
        )}{" "}
        · {brand.currency}
      </span>
    </div>
  );
}
export function FooterExpanded({ brand, collections }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-intro">
          <Link href="/" className="wordmark">
            {brand.wordmark}
            {brand.wordmarkSuffix && <sup>{brand.wordmarkSuffix}</sup>}
          </Link>
          <p>
            {brand.tagline}
            <br />
            {brand.description}
          </p>
          <div className="social-links">
            {brand.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Shop footer navigation">
          <h3>Explore</h3>
          <Link href="/shop">Shop all</Link>
          {collections
            .filter((c) => brand.footerCopy.collectionSlugs.includes(c.slug))
            .map((c) => (
              <Link href={`/collections/${c.slug}`} key={c.id}>
                {c.title}
              </Link>
            ))}
        </nav>
        <nav aria-label="Customer care">
          <h3>Here to help</h3>
          {brand.footerCopy.helpLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="footer-brand-note">
          <h3>{brand.footerCopy.noteTitle}</h3>
          <p>{brand.footerCopy.noteDescription}</p>
          <Link className="text-link" href="/for-business">
            {brand.footerCopy.noteLinkLabel}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="footer-large-wordmark" aria-hidden="true">
        {brand.wordmark}
        {brand.wordmarkSuffix && <sup>{brand.wordmarkSuffix}</sup>}
      </div>
      <FooterBottom brand={brand} />
    </footer>
  );
}
export function Footer(props: FooterProps) {
  return props.brand.layout.footer === "minimal" ? (
    <FooterMinimal {...props} />
  ) : (
    <FooterExpanded {...props} />
  );
}
