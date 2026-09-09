"use client";

import { useCart } from "@/components/commerce/CartProvider";
import { OverlayLoading } from "@/components/ui/OverlayLoading";
import type { Brand } from "@/types";
import { ArrowRight, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const MobileMenu = dynamic(
  () => import("./header/MobileMenu").then((module) => module.MobileMenu),
  { loading: OverlayLoading },
);
const SearchDrawer = dynamic(
  () => import("./header/SearchDrawer").then((module) => module.SearchDrawer),
  { loading: OverlayLoading },
);

interface HeaderProps {
  brand: Brand;
}
const subscribeToScroll = (callback: () => void) => {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
};
const scrollSnapshot = () => window.scrollY > 60;
const serverScrollSnapshot = () => false;

function HeaderBase({
  brand,
  variant,
}: HeaderProps & { variant: Brand["layout"]["header"] }) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      {searchOpen && <SearchDrawer onClose={() => setSearchOpen(false)} />}
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
