import { Drawer } from "@/components/ui/Drawer";
import type { Product } from "@/types";
import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAccountInventory } from "../AccountProviders";

export function StockDrawer({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { stock, updateStock } = useAccountInventory();
  const [error, setError] = useState("");
  return (
    <Drawer open onClose={onClose} title="Adjust stock">
      <form
        className="account-drawer-body account-form"
        onSubmit={(event) => {
          event.preventDefault();
          const result = updateStock(
            product.id,
            Object.fromEntries(new FormData(event.currentTarget)),
          );
          if (result.ok) onSaved();
          else setError(result.message);
        }}
      >
        <div className="account-stock-product">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            width={80}
            height={100}
          />
          <div>
            <h3>{product.name}</h3>
            <p>{product.variants.length} variants</p>
            <Link
              href={`/product/${product.slug}`}
              className="account-text-button"
            >
              View product
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <p className="muted">Set the units on hand for each size and colour.</p>
        {product.inventoryStatus !== "in-stock" && (
          <p className="account-fine-print">
            This is a future release. Stock changes won’t publish the product.
          </p>
        )}
        <div className="account-stock-variants">
          {product.variants.map((variant) => (
            <label className="account-stock-row" key={variant.id}>
              <span>
                <strong>
                  {Object.values(variant.selectedOptions).join(" / ")}
                </strong>
                <small>{variant.sku}</small>
              </span>
              <input
                type="number"
                inputMode="numeric"
                name={variant.id}
                aria-label={`Stock for ${Object.values(variant.selectedOptions).join(" / ")}`}
                min={0}
                max={9999}
                step={1}
                required
                defaultValue={stock[variant.id]}
              />
            </label>
          ))}
        </div>
        <div className="account-stock-save">
          {error && (
            <p role="alert" className="account-form-error">
              {error}
            </p>
          )}
          <p className="account-fine-print">
            Preview changes only; storefront stock is unchanged.
          </p>
          <button type="submit" className="button">
            Save stock levels
            <Check size={15} aria-hidden="true" />
          </button>
        </div>
      </form>
    </Drawer>
  );
}
