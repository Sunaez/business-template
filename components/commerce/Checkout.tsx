"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  LockKeyhole,
  ShoppingBag,
} from "lucide-react";
import { createLocalCheckoutGateway } from "@/lib/checkout";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "./CartProvider";

export function Checkout() {
  const { lines, subtotal, brand, clearCart, hydrated } = useCart();
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const router = useRouter();
  const standardShipping =
    subtotal >= brand.freeShippingThreshold ? 0 : brand.shipping.standardPrice;
  const shipping =
    delivery === "express" ? brand.shipping.expressPrice : standardShipping;
  const money = (price: number) =>
    formatPrice(price, brand.currency, brand.locale);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || !lines.length) return;
    setError("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const field = (name: string) => String(formData.get(name) ?? "").trim();
    submitLock.current = true;
    setSubmitting(true);
    try {
      const gateway = createLocalCheckoutGateway(
        brand,
        lines.map((line) => line.product),
        localStorage,
      );
      const session = await gateway.createSession({
        businessId: brand.businessId,
        items: lines.map((line) => ({
          productId: line.product.id,
          variantId: line.variant.id,
          quantity: line.quantity,
        })),
        email: field("email"),
        phone: field("phone"),
        shippingAddress: {
          fullName: field("fullName"),
          line1: field("address"),
          line2: field("address2"),
          city: field("city"),
          postcode: field("postcode"),
          country: field("country"),
        },
        deliveryMethod: delivery,
      });
      clearCart();
      router.push(session.redirectUrl);
    } catch (caught) {
      setError(
        caught instanceof Error &&
          caught.name !== "QuotaExceededError" &&
          caught.name !== "SecurityError"
          ? caught.message
          : "Your browser could not save this demo order. Enable browser storage and try again. Your bag has been kept.",
      );
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  if (!hydrated)
    return (
      <div className="commerce-page commerce-loading" role="status">
        Preparing checkout…
      </div>
    );
  if (!lines.length && !submitting)
    return (
      <div className="commerce-page commerce-empty">
        <ShoppingBag size={44} strokeWidth={1} />
        <h1>A good place to start.</h1>
        <p>Add a piece to your bag before continuing to checkout.</p>
        <Link href="/shop" className="button">
          Explore the collection <ArrowRight size={17} />
        </Link>
      </div>
    );

  return (
    <div className="commerce-page checkout-page">
      <div className="commerce-page-heading">
        <Link href="/cart" className="commerce-text-link">
          <ArrowLeft size={14} /> Back to your bag
        </Link>
        <h1>Make it yours.</h1>
        <p className="commerce-muted">
          A few details, and you&apos;re on your way.
        </p>
      </div>
      <div className="checkout-demo-banner">
        <LockKeyhole size={17} />
        <p>
          <strong>You&apos;re exploring a demo store.</strong> No payment is
          taken and no products will be shipped. Your demo order is saved on
          this device only.
        </p>
      </div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields">
          <section className="checkout-section">
            <h2>
              <span>01</span> Contact details
            </h2>
            <div className="checkout-field-grid">
              <label className="checkout-field checkout-field--full">
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                />
              </label>
              <label className="checkout-field checkout-field--full">
                Phone number <span>(optional)</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="For delivery updates"
                  maxLength={30}
                />
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <h2>
              <span>02</span> Delivery address
            </h2>
            <div className="checkout-field-grid">
              <label className="checkout-field checkout-field--full">
                Full name
                <input
                  name="fullName"
                  autoComplete="shipping name"
                  required
                  minLength={2}
                  maxLength={120}
                />
              </label>
              <label className="checkout-field checkout-field--full">
                Address
                <input
                  name="address"
                  autoComplete="shipping address-line1"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </label>
              <label className="checkout-field checkout-field--full">
                Apartment, suite, etc. <span>(optional)</span>
                <input
                  name="address2"
                  autoComplete="shipping address-line2"
                  maxLength={150}
                />
              </label>
              <label className="checkout-field">
                City
                <input
                  name="city"
                  autoComplete="shipping address-level2"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </label>
              <label className="checkout-field">
                Postcode
                <input
                  name="postcode"
                  autoComplete="shipping postal-code"
                  required
                  minLength={3}
                  maxLength={16}
                />
              </label>
              <label className="checkout-field checkout-field--full">
                Country
                <select
                  name="country"
                  autoComplete="shipping country"
                  defaultValue={brand.country}
                  required
                >
                  <option value={brand.country}>
                    {new Intl.DisplayNames([brand.locale], {
                      type: "region",
                    }).of(brand.country)}
                  </option>
                </select>
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <h2>
              <span>03</span> Delivery method
            </h2>
            <div className="checkout-delivery-options">
              <label
                className={`checkout-delivery${delivery === "standard" ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  checked={delivery === "standard"}
                  onChange={() => setDelivery("standard")}
                />
                <span>
                  <strong>Standard delivery</strong>
                  <small>{brand.shipping.standardLabel}</small>
                </span>
                <strong>
                  {standardShipping === 0 ? "Free" : money(standardShipping)}
                </strong>
              </label>
              <label
                className={`checkout-delivery${delivery === "express" ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="express"
                  checked={delivery === "express"}
                  onChange={() => setDelivery("express")}
                />
                <span>
                  <strong>Express delivery</strong>
                  <small>{brand.shipping.expressLabel}</small>
                </span>
                <strong>{money(brand.shipping.expressPrice)}</strong>
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <h2>
              <span>04</span> Payment
            </h2>
            <div className="checkout-payment-placeholder">
              <CreditCard size={24} strokeWidth={1.3} />
              <div>
                <h3>A preview of a seamless checkout.</h3>
                <p>
                  Card payments will be available when this store launches. No
                  payment details are needed for a demo order.
                </p>
              </div>
            </div>
            <div className="checkout-wallets">
              <button
                type="button"
                disabled
                aria-label="Apple Pay — available at launch"
              >
                Apple Pay <span>Coming soon</span>
              </button>
              <button
                type="button"
                disabled
                aria-label="Google Pay — available at launch"
              >
                Google Pay <span>Coming soon</span>
              </button>
            </div>
          </section>
        </div>
        <aside className="checkout-summary">
          <h2>Your order</h2>
          <div className="checkout-summary__products">
            {lines.map((line) => (
              <div className="checkout-summary__product" key={line.key}>
                <div className="checkout-summary__image">
                  <Image
                    src={(line.variant.image ?? line.product.images[0]).src}
                    alt={(line.variant.image ?? line.product.images[0]).alt}
                    fill
                    sizes="70px"
                  />
                  <span>{line.quantity}</span>
                </div>
                <div>
                  <h3>{line.product.name}</h3>
                  <p>
                    {Object.values(line.variant.selectedOptions).join(" / ")}
                  </p>
                </div>
                <strong>{money(line.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Discount</span>
              <span>{money(0)}</span>
            </div>
            <div className="cart-summary-row">
              <span>
                {delivery === "express"
                  ? "Express delivery"
                  : "Standard delivery"}
              </span>
              <span>{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>
              Total <small>{brand.currency}</small>
            </span>
            <strong>{money(subtotal + shipping)}</strong>
          </div>
          <p className="checkout-terms">
            By saving this demo order, you acknowledge our{" "}
            <Link href="/terms">terms</Link> and{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
          {error && (
            <p role="alert" className="commerce-error">
              {error}
            </p>
          )}
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Saving your order…" : "Place demo order"}
            <ArrowRight size={17} />
          </button>
          <p className="cart-demo-note">
            <LockKeyhole size={12} /> No payment required
          </p>
          <p className="checkout-discount-note">
            Discount codes and live payments are not connected in this preview.
          </p>
        </aside>
      </form>
    </div>
  );
}
