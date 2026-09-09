"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { demoAdmin } from "@/data/accounts";
import { ArrowLeft, CircleHelp, Repeat2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useAccountCustomer } from "../AccountProviders";
export function AccountShell<Section extends string>({
  role,
  active,
  onNavigate,
  navigation,
  title,
  description,
  action,
  children,
}: {
  role: "customer" | "admin";
  active: Section;
  onNavigate: (section: Section) => void;
  navigation: {
    id: Section;
    label: string;
    icon: LucideIcon;
    count?: number;
  }[];
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useAccountCustomer();
  const { brand } = useStorefront();
  const person = role === "customer" ? profile : demoAdmin;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousSection = useRef(active);
  useEffect(() => {
    if (previousSection.current === active) return;
    previousSection.current = active;
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    if (heading.getBoundingClientRect().top < 100)
      heading.scrollIntoView({ block: "start", behavior: "instant" });
  }, [active]);
  return (
    <div className="account-workspace container">
      <div className="account-demo-bar">
        <span>
          <span className="account-demo-tag">Demo preview</span>
          <span className="account-demo-bar__copy">
            Sample data. Explore freely; changes reset on refresh.
          </span>
        </span>
        <Link href="/account">
          <Repeat2 size={14} aria-hidden="true" />
          Switch account
        </Link>
      </div>
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-identity">
            <span className="account-avatar">{person.initials}</span>
            <div>
              <strong>{person.name}</strong>
              <span>
                {role === "admin"
                  ? "Store administrator"
                  : "The everyday, made yours"}
              </span>
            </div>
          </div>
          <p className="eyebrow account-sidebar__label">
            {role === "admin" ? "Manage your store" : "My account"}
          </p>
          <label className="account-mobile-navigation">
            <span className="eyebrow">
              {role === "admin" ? "Manage your store" : "My account"}
            </span>
            <select
              aria-label="Account section"
              value={active}
              onChange={(event) => {
                const item = navigation.find(
                  (item) => item.id === event.target.value,
                );
                if (item) onNavigate(item.id);
              }}
            >
              {navigation.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.count !== undefined ? " (" + item.count + ")" : ""}
                </option>
              ))}
            </select>
          </label>
          <nav
            className="account-nav"
            aria-label={
              role === "admin" ? "Admin sections" : "Customer sections"
            }
          >
            {navigation.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                aria-current={active === id ? "page" : undefined}
                onClick={() => onNavigate(id)}
              >
                <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
                {count !== undefined && <small>{count}</small>}
              </button>
            ))}
          </nav>
          <div className="account-sidebar__bottom">
            <Link href="/shop">
              <ArrowLeft size={15} aria-hidden="true" />
              {role === "admin" ? "View storefront" : "Continue shopping"}
            </Link>
            <Link href="/contact">
              <CircleHelp size={15} aria-hidden="true" />A little help
            </Link>
            <p>{brand.tagline}</p>
          </div>
        </aside>
        <div className="account-main">
          <header className="account-page-heading">
            <div>
              <p className="eyebrow">
                {role === "admin"
                  ? `${brand.name} / Store admin`
                  : "Good things, all in one place"}
              </p>
              <h1 ref={headingRef} tabIndex={-1}>
                {title}
              </h1>
              <p>{description}</p>
            </div>
            {action}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
