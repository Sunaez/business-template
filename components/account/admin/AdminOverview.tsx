"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { demoCustomers } from "@/data/accounts";
import { formatPrice } from "@/lib/pricing";
import type { Product } from "@/types";
import type { AdminSection } from "@/types/account";
import { ArrowUpRight, ClipboardList, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useAccountInventory, useAccountOrders } from "../AccountProviders";
import {
  EmptyState,
  Metrics,
  SectionHeading,
  Status,
  TextButton,
} from "../shared/AccountPrimitives";
import { OrderTable } from "./OrderTable";
export function AdminOverview({
  navigate,
  setSelectedOrder,
  setEditingProduct,
}: {
  navigate: (section: AdminSection, filter?: string) => void;
  setSelectedOrder: (number: string) => void;
  setEditingProduct: (product: Product) => void;
}) {
  const { brand } = useStorefront();
  const { orders } = useAccountOrders();
  const {
    summary: { lowStock },
  } = useAccountInventory();
  const customers = demoCustomers;
  const processing = orders.filter((order) => order.status === "Processing");
  const revenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  return (
    <>
      <div className="account-period">
        <span className="eyebrow">The store at a glance</span>
        <span>Sample period · Jul–Sep 2026</span>
      </div>
      <Metrics
        items={[
          {
            label: "Order value",
            value: money(revenue),
            note: `${orders.filter((order) => order.status !== "Cancelled").length} sample orders · including delivery`,
          },
          {
            label: "To prepare",
            value: String(processing.length).padStart(2, "0"),
            note: "Orders awaiting dispatch",
            onClick: () => navigate("orders", "Processing"),
          },
          {
            label: "Running low",
            value: String(lowStock.length).padStart(2, "0"),
            note: "Variants with 5 or fewer left",
            onClick: () => navigate("inventory", "low"),
          },
          {
            label: "Customers",
            value: String(customers.length).padStart(2, "0"),
            note: "People behind the orders",
            onClick: () => navigate("customers"),
          },
        ]}
      />
      <div className="account-attention">
        <span className="account-attention__icon">
          <ClipboardList size={22} strokeWidth={1.4} aria-hidden="true" />
        </span>
        <div>
          <strong>
            {processing.length
              ? `${processing.length} orders ready for your attention.`
              : "You’re all caught up."}
          </strong>
          <p>
            {processing.length
              ? "A few good things are waiting to be packed and sent."
              : "Every sample order has moved beyond processing."}
          </p>
        </div>
        <TextButton onClick={() => navigate("orders", "Processing")}>
          Review orders
        </TextButton>
      </div>
      <section className="account-section">
        <SectionHeading
          title="Latest orders"
          subtitle="The latest pieces finding a new home."
          action=<TextButton onClick={() => navigate("orders")}>
            All orders
          </TextButton>
        />
        <OrderTable orders={orders} limit={4} onOpen={setSelectedOrder} />
      </section>
      <div className="account-admin-bottom">
        <section>
          <SectionHeading
            title="A little stock check"
            subtitle="Five or fewer left in these variants."
            action=<TextButton onClick={() => navigate("inventory", "low")}>
              Inventory
            </TextButton>
          />
          <div className="account-low-stock">
            {lowStock.slice(0, 3).map(({ product, variant, quantity }) => (
              <button
                type="button"
                key={variant.id}
                onClick={() => setEditingProduct(product)}
              >
                <Image
                  src={variant.image?.src ?? product.images[0].src}
                  alt=""
                  width={48}
                  height={60}
                />
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {Object.values(variant.selectedOptions).join(" / ")}
                  </small>
                </span>
                <Status tone="attention">{quantity} left</Status>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ))}
            {!lowStock.length && (
              <EmptyState title="Stock is looking good.">
                <p>No variants are running low.</p>
              </EmptyState>
            )}
          </div>
        </section>
        <aside className="account-store-note">
          <SlidersHorizontal size={24} strokeWidth={1.3} aria-hidden="true" />
          <p className="eyebrow">Behind the storefront</p>
          <h2>
            The details make
            <br />
            the difference.
          </h2>
          <p>
            Keep an eye on sizes and colours. A well-stocked favourite is always
            a good thing.
          </p>
          <TextButton onClick={() => navigate("inventory")}>
            Manage your stock
          </TextButton>
        </aside>
      </div>
    </>
  );
}
