import { ProductCard } from "@/components/catalog/ProductCard";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { Heart } from "lucide-react";
import { useAccountCustomer } from "../AccountProviders";

export function WishlistGrid({
  limit,
  onRemove,
}: {
  limit?: number;
  onRemove: (id: string) => void;
}) {
  const { brand, products } = useStorefront();
  const { wishlist } = useAccountCustomer();
  const saved = wishlist.flatMap(
    (id) => products.find((product) => product.id === id) ?? [],
  );
  return (
    <div className="account-wishlist-grid">
      {saved.slice(0, limit).map((product) => (
        <div className="account-wishlist-item" key={product.id}>
          <ProductCard
            product={product}
            locale={brand.locale}
            eager={false}
            sizes="(max-width: 600px) 44vw, (max-width: 800px) 29vw, (max-width: 1200px) 23vw, 25vw"
          />
          <button
            type="button"
            className="account-heart-button"
            aria-label={`Remove ${product.name} from wishlist`}
            onClick={() => onRemove(product.id)}
          >
            <Heart
              size={17}
              fill="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>
      ))}
    </div>
  );
}
