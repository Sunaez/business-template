"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { demoCustomers } from "@/data/accounts";
import { createCsv } from "@/lib/account";
import { orderStatuses } from "@/types/account";
import { ArrowDownToLine, Search } from "lucide-react";
import { useState } from "react";
import { useAccountCustomer, useAccountOrders } from "../AccountProviders";
import { OrderTable } from "./OrderTable";
export function OrdersSection({
  initialFilter = "all",
  initialQuery = "",
  onOpen,
  onNotice,
}: {
  initialFilter?: string;
  initialQuery?: string;
  onOpen: (number: string) => void;
  onNotice: (message: string) => void;
}) {
  const { brand } = useStorefront();
  const { orders } = useAccountOrders();
  const { profile } = useAccountCustomer();
  const customers = demoCustomers.map((person) =>
    person.id === profile.id ? profile : person,
  );
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const filteredOrders = orders.filter((order) => {
    const customer = customers.find((person) => person.id === order.customerId);
    return (
      (filter === "all" || order.status === filter) &&
      `${order.number} ${customer?.name} ${customer?.email}`
        .toLowerCase()
        .includes(query.toLowerCase().trim())
    );
  });
  function downloadOrders() {
    const rows = [
      ["Order", "Customer", "Date", "Status", "Total (" + brand.currency + ")"],
      ...filteredOrders.map((order) => [
        order.number,
        customers.find((person) => person.id === order.customerId)?.name ?? "",
        order.placed,
        order.status,
        (order.total / 100).toFixed(2),
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([createCsv(rows)], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "demo-orders.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotice(filteredOrders.length + " demo orders exported.");
  }
  const orderTable = () => (
    <OrderTable
      orders={filteredOrders}
      onOpen={onOpen}
      onClear={() => {
        setQuery("");
        setFilter("all");
      }}
    />
  );
  return (
    <>
      <div className="account-toolbar">
        <label className="account-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search orders</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number or customer"
          />
        </label>
        <label className="account-filter">
          <span className="sr-only">Order status filter</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {orderStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <button
          className="button button-outline"
          type="button"
          onClick={downloadOrders}
        >
          <ArrowDownToLine size={15} aria-hidden="true" />
          Export orders
        </button>
      </div>
      <p className="account-results">{filteredOrders.length} orders</p>
      {orderTable()}
    </>
  );
}
