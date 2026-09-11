import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { Brand, Product } from "@/types";
import { createDemoOrders } from "@/data/accounts";
import { getInventorySummary } from "@/lib/account";
import { formatPrice } from "@/lib/pricing";

export function StorePreview({
  brand,
  products,
}: {
  brand: Brand;
  products: Product[];
}) {
  return (
    <figure className="biz-store-preview">
      <div className="biz-preview-caption">
        <span>THE WORKING DEMO</span>
        <span>Made for your kind of shop ↗</span>
      </div>
      <div className="biz-mini-store">
        <div className="biz-mini-header">
          <span>{brand.wordmark}</span>
          <ShoppingBag size={16} aria-hidden="true" />
        </div>
        <Link href="/shop" className="biz-mini-campaign">
          <Image
            src={brand.hero.image.src}
            alt={brand.hero.image.alt}
            width={820}
            height={460}
            priority
            sizes="(max-width: 800px) 90vw, 44vw"
          />
          <span>
            Good things.
            <br />
            Worn often.<small>Explore the collection ↗</small>
          </span>
        </Link>
        <div className="biz-mini-products">
          {products.slice(0, 2).map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`}>
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                width={280}
                height={280}
                sizes="(max-width: 800px) 40vw, 20vw"
              />
              <div>
                <span>{product.name}</span>
                <span>
                  {formatPrice(product.price, brand.currency, brand.locale)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <figcaption>
        <span>This could be your name above the door.</span>
        <Link href="/shop" aria-label="Explore the demonstration store">
          <ArrowUpRight size={21} aria-hidden="true" />
        </Link>
      </figcaption>
    </figure>
  );
}

export function DashboardPreview({
  brand,
  products,
}: {
  brand: Brand;
  products: Product[];
}) {
  const orders = createDemoOrders(products, brand);
  const { lowStock } = getInventorySummary(products, {});
  const money = (value: number) =>
    formatPrice(value, brand.currency, brand.locale);
  const revenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  return (
    <figure className="biz-dashboard">
      <div className="biz-dashboard-top">
        <span>
          {brand.name} <span>/ Store overview</span>
        </span>
        <span className="biz-demo-badge">Sample data · not live sales</span>
      </div>
      <div className="biz-dashboard-body">
        <aside aria-label="Dashboard preview sections">
          <strong>Overview</strong>
          <span>Orders</span>
          <span>Inventory</span>
          <span>Customers</span>
          <small>
            Preview of the
            <br />
            existing dashboard
          </small>
        </aside>
        <div className="biz-dashboard-content">
          <div className="biz-dashboard-title">
            <h3>Your store at a glance</h3>
            <span>Sample period · Jul–Sep 2026</span>
          </div>
          <dl className="biz-metrics">
            <div>
              <dt>Sample order value</dt>
              <dd>{money(revenue)}</dd>
            </div>
            <div>
              <dt>Orders to prepare</dt>
              <dd>
                {orders.filter((order) => order.status === "Processing").length}
              </dd>
            </div>
            <div>
              <dt>Low-stock variants</dt>
              <dd>{lowStock.length}</dd>
            </div>
          </dl>
          <div className="biz-dashboard-grid">
            <section>
              <h4>Latest sample orders</h4>
              {orders.slice(0, 3).map((order) => (
                <div className="biz-order-row" key={order.number}>
                  <strong>#{order.number}</strong>
                  <span>{money(order.total)}</span>
                  <span className="biz-status">
                    {order.status === "Processing"
                      ? "To prepare"
                      : order.status}
                  </span>
                </div>
              ))}
            </section>
            <section>
              <h4>A little stock check</h4>
              {lowStock.slice(0, 2).map(({ product, variant, quantity }) => (
                <div className="biz-stock-row" key={variant.id}>
                  <Image
                    src={variant.image?.src ?? product.images[0].src}
                    alt=""
                    width={40}
                    height={50}
                  />
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {Object.values(variant.selectedOptions).join(" / ")}
                    </small>
                    <span>{quantity} in stock</span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
      <figcaption>
        Interactive demo available below. Dashboard changes reset when you leave
        and do not update the storefront. Figures are fictional examples, not
        business results.
      </figcaption>
    </figure>
  );
}
