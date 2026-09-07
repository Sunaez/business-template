"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "./CartProvider";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartPage() {
  const { lines, count, subtotal, brand, hydrated, persistenceError } =
    useCart();
  const [discountMessage, setDiscountMessage] = useState("");
  const shipping =
    subtotal >= brand.freeShippingThreshold ? 0 : brand.shipping.standardPrice;
  const money = (price: number) =>
    formatPrice(price, brand.currency, brand.locale);
  return (
    <div className="commerce-page cart-page">
      <div className="commerce-page-heading">
        <p className="eyebrow">The good things, together</p>
        <h1>
          Your bag<span>{hydrated ? ` (${count})` : ""}</span>
        </h1>
        <Link href="/shop" className="commerce-text-link">
          <ArrowLeft size={15} /> Continue shopping
        </Link>
      </div>
      {!hydrated ? (
        <p className="commerce-loading" role="status">
          Loading your bag…
        </p>
      ) : lines.length === 0 ? (
        <div className="commerce-empty">
          <ShoppingBag size={44} strokeWidth={1} />
          <h2>Your next everyday essential is waiting.</h2>
          <p>
            There&apos;s nothing in your bag yet. Make a little room for
            something good.
          </p>
          <Link href="/shop" className="button">
            Explore the collection <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="cart-page__layout">
          <div className="cart-page__items">
            <div className="cart-page__labels">
              <span>Product</span>
              <span>Total</span>
            </div>
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} />
            ))}
            {persistenceError && (
              <p className="commerce-notice">
                Browser storage is unavailable. Your bag is saved for this visit
                only.
              </p>
            )}
            <p className="cart-considered-note">
              Considered choices. Everyday favourites. Made to be worn on
              repeat.
            </p>
          </div>
          <aside className="cart-order-summary">
            <h2>Order summary</h2>
            <FreeShippingProgress />
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Standard delivery estimate</span>
                <span>
                  {shipping === 0 ? "Complimentary" : money(shipping)}
                </span>
              </div>
              <div className="cart-summary-row">
                <span>Discount</span>
                <span>{money(0)}</span>
              </div>
            </div>
            <details className="cart-discount">
              <summary>Have a discount code?</summary>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setDiscountMessage(
                    "Discount codes will be available when the store launches. No discount has been applied.",
                  );
                }}
              >
                <label htmlFor="discount-code" className="sr-only">
                  Discount code
                </label>
                <input
                  id="discount-code"
                  name="discount"
                  placeholder="Enter code"
                  required
                  autoComplete="off"
                />
                <button type="submit">Apply</button>
              </form>
              <p role="status">
                {discountMessage || "Demo store — codes are not connected yet."}
              </p>
            </details>
            <div className="cart-summary-row cart-summary-total">
              <span>Estimated total</span>
              <strong>{money(subtotal + shipping)}</strong>
            </div>
            <Link href="/checkout" className="button">
              Continue to checkout <ArrowRight size={17} />
            </Link>
            <p className="cart-demo-note">Demo checkout · no payment taken</p>
            <p className="cart-summary-help">
              Need a hand? <Link href="/contact">Get in touch.</Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
