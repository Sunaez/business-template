"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "./CartProvider";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartDrawer() {
  const { isOpen, closeCart, lines, count, subtotal, brand, persistenceError } =
    useCart();
  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title={`Your bag (${count})`}
      className="cart-drawer"
    >
      {lines.length === 0 ? (
        <div className="commerce-empty commerce-empty--drawer">
          <ShoppingBag size={37} strokeWidth={1} />
          <h3>A little room for something good.</h3>
          <p>
            Your bag is empty. Find the pieces you&apos;ll reach for every day.
          </p>
          <Link href="/shop" className="button" onClick={closeCart}>
            Explore the collection <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-drawer__progress">
            <FreeShippingProgress />
          </div>
          <div className="cart-drawer__lines">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} compact />
            ))}
          </div>
          <div className="cart-drawer__footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>
                {formatPrice(subtotal, brand.currency, brand.locale)}
              </strong>
            </div>
            <p className="commerce-muted">Delivery calculated at checkout.</p>
            {persistenceError && (
              <p className="commerce-notice">
                Browser storage is unavailable. Your bag is saved for this visit
                only.
              </p>
            )}
            <Link href="/checkout" className="button" onClick={closeCart}>
              Checkout <ArrowRight size={17} />
            </Link>
            <Link
              href="/cart"
              className="cart-drawer__view"
              onClick={closeCart}
            >
              View your bag
            </Link>
            <p className="cart-demo-note">Demo checkout · no payment taken</p>
          </div>
        </>
      )}
    </Drawer>
  );
}
