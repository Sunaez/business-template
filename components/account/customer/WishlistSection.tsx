import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAccountCustomer } from "../AccountProviders";
import { EmptyState, SectionHeading } from "../shared/AccountPrimitives";
import { WishlistGrid } from "./WishlistGrid";

export function WishlistSection({
  onRemove,
}: {
  onRemove: (id: string) => void;
}) {
  const { wishlist } = useAccountCustomer();
  return (
    <>
      <SectionHeading
        title={`${wishlist.length} saved pieces`}
        action={
          <Link href="/shop" className="account-text-button">
            Explore the collection
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        }
      />
      {wishlist.length ? (
        <WishlistGrid onRemove={onRemove} />
      ) : (
        <EmptyState title="A fresh start for your favourites.">
          <p>There’s always something worth a second look.</p>
          <Link href="/shop" className="button">
            Find your next favourite
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </EmptyState>
      )}
      <p className="account-fine-print">
        Choose a piece to explore colours, sizes and availability.
      </p>
    </>
  );
}
