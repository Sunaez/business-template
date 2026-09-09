import type { Metadata } from "next";
import { AdminDashboard } from "@/components/account/AdminDashboard";

export const metadata: Metadata = { title: "Store overview" };
export default function AdminPage() {
  return <AdminDashboard />;
}
