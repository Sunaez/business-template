"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import type { CustomerSection } from "@/types/account";
import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAccountCustomer, useAccountOrders } from "../AccountProviders";
import { OrderCard } from "../orders/OrderCard";
import {
  EmptyState,
  Metrics,
  SectionHeading,
  TextButton,
} from "../shared/AccountPrimitives";
import { WishlistGrid } from "./WishlistGrid";
export function CustomerOverview({
  navigate,
  setSelectedOrder,
  onRemove,
}: {
  navigate: (section: CustomerSection) => void;
  setSelectedOrder: (number: string) => void;
  onRemove: (id: string) => void;
}) {
  const { brand, products } = useStorefront();
  const { profile, wishlist, addresses } = useAccountCustomer();
  const { orders } = useAccountOrders();
  const customerOrders = orders.filter(
    (order) => order.customerId === profile.id,
  );
  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id),
  );
  const defaultAddress = addresses.find((address) => address.isDefault);
  return (
    <>
      <>
        <Metrics
          items={[
            {
              label: "Your orders",
              value: String(customerOrders.length).padStart(2, "0"),
              note: "See your order history",
              onClick: () => navigate("orders"),
            },
            {
              label: "Saved for later",
              value: String(wishlist.length).padStart(2, "0"),
              note: "Revisit your favourites",
              onClick: () => navigate("wishlist"),
            },
            {
              label: "Part of the story",
              value: "Jun ’26",
              note: "Good to have you with us",
            },
          ]}
        />
        <div className="account-customer-overview">
          <section>
            <SectionHeading
              title="Your latest order"
              action=<TextButton onClick={() => navigate("orders")}>
                All orders
              </TextButton>
            />
            {customerOrders[0] && (
              <OrderCard
                order={customerOrders[0]}
                onOpen={() => setSelectedOrder(customerOrders[0].number)}
              />
            )}
          </section>
          <aside className="account-delivery-note">
            <MapPin size={23} strokeWidth={1.3} aria-hidden="true" />
            <p className="eyebrow">Your usual destination</p>
            <h2>{defaultAddress?.label ?? "Somewhere new?"}</h2>
            {defaultAddress ? (
              <address>
                {defaultAddress.fullName}
                <br />
                {defaultAddress.line1}
                <br />
                {defaultAddress.city}, {defaultAddress.postcode}
              </address>
            ) : (
              <p>Add an address for your next good thing.</p>
            )}
            <TextButton onClick={() => navigate("addresses")}>
              Manage addresses
            </TextButton>
            <span className="account-delivery-note__foot">
              Thoughtfully packed.
              <br />
              Ready for your everyday.
            </span>
          </aside>
        </div>
        <section className="account-section">
          <SectionHeading
            title="Your considered collection"
            subtitle={`${wishlist.length} pieces saved for another day.`}
            action=<TextButton onClick={() => navigate("wishlist")}>
              View wishlist
            </TextButton>
          />
          {savedProducts.length ? (
            <WishlistGrid limit={3} onRemove={onRemove} />
          ) : (
            <EmptyState title="Room for a new favourite.">
              <Link href="/shop" className="text-link">
                Explore the collection
              </Link>
            </EmptyState>
          )}
        </section>
      </>
      <Link href="/collections/autumn-26" className="account-editorial">
        <div>
          <p className="eyebrow">The next chapter / Autumn 26</p>
          <h2>
            A little less.
            <br />A little better.
          </h2>
          <span>
            Explore the latest edit
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
        <div className="account-editorial__image">
          <Image
            src={brand.campaign.image.src}
            alt={brand.campaign.image.alt}
            fill
            sizes="(max-width: 600px) 45vw, 30vw"
          />
        </div>
      </Link>
    </>
  );
}
