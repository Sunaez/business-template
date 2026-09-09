"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { formatPrice } from "@/lib/pricing";
import type { Product } from "@/types";
import { Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAccountInventory } from "../AccountProviders";
import {
  EmptyState,
  Metrics,
  Status,
  TextButton,
} from "../shared/AccountPrimitives";
export function InventorySection({
  initialFilter = "all",
  setEditingProduct,
}: {
  initialFilter?: string;
  setEditingProduct: (product: Product) => void;
}) {
  const { brand, products } = useStorefront();
  const {
    stock,
    summary: { variants, lowStock, outOfStock },
  } = useAccountInventory();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      `${product.name} ${product.variants.map((variant) => variant.sku).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase().trim());
    return (
      matchesQuery &&
      (filter === "all" ||
        (product.inventoryStatus === "in-stock" &&
          product.variants.some((variant) =>
            filter === "low"
              ? stock[variant.id] > 0 && stock[variant.id] <= 5
              : stock[variant.id] === 0,
          )))
    );
  });
  return (
    <>
      <Metrics
        items={[
          {
            label: "The collection",
            value: products.length,
            note: `${variants.length} size & colour combinations`,
          },
          {
            label: "Running low",
            value: lowStock.length,
            note: "See variants to replenish",
            onClick: () => setFilter("low"),
          },
          {
            label: "Out of stock",
            value: outOfStock.length,
            note: "See sold-out variants",
            onClick: () => setFilter("out"),
          },
        ]}
      />
      <div className="account-toolbar">
        <label className="account-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search inventory</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products or SKU"
          />
        </label>
        <label className="account-filter">
          <span className="sr-only">Stock filter</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All stock levels</option>
            <option value="low">Low stock variants</option>
            <option value="out">Out of stock variants</option>
          </select>
        </label>
      </div>
      <p className="account-results">
        {filteredProducts.length} products · Stock shown across all variants
      </p>
      <div
        className="account-table-scroll"
        role="region"
        aria-label="Inventory table"
        tabIndex={0}
      >
        <table className="account-table account-inventory-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Units on hand</th>
              <th scope="col">Availability</th>
              <th scope="col">
                <span className="sr-only">Manage stock</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const total = product.variants.reduce(
                (sum, variant) => sum + stock[variant.id],
                0,
              );
              const low = product.variants.filter(
                (variant) => stock[variant.id] > 0 && stock[variant.id] <= 5,
              ).length;
              const empty = product.variants.filter(
                (variant) => stock[variant.id] === 0,
              ).length;
              return (
                <tr key={product.id}>
                  <td className="account-row-title">
                    <div className="account-table-product">
                      <Image
                        src={product.images[0].src}
                        alt=""
                        width={48}
                        height={60}
                      />
                      <span>
                        <button
                          className="account-table__name"
                          type="button"
                          onClick={() => setEditingProduct(product)}
                        >
                          {product.name}
                        </button>
                        <small>{product.variants.length} variants</small>
                      </span>
                    </div>
                  </td>
                  <td data-label="Price">{money(product.price)}</td>
                  <td data-label="Units on hand">
                    <strong>{total}</strong>
                    <small>
                      {product.inventoryStatus === "in-stock"
                        ? `${low} low · ${empty} sold out`
                        : "Future release"}
                    </small>
                  </td>
                  <td className="account-row-status">
                    <Status
                      tone={
                        product.inventoryStatus !== "in-stock"
                          ? "neutral"
                          : total === 0
                            ? "attention"
                            : "success"
                      }
                    >
                      {product.inventoryStatus === "coming-soon"
                        ? "Coming soon"
                        : product.inventoryStatus === "pre-order"
                          ? "Pre-order soon"
                          : total === 0
                            ? "Sold out"
                            : "In stock"}
                    </Status>
                  </td>
                  <td className="account-row-action">
                    <button
                      type="button"
                      className="account-text-button"
                      aria-label={`Adjust stock for ${product.name}`}
                      onClick={() => setEditingProduct(product)}
                    >
                      Adjust
                      <SlidersHorizontal size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredProducts.length && (
          <EmptyState title="No pieces found.">
            <p>Try another product name, SKU or stock filter.</p>
            <TextButton
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </TextButton>
          </EmptyState>
        )}
      </div>
    </>
  );
}
