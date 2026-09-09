"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { accountDate } from "@/lib/account";
import { formatPrice } from "@/lib/pricing";
import type { DemoOrder } from "@/types/account";
import Image from "next/image";
import { TextButton } from "../shared/AccountPrimitives";
import { OrderProgress, OrderStatus } from "./OrderProgress";
export function OrderCard({
  order,
  onOpen,
}: {
  order: DemoOrder;
  onOpen: () => void;
}) {
  const { brand } = useStorefront();
  return (
    <article className="account-order-card">
      <div className="account-order-card__header">
        <div>
          <strong>{order.number}</strong>
          <span>Placed {accountDate(order.placed, brand.locale)}</span>
        </div>
        <OrderStatus status={order.status} />
      </div>
      <div className="account-order-card__body">
        <div className="account-order-images">
          {order.items.map((item) => (
            <Image
              key={item.variantId}
              src={item.image.src}
              alt={item.name}
              width={90}
              height={112}
            />
          ))}
        </div>
        <div className="account-order-card__description">
          <h3>
            {order.status === "Dispatched"
              ? "Good things are on their way."
              : order.status === "Delivered"
                ? "Made for your everyday."
                : order.status === "Cancelled"
                  ? "Order cancelled."
                  : "A few good things, being prepared."}
          </h3>
          <p>{order.items.map((item) => item.name).join(" · ")}</p>
          <strong>
            {formatPrice(order.total, brand.currency, brand.locale)}
            <span>
              {" "}
              / {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              pieces
            </span>
          </strong>
        </div>
      </div>
      <OrderProgress status={order.status} />
      <div className="account-order-card__footer">
        <span>
          {order.status === "Dispatched"
            ? "Standard delivery · Tracking preview"
            : "Standard delivery"}
        </span>
        <TextButton onClick={onOpen}>View order</TextButton>
      </div>
    </article>
  );
}
