"use client";

import dynamic from "next/dynamic";
import { useCart } from "./CartProvider";
import { OverlayLoading } from "@/components/ui/OverlayLoading";

const CartDrawer = dynamic(
  () => import("./CartDrawer").then((module) => module.CartDrawer),
  { loading: OverlayLoading },
);

export function CartOverlay() {
  const { isOpen } = useCart();
  return isOpen ? <CartDrawer /> : null;
}
