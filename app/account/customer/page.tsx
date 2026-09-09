import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/account/CustomerDashboard";

export const metadata: Metadata = { title: "My account" };
export default function CustomerPage() {
  return <CustomerDashboard />;
}
