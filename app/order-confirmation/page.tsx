import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/commerce/OrderConfirmation";

export const metadata: Metadata = {
  title: "Demo order confirmation",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <OrderConfirmation />;
}
