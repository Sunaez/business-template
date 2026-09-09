"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/types";

/** Alternate photography is fetched only for an actual hover, never on touch scroll. */
export function ProductCardImages({
  primary,
  secondary,
  sizes,
  eager,
}: {
  primary?: ProductImage;
  secondary?: ProductImage;
  sizes: string;
  eager: boolean;
}) {
  const [showAlternate, setShowAlternate] = useState(false);
  const [alternateLoaded, setAlternateLoaded] = useState(false);
  return (
    <span
      className="product-card__images"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setShowAlternate(true);
      }}
    >
      {primary && (
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          sizes={sizes}
          className="product-card__image product-card__image--primary"
          loading={eager ? "eager" : "lazy"}
        />
      )}
      {showAlternate && secondary && (
        <Image
          src={secondary.src}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          className="product-card__image product-card__image--secondary"
          style={alternateLoaded ? undefined : { opacity: 0 }}
          onLoad={() => setAlternateLoaded(true)}
        />
      )}
    </span>
  );
}
