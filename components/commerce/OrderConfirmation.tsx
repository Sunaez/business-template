"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, FileText } from "lucide-react";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "./CartProvider";
import { demoOrderStorageKey } from "@/lib/checkout";
import { useBrowserReady } from "./useBrowserReady";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const serverSnapshot = () => null;

function isDemoOrder(value: unknown, businessId: string): value is Order {
  if (!value || typeof value !== "object") return false;
  const order = value as Order;
  return (
    order.businessId === businessId &&
    order.status === "demo" &&
    typeof order.orderNumber === "string" &&
    typeof order.total === "number" &&
    Number.isFinite(order.total) &&
    typeof order.subtotal === "number" &&
    typeof order.shipping === "number" &&
    !!order.customer &&
    typeof order.customer.email === "string" &&
    !!order.shippingAddress &&
    typeof order.shippingAddress.fullName === "string" &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every(
      (item) =>
        typeof item.name === "string" &&
        typeof item.quantity === "number" &&
        typeof item.unitPrice === "number" &&
        !!item.image &&
        typeof item.image.src === "string" &&
        !!item.selectedOptions,
    )
  );
}

export function OrderConfirmation() {
  const { brand } = useCart();
  const [deleted, setDeleted] = useState(false);
  const loaded = useBrowserReady();
  const readOrder = useCallback(() => {
    try {
      return localStorage.getItem(demoOrderStorageKey(brand.businessId));
    } catch {
      return null;
    }
  }, [brand.businessId]);
  const stored = useSyncExternalStore(subscribe, readOrder, serverSnapshot);
  const order = useMemo(() => {
    if (deleted) return null;
    try {
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      return isDemoOrder(parsed, brand.businessId) ? parsed : null;
    } catch {
      return null;
    }
  }, [stored, brand.businessId, deleted]);
  if (!loaded)
    return (
      <div className="commerce-page commerce-loading" role="status">
        Loading your demo order…
      </div>
    );
  if (!order)
    return (
      <div className="commerce-page commerce-empty">
        <FileText size={42} strokeWidth={1} />
        <h1>No demo order saved yet.</h1>
        <p>Complete the demo checkout to see your order summary here.</p>
        <Link href="/shop" className="button">
          Explore the collection <ArrowRight size={17} />
        </Link>
      </div>
    );
  const money = (price: number) =>
    formatPrice(price, order.currency, brand.locale);
  return (
    <div className="commerce-page order-confirmation">
      <div className="order-confirmation__heading">
        <span className="order-confirmation__check">
          <Check size={27} strokeWidth={1.4} />
        </span>
        <p className="eyebrow">A preview of what&apos;s to come</p>
        <h1>Your demo order is saved.</h1>
        <p>
          Thanks for exploring {brand.name}. No payment was taken, and this
          order will not be fulfilled.
        </p>
        <span className="order-number">{order.orderNumber}</span>
      </div>
      <div className="order-confirmation__details">
        <section>
          <h2>Order summary</h2>
          {order.items.map((item) => (
            <div
              className="checkout-summary__product"
              key={`${item.productId}-${item.variantId}`}
            >
              <div className="checkout-summary__image">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="70px"
                />
                <span>{item.quantity}</span>
              </div>
              <div>
                <h3>{item.name}</h3>
                <p>{Object.values(item.selectedOptions).join(" / ")}</p>
              </div>
              <strong>{money(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Discount</span>
              <span>{money(order.discount)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery</span>
              <span>
                {order.shipping === 0 ? "Free" : money(order.shipping)}
              </span>
            </div>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Demo total</span>
            <strong>{money(order.total)}</strong>
          </div>
          <p className="commerce-muted">Amount charged: {money(0)}</p>
        </section>
        <section className="order-confirmation__address">
          <h2>Delivery details</h2>
          <address>
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            <br />
            {order.shippingAddress.line2 && (
              <>
                {order.shippingAddress.line2}
                <br />
              </>
            )}
            {order.shippingAddress.city}, {order.shippingAddress.postcode}
            <br />
            {order.shippingAddress.country}
          </address>
          <p>{order.customer.email}</p>
          <h3>
            {order.deliveryMethod === "express"
              ? "Express delivery"
              : "Standard delivery"}
          </h3>
          <p>This is a saved preview. No confirmation email has been sent.</p>
          <button
            className="commerce-text-link"
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(demoOrderStorageKey(brand.businessId));
                setDeleted(true);
              } catch {
                /* Keep the order visible when browser storage cannot be changed. */
              }
            }}
          >
            Delete this demo order
          </button>
        </section>
      </div>
      <div className="order-confirmation__continue">
        <Link href="/shop" className="button">
          Back to the collection <ArrowRight size={17} />
        </Link>
        <Link href="/contact" className="commerce-text-link">
          Need a hand? Get in touch.
        </Link>
      </div>
    </div>
  );
}
