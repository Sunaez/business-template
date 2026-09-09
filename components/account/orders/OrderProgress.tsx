"use client";
import type { DemoOrderStatus } from "@/types/account";
import { orderStatuses } from "@/types/account";
import { Check } from "lucide-react";
import { Status } from "../shared/AccountPrimitives";
export function OrderStatus({ status }: { status: DemoOrderStatus }) {
  return (
    <Status
      tone={
        status === "Delivered" || status === "Dispatched"
          ? "success"
          : status === "Processing"
            ? "attention"
            : "neutral"
      }
    >
      {status}
    </Status>
  );
}
export function OrderProgress({ status }: { status: DemoOrderStatus }) {
  if (status === "Cancelled")
    return <p className="muted">This demo order has been cancelled.</p>;
  const current = orderStatuses.indexOf(status);
  return (
    <ol className="account-progress" aria-label="Order progress">
      {["Confirmed", "On its way", "Delivered"].map((step, index) => (
        <li
          key={step}
          className={index <= current ? "is-complete" : ""}
          aria-current={index === current ? "step" : undefined}
        >
          <span>
            {index <= current ? (
              <Check size={12} aria-hidden="true" />
            ) : (
              index + 1
            )}
          </span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}
