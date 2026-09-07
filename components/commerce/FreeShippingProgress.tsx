"use client";

import { Check, Truck } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "./CartProvider";

export function FreeShippingProgress() {
  const { subtotal, brand } = useCart();
  const remaining = Math.max(brand.freeShippingThreshold - subtotal, 0);
  const progress =
    brand.freeShippingThreshold > 0
      ? Math.min((subtotal / brand.freeShippingThreshold) * 100, 100)
      : 100;
  return (
    <div className="free-shipping-progress">
      <p>
        {remaining === 0 ? <Check size={15} /> : <Truck size={16} />}
        <span>
          {remaining === 0 ? (
            "Your order qualifies for free standard delivery."
          ) : (
            <>
              You&apos;re {formatPrice(remaining, brand.currency, brand.locale)}{" "}
              away from free delivery.
            </>
          )}
        </span>
      </p>
      <div
        className="free-shipping-progress__track"
        role="progressbar"
        aria-label="Progress toward free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
