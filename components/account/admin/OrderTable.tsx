"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { demoCustomers } from "@/data/accounts";
import { accountDate } from "@/lib/account";
import { formatPrice } from "@/lib/pricing";
import type { DemoOrder } from "@/types/account";
import { ArrowUpRight } from "lucide-react";
import { useAccountCustomer } from "../AccountProviders";
import { OrderStatus } from "../orders/OrderProgress";
import { EmptyState, TextButton } from "../shared/AccountPrimitives";
export function OrderTable({
  orders,
  limit,
  onOpen,
  onClear,
}: {
  orders: DemoOrder[];
  limit?: number;
  onOpen: (number: string) => void;
  onClear?: () => void;
}) {
  const { brand } = useStorefront();
  const { profile } = useAccountCustomer();
  const customers = demoCustomers.map((person) =>
    person.id === profile.id ? profile : person,
  );
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  return (
    <div
      className="account-table-scroll"
      role="region"
      aria-label="Orders table"
      tabIndex={0}
    >
      <table className="account-table account-orders-table">
        <thead>
          <tr>
            <th scope="col">Order / date</th>
            <th scope="col">Customer</th>
            <th scope="col">Status</th>
            <th scope="col" className="account-table__right">
              Total
            </th>
            <th scope="col">
              <span className="sr-only">Manage order</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(limit ? orders.slice(0, limit) : orders).map((order) => (
            <tr key={order.number}>
              <td className="account-row-title">
                <button
                  className="account-table__name"
                  type="button"
                  onClick={() => onOpen(order.number)}
                >
                  {order.number}
                </button>
                <small>{accountDate(order.placed, brand.locale)}</small>
              </td>
              <td data-label="Customer">
                {
                  customers.find((person) => person.id === order.customerId)
                    ?.name
                }
                <small>
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "piece" : "pieces"}
                </small>
              </td>
              <td className="account-row-status">
                <OrderStatus status={order.status} />
              </td>
              <td className="account-table__right" data-label="Total">
                {money(order.total)}
              </td>
              <td className="account-row-action">
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Manage order ${order.number}`}
                  onClick={() => onOpen(order.number)}
                >
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!limit && orders.length === 0 && (
        <EmptyState title="No matching orders.">
          <p>Try a different name, order number or status.</p>
          {onClear && <TextButton onClick={onClear}>Clear filters</TextButton>}
        </EmptyState>
      )}
    </div>
  );
}
