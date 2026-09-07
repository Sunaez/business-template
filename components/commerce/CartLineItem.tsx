"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { type CartLine, useCart } from "./CartProvider";
import { QuantitySelector } from "./QuantitySelector";

export function CartLineItem({
  line,
  compact = false,
}: {
  line: CartLine;
  compact?: boolean;
}) {
  const { brand, updateQuantity, removeItem, closeCart } = useCart();
  const photo = line.variant.image ?? line.product.images[0];
  return (
    <article className={`cart-line${compact ? " cart-line--compact" : ""}`}>
      <Link
        href={`/product/${line.product.slug}`}
        className="cart-line__image"
        onClick={closeCart}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={compact ? "88px" : "140px"}
        />
      </Link>
      <div className="cart-line__details">
        <Link
          className="cart-line__title"
          href={`/product/${line.product.slug}`}
          onClick={closeCart}
        >
          {line.product.name}
        </Link>
        <p className="cart-line__options">
          {Object.entries(line.variant.selectedOptions).map(([name, value]) => (
            <span key={name}>
              {name}: {value}
            </span>
          ))}
        </p>
        <span className="cart-line__unit-price">
          {formatPrice(line.unitPrice, line.product.currency, brand.locale)}{" "}
          each
        </span>
        <QuantitySelector
          compact
          quantity={line.quantity}
          max={line.variant.stock}
          label={`Quantity of ${line.product.name}`}
          onChange={(quantity) =>
            updateQuantity(line.product.id, line.variant.id, quantity)
          }
        />
      </div>
      <div className="cart-line__end">
        <button
          type="button"
          className="commerce-icon-button"
          onClick={() => removeItem(line.product.id, line.variant.id)}
          aria-label={`Remove ${line.product.name} from bag`}
        >
          <X size={16} />
        </button>
        <strong>
          {formatPrice(line.lineTotal, line.product.currency, brand.locale)}
        </strong>
      </div>
    </article>
  );
}
