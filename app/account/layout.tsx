import type { Metadata } from "next";
import { DemoAccountProvider } from "@/components/account/AccountProviders";
import "@/components/account/account.css";
import "@/components/account/responsive.css";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoAccountProvider>{children}</DemoAccountProvider>;
}
