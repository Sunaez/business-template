"use client";

import type { Product } from "@/types";
import type { AdminSection } from "@/types/account";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useAccountOrders } from "./AccountProviders";
import { AdminOverview } from "./admin/AdminOverview";
import { OverlayLoading } from "@/components/ui/OverlayLoading";
import { AccountNotice, AccountSectionLoading } from "./shared/AccountNotice";
import { AccountShell } from "./shared/AccountShell";

const OrdersSection = dynamic(
  () => import("./admin/OrdersSection").then((module) => module.OrdersSection),
  { loading: AccountSectionLoading },
);
const InventorySection = dynamic(
  () =>
    import("./admin/InventorySection").then(
      (module) => module.InventorySection,
    ),
  { loading: AccountSectionLoading },
);
const CustomersSection = dynamic(
  () =>
    import("./admin/CustomersSection").then(
      (module) => module.CustomersSection,
    ),
  { loading: AccountSectionLoading },
);
const StockDrawer = dynamic(
  () => import("./admin/StockDrawer").then((module) => module.StockDrawer),
  { loading: OverlayLoading },
);
const OrderDrawer = dynamic(
  () => import("./orders/OrderDrawer").then((module) => module.OrderDrawer),
  { loading: OverlayLoading },
);

export function AdminDashboard() {
  const { orders, updateOrder } = useAccountOrders();
  const [view, setView] = useState<{
    section: AdminSection;
    filter: string;
    query: string;
  }>({ section: "overview", filter: "all", query: "" });
  const [selectedOrder, setSelectedOrder] = useState<string>();
  const [editingProduct, setEditingProduct] = useState<Product>();
  const [notice, setNotice] = useState("");
  const processing = orders.filter(
    (order) => order.status === "Processing",
  ).length;
  const order = orders.find((order) => order.number === selectedOrder);
  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ClipboardList, count: processing },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
  ] satisfies {
    id: AdminSection;
    label: string;
    icon: typeof Package;
    count?: number;
  }[];
  const headings: Record<AdminSection, [string, string]> = {
    overview: [
      "A little order. A clear view.",
      "Welcome back, Jamie. Here’s how things are looking at your store.",
    ],
    orders: [
      "Every order, considered.",
      "From a new order to a happy arrival. Keep everything moving.",
    ],
    inventory: [
      "The right pieces. In stock.",
      "A closer look at your catalogue, down to the last size and colour.",
    ],
    customers: [
      "In good company.",
      "Meet the people making your pieces part of their everyday.",
    ],
  };
  function navigate(section: AdminSection, filter = "all", query = "") {
    setView({ section, filter, query });
    setNotice("");
  }
  return (
    <AccountShell
      role="admin"
      active={view.section}
      onNavigate={navigate}
      navigation={navigation}
      title={headings[view.section][0]}
      description={headings[view.section][1]}
      action={
        <Link className="button button-outline" href="/shop">
          View storefront
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <AccountNotice message={notice} />
      {view.section === "overview" && (
        <AdminOverview
          navigate={navigate}
          setSelectedOrder={setSelectedOrder}
          setEditingProduct={setEditingProduct}
        />
      )}
      {view.section === "orders" && (
        <OrdersSection
          key={`${view.filter}:${view.query}`}
          initialFilter={view.filter}
          initialQuery={view.query}
          onOpen={setSelectedOrder}
          onNotice={setNotice}
        />
      )}
      {view.section === "inventory" && (
        <InventorySection
          key={view.filter}
          initialFilter={view.filter}
          setEditingProduct={setEditingProduct}
        />
      )}
      {view.section === "customers" && <CustomersSection navigate={navigate} />}
      {order && (
        <OrderDrawer
          order={order}
          admin
          onClose={() => setSelectedOrder(undefined)}
          onSave={(status) => {
            const result = updateOrder(order.number, status);
            if (result.ok) {
              setNotice(
                `Order ${order.number} updated to ${status.toLowerCase()}.`,
              );
              setSelectedOrder(undefined);
            } else setNotice(result.message);
          }}
        />
      )}
      {editingProduct && (
        <StockDrawer
          product={editingProduct}
          onClose={() => setEditingProduct(undefined)}
          onSaved={() => {
            setNotice(`Stock updated for ${editingProduct.name}.`);
            setEditingProduct(undefined);
          }}
        />
      )}
    </AccountShell>
  );
}
