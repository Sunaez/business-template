"use client";

import type { CustomerSection } from "@/types/account";
import {
  ArrowUpRight,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useAccountCustomer, useAccountOrders } from "./AccountProviders";
import { CustomerOverview } from "./customer/CustomerOverview";
import { OrderCard } from "./orders/OrderCard";
import { OverlayLoading } from "@/components/ui/OverlayLoading";
import { AccountNotice, AccountSectionLoading } from "./shared/AccountNotice";
import { AccountShell } from "./shared/AccountShell";

const WishlistSection = dynamic(
  () =>
    import("./customer/WishlistSection").then(
      (module) => module.WishlistSection,
    ),
  { loading: AccountSectionLoading },
);
const AddressesSection = dynamic(
  () =>
    import("./customer/AddressesSection").then(
      (module) => module.AddressesSection,
    ),
  { loading: AccountSectionLoading },
);
const ProfileSection = dynamic(
  () =>
    import("./customer/ProfileSection").then((module) => module.ProfileSection),
  { loading: AccountSectionLoading },
);
const OrderDrawer = dynamic(
  () => import("./orders/OrderDrawer").then((module) => module.OrderDrawer),
  { loading: OverlayLoading },
);

export function CustomerDashboard() {
  const { profile, wishlist, removePiece, restorePiece } = useAccountCustomer();
  const { orders } = useAccountOrders();
  const [section, setSection] = useState<CustomerSection>("overview");
  const [selectedOrder, setSelectedOrder] = useState<string>();
  const [notice, setNotice] = useState("");
  const [removedPiece, setRemovedPiece] = useState<string>();
  const customerOrders = orders.filter(
    (order) => order.customerId === profile.id,
  );
  const order = customerOrders.find((order) => order.number === selectedOrder);
  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "orders",
      label: "My orders",
      icon: Package,
      count: customerOrders.length,
    },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "details", label: "Account details", icon: UserRound },
  ] satisfies {
    id: CustomerSection;
    label: string;
    icon: typeof Heart;
    count?: number;
  }[];
  const headings: Record<CustomerSection, [string, string]> = {
    overview: [
      `Welcome back, ${profile.name.split(" ")[0]}.`,
      "Your latest orders, favourite pieces and everyday details.",
    ],
    orders: [
      "Your orders.",
      "From the first click to your favourite everyday piece.",
    ],
    wishlist: [
      "Worth coming back to.",
      "A little collection of pieces you have your eye on.",
    ],
    addresses: [
      "A place to call home.",
      "Keep your delivery details close, wherever your day takes you.",
    ],
    details: [
      "The personal details.",
      "A few small things that make this space yours.",
    ],
  };
  function navigate(next: CustomerSection) {
    setSection(next);
    setNotice("");
    setRemovedPiece(undefined);
  }
  function remove(id: string) {
    removePiece(id);
    setRemovedPiece(id);
    setNotice("Piece removed from your wishlist.");
  }
  return (
    <AccountShell
      role="customer"
      active={section}
      onNavigate={navigate}
      navigation={navigation}
      title={headings[section][0]}
      description={headings[section][1]}
      action={
        <Link href="/collections/new-arrivals" className="account-text-button">
          Discover what’s new
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      }
    >
      <AccountNotice
        message={notice}
        onUndo={
          removedPiece
            ? () => {
                restorePiece(removedPiece);
                setRemovedPiece(undefined);
                setNotice("Piece restored to your wishlist.");
              }
            : undefined
        }
      />
      {section === "overview" && (
        <CustomerOverview
          navigate={navigate}
          setSelectedOrder={setSelectedOrder}
          onRemove={remove}
        />
      )}
      {section === "orders" && (
        <div className="account-orders-list">
          {customerOrders.map((order) => (
            <OrderCard
              key={order.number}
              order={order}
              onOpen={() => setSelectedOrder(order.number)}
            />
          ))}
        </div>
      )}
      {section === "wishlist" && <WishlistSection onRemove={remove} />}
      {section === "addresses" && <AddressesSection onNotice={setNotice} />}
      {section === "details" && <ProfileSection onNotice={setNotice} />}
      {order && (
        <OrderDrawer
          order={order}
          onClose={() => setSelectedOrder(undefined)}
        />
      )}
    </AccountShell>
  );
}
