"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { demoCustomers } from "@/data/accounts";
import { accountDate } from "@/lib/account";
import { formatPrice } from "@/lib/pricing";
import type { AdminSection } from "@/types/account";
import { ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";
import { useAccountCustomer, useAccountOrders } from "../AccountProviders";
import { EmptyState } from "../shared/AccountPrimitives";
export function CustomersSection({
  navigate,
}: {
  navigate: (section: AdminSection, filter?: string, query?: string) => void;
}) {
  const { brand } = useStorefront();
  const { profile } = useAccountCustomer();
  const { orders } = useAccountOrders();
  const customers = demoCustomers.map((person) =>
    person.id === profile.id ? profile : person,
  );
  const [query, setQuery] = useState("");
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  return (
    <>
      <div className="account-toolbar">
        <label className="account-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search customers</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers by name or email"
          />
        </label>
      </div>
      <div
        className="account-table-scroll"
        role="region"
        aria-label="Customers table"
        tabIndex={0}
      >
        <table className="account-table account-customers-table">
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">Member since</th>
              <th scope="col">Orders</th>
              <th scope="col" className="account-table__right">
                Order value
              </th>
              <th scope="col">
                <span className="sr-only">View customer orders</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter((person) =>
                `${person.name} ${person.email}`
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
              )
              .map((person) => {
                const customerOrders = orders.filter(
                  (order) => order.customerId === person.id,
                );
                return (
                  <tr key={person.id}>
                    <td className="account-row-title">
                      <div className="account-table-product">
                        <span className="account-avatar account-avatar--small">
                          {person.initials}
                        </span>
                        <span>
                          <strong>{person.name}</strong>
                          <small>{person.email}</small>
                        </span>
                      </div>
                    </td>
                    <td data-label="Member since">
                      {accountDate(person.joined, brand.locale)}
                    </td>
                    <td data-label="Orders">{customerOrders.length}</td>
                    <td
                      className="account-table__right"
                      data-label="Order value"
                    >
                      {money(
                        customerOrders
                          .filter((order) => order.status !== "Cancelled")
                          .reduce((sum, order) => sum + order.total, 0),
                      )}
                    </td>
                    <td className="account-row-action">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`View orders for ${person.name}`}
                        onClick={() => {
                          navigate("orders", "all", person.name);
                        }}
                      >
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!customers.some((person) =>
          `${person.name} ${person.email}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        ) && (
          <EmptyState title="No matching customers.">
            <p>Try another name or email address.</p>
          </EmptyState>
        )}
      </div>
    </>
  );
}
