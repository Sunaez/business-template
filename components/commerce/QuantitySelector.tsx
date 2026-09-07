"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  quantity,
  onChange,
  max,
  label = "Quantity",
  compact = false,
}: {
  quantity: number;
  onChange: (value: number) => void;
  max: number;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`quantity-selector${compact ? " quantity-selector--compact" : ""}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
