"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import type { Brand, Collection, Product } from "@/types";
import { useCart } from "@/components/commerce/CartProvider";
import { Drawer } from "@/components/ui/Drawer";
import { formatPrice } from "@/lib/pricing";
import { filterProducts } from "@/lib/catalog-filter";

interface HeaderProps {
  brand: Brand;
  collections: Collection[];
  products: Product[];
}
const subscribeToScroll = (callback: () => void) => {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
};
const scrollSnapshot = () => window.scrollY > 60;
const serverScrollSnapshot = () => false;

function HeaderBase({
  brand,
  collections,
  products,
  variant,
}: HeaderProps & { variant: Brand["layout"]["header"] }) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = query.trim()
    ? filterProducts(products, { query }).slice(0, 4)
    : [];
  const transparent =
    brand.layout.transparentHeader &&
    brand.layout.hero === "full-bleed" &&
    pathname === "/";
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    scrollSnapshot,
    serverScrollSnapshot,
  );

  return (
    <>
      {brand.announcement.enabled && (
        <div className="announcement">
          <span>{brand.announcement.aside}</span>
          <Link href={brand.announcement.href || "/shipping-returns"}>
            {brand.announcement.text}
            <ArrowRight size={12} />
          </Link>
          <span>
            {brand.country} / {brand.currency}
          </span>
        </div>
      )}
      <header
        className={`site-header header-${variant}${brand.layout.stickyHeader ? " header-sticky" : ""}${transparent ? " header-transparent" : ""}${transparent && scrolled ? " header-scrolled" : ""}`}
      >
        <div className="header-inner">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="wordmark" aria-label={`${brand.name} home`}>
            {brand.logo ? (
              <Image
                src={brand.logo.src}
                alt={brand.name}
                width={190}
                height={36}
              />
            ) : (
              <>
                {brand.wordmark}
                {brand.wordmarkSuffix && <sup>{brand.wordmarkSuffix}</sup>}
              </>
            )}
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            {brand.navigation.map((link) => (
              <Link
                className={pathname === link.href ? "active" : ""}
                key={link.href}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button account-link"
              href="/account"
              aria-label="Your account"
            >
              <UserRound size={20} />
            </Link>
            <button
              className="bag-button"
              aria-label={`Open shopping bag, ${count} items`}
              onClick={openCart}
            >
              <ShoppingBag size={20} />
              <span className="bag-label">Bag</span>
              <span className="bag-count">{count}</span>
            </button>
          </div>
        </div>
        {variant === "editorial" && (
          <div className="editorial-header-line">
            <span>{brand.tagline}</span>
            <span>{brand.headerCopy.editorialNote}</span>
          </div>
        )}
      </header>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Explore"
        side="left"
      >
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {brand.navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              <ArrowRight size={20} />
            </Link>
          ))}
          <div className="mobile-nav-collections">
            <span className="eyebrow">The collections</span>
            {collections
              .filter((c) => c.featured)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {c.title}
                </Link>
              ))}
          </div>
          <Link href="/account" onClick={() => setMenuOpen(false)}>
            My account
            <UserRound size={19} />
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Get in touch
            <ArrowRight size={19} />
          </Link>
        </nav>
      </Drawer>
      <Drawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title={brand.headerCopy.searchTitle}
      >
        <div className="header-search-body">
          <form
            action="/search"
            className="header-search-form"
            onSubmit={() => setSearchOpen(false)}
          >
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <Search size={20} />
            <input
              id="header-search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={brand.headerCopy.searchPlaceholder}
              autoComplete="off"
            />
            <button
              aria-label="Submit search"
              type="submit"
              className="icon-button"
            >
              <ArrowRight size={21} />
            </button>
          </form>
          {query ? (
            <div className="predictive-results" aria-live="polite">
              <p className="eyebrow">
                {matches.length
                  ? brand.headerCopy.searchResultsTitle
                  : "No matches just yet"}
              </p>
              {matches.map((product) => (
                <Link
                  onClick={() => setSearchOpen(false)}
                  href={`/product/${product.slug}`}
                  key={product.id}
                  className="predictive-product"
                >
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt}
                    width={72}
                    height={88}
                  />
                  <div>
                    <span>{product.name}</span>
                    <small>
                      {formatPrice(
                        product.price,
                        product.currency,
                        brand.locale,
                      )}
                    </small>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ))}
              {!matches.length && (
                <p className="muted">
                  {brand.headerCopy.searchEmptyDescription}
                </p>
              )}
              <Link
                onClick={() => setSearchOpen(false)}
                className="button button-outline"
                href={`/search?q=${encodeURIComponent(query)}`}
              >
                View all results
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="header-search-suggestions">
              <p className="eyebrow">
                {brand.headerCopy.searchSuggestionsTitle}
              </p>
              {collections.slice(0, 5).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  onClick={() => setSearchOpen(false)}
                >
                  {collection.title}
                  <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          )}
          {query && (
            <button
              className="text-link clear-search"
              onClick={() => setQuery("")}
            >
              <X size={14} /> Clear search
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}

export function HeaderMinimal(props: HeaderProps) {
  return <HeaderBase {...props} variant="minimal" />;
}
export function HeaderCentered(props: HeaderProps) {
  return <HeaderBase {...props} variant="centered" />;
}
export function HeaderEditorial(props: HeaderProps) {
  return <HeaderBase {...props} variant="editorial" />;
}
export function Header(props: HeaderProps) {
  const Component = {
    minimal: HeaderMinimal,
    centered: HeaderCentered,
    editorial: HeaderEditorial,
  }[props.brand.layout.header];
  return <Component {...props} />;
}
