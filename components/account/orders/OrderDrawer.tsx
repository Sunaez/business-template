"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { Drawer } from "@/components/ui/Drawer";
import { demoCustomers } from "@/data/accounts";
import { accountDate } from "@/lib/account";
import { formatPrice } from "@/lib/pricing";
import type { DemoOrder, DemoOrderStatus } from "@/types/account";
import { orderStatuses } from "@/types/account";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAccountCustomer } from "../AccountProviders";
import { OrderProgress, OrderStatus } from "./OrderProgress";
export function OrderDrawer({
  order,
  admin = false,
  onClose,
  onSave,
}: {
  order: DemoOrder | undefined;
  admin?: boolean;
  onClose: () => void;
  onSave?: (status: DemoOrderStatus) => void;
}) {
  const { brand } = useStorefront();
  const { profile } = useAccountCustomer();
  const customer =
    order?.customerId === profile.id
      ? profile
      : demoCustomers.find((person) => person.id === order?.customerId);
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  return (
    <Drawer
      open={!!order}
      onClose={onClose}
      title={order ? `Order ${order.number}` : "Order details"}
    >
      {order && (
        <div className="account-drawer-body">
          <div className="account-section-heading">
            <span className="muted">
              {accountDate(order.placed, brand.locale)}
            </span>
            <OrderStatus status={order.status} />
          </div>
          <OrderProgress status={order.status} />
          {order.items.map((item) => (
            <div className="account-order-line" key={item.variantId}>
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={72}
                height={90}
              />
              <div>
                <strong>{item.name}</strong>
                <p>{Object.values(item.selectedOptions).join(" / ")}</p>
                <p>Qty {item.quantity}</p>
              </div>
              <strong>{money(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
          <dl className="account-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(order.total - order.shipping)}</dd>
            </div>
            <div>
              <dt>Standard delivery</dt>
              <dd>
                {order.shipping ? money(order.shipping) : "Complimentary"}
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
          <section className="account-drawer-section">
            <p className="eyebrow">Delivery details</p>
            <address>
              {order.address.fullName}
              <br />
              {order.address.line1}
              <br />
              {order.address.city}, {order.address.postcode}
              <br />
              {order.address.country}
            </address>
            {admin && <p>{customer?.email}</p>}
          </section>
          {admin ? (
            <form
              className="account-form"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                onSave?.(data.get("status") as DemoOrderStatus);
              }}
            >
              <label>
                Order status
                <select
                  name="status"
                  defaultValue={order.status}
                  key={`${order.number}-${order.status}`}
                >
                  {orderStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <button className="button" type="submit">
                Save order status
                <Check size={15} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <Link className="button button-outline" href="/contact">
              Get help with this order
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <p className="account-fine-print">
            Sample order. No payment, shipment or email is created.
          </p>
        </div>
      )}
    </Drawer>
  );
}
