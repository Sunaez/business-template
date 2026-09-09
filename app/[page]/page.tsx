import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getBrandConfig } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import type { Brand } from "@/types";
import { ContactForm } from "@/components/content/ContactForm";
import { SizeGuide } from "@/components/content/SizeGuide";
import "@/components/content/content.css";

const pageTitles: Record<string, string> = {
  contact: "Get in touch",
  "size-guide": "Find your fit",
  "shipping-returns": "Shipping & returns",
  privacy: "Privacy policy",
  terms: "Terms & conditions",
};
export const dynamicParams = false;
interface ContentPageProps {
  params: Promise<{ page: string }>;
}

export function generateStaticParams() {
  return Object.keys(pageTitles).map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { page } = await params;
  return {
    title: pageTitles[page] ?? "Page not found",
  };
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="content-page__header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Contact({ brand }: { brand: Brand }) {
  return (
    <div className="content-page container">
      <PageHeader
        eyebrow="A conversation starts here"
        title="Get in touch."
        description="A question about fit, a detail you’d like to know, or something else entirely. We’re here to help."
      />
      <div className="content-page__columns">
        <div className="content-copy">
          <section>
            <h2>Let’s talk.</h2>
            <p>
              <a href={`mailto:${brand.contact.email}`}>
                {brand.contact.email}
              </a>
            </p>
            {brand.contact.phone && (
              <p>
                <a href={`tel:${brand.contact.phone.replace(/\s/g, "")}`}>
                  {brand.contact.phone}
                </a>
              </p>
            )}
            <address>{brand.contact.address}</address>
          </section>
          <section>
            <h2>A little guidance.</h2>
            <p>
              For measurements and fit notes, start with our{" "}
              <Link href="/size-guide">size guide</Link>. You can find delivery
              options and return information on our{" "}
              <Link href="/shipping-returns">shipping & returns</Link> page.
            </p>
            <p>
              For a product question, include the name of the piece and the size
              or colour you’re considering.
            </p>
          </section>
        </div>
        <ContactForm email={brand.contact.email} />
      </div>
    </div>
  );
}

function Sizing({ brand }: { brand: Brand }) {
  return (
    <div className="content-page container">
      <PageHeader
        eyebrow="Made for your everyday"
        title="Find your fit."
        description="A good fit makes all the difference. Use the measurements below alongside the fit notes on each product page."
      />
      {brand.sizeGuides.map((guide) => (
        <SizeGuide key={guide.id} guide={guide} />
      ))}
      <div className="content-copy content-copy--narrow">
        <h2>Still deciding?</h2>
        <p>
          Compare these measurements with a similar piece you already love. Each
          product page explains the intended fit and includes model information
          where available. Measurements can vary slightly between garments.
        </p>
        <Link href="/contact" className="editorial-text-link">
          Ask us about sizing
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function Shipping({ brand }: { brand: Brand }) {
  const money = (amount: number) =>
    formatPrice(amount, brand.currency, brand.locale);
  return (
    <div className="content-page container">
      <PageHeader
        eyebrow="The details, made simple"
        title="Shipping & returns."
        description="Everything you need to know about getting your pieces home and finding the right fit."
      />
      <p className="content-note">
        Demo storefront: the delivery prices and return window below are example
        settings. No purchases, shipments, or returns are processed through this
        site.
      </p>
      <div className="content-page__columns">
        <div className="content-copy">
          <section>
            <h2>On its way to you.</h2>
            <p>{brand.shipping.summary}</p>
            <h3>{brand.shipping.standardLabel}</h3>
            <p>
              {money(brand.shipping.standardPrice)}. Complimentary for orders of{" "}
              {money(brand.freeShippingThreshold)} or more, before delivery
              charges.
            </p>
            <h3>{brand.shipping.expressLabel}</h3>
            <p>
              {money(brand.shipping.expressPrice)}. Select your preferred
              delivery option during checkout.
            </p>
            <h3>Delivery address</h3>
            <p>
              The demo checkout supports delivery to {brand.country}. Check the
              address and postcode before placing a demo order.
            </p>
          </section>
          <section>
            <h2>Order updates.</h2>
            <p>
              Your demo order summary appears after checkout. This template does
              not send confirmation emails or provide live parcel tracking.
            </p>
          </section>
        </div>
        <div className="content-copy">
          <section>
            <h2>Room to reconsider.</h2>
            <p>{brand.returns.summary}</p>
            <h3>The returns window</h3>
            <p>
              The example return window is {brand.returns.windowDays} days from
              delivery. Pieces should be unworn and unwashed, with their
              original tags attached.
            </p>
            <h3>Start a return</h3>
            <p>
              For a live store, contact{" "}
              <a href={`mailto:${brand.contact.email}`}>
                {brand.contact.email}
              </a>{" "}
              with your order number and the pieces you would like to return.
              Return postage, exclusions, and refund timing must be confirmed in
              the merchant’s published policy.
            </p>
            <h3>Exchanges</h3>
            <p>
              Availability varies by size and colour. A live store will confirm
              whether an exchange or a return and new order is possible.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Privacy({ brand }: { brand: Brand }) {
  return (
    <div className="content-page container">
      <PageHeader
        eyebrow="Your information"
        title="Privacy policy."
        description="Clear information about how this demonstration storefront handles data."
      />
      <div className="content-copy content-copy--narrow">
        <p className="content-note">
          This is a template privacy notice for the {brand.name} demo. A
          merchant must replace it with a policy that accurately describes their
          business and connected services before launching a live store.
        </p>
        <section>
          <h2>What this demo stores</h2>
          <p>
            The cart and recently viewed product IDs are saved in your browser’s
            local storage so your selected items remain after a refresh. The
            checkout may save a demo order summary locally so it can be shown on
            the confirmation page. Clearing site data in your browser removes
            these records.
          </p>
          <p>
            Information entered in a contact form is used locally to prepare an
            email draft. It is not submitted to a customer support service.
            Newsletter and account interfaces are demonstrations, and no
            subscription or account is created.
          </p>
        </section>
        <section>
          <h2>Checkout information</h2>
          <p>
            This store does not process live payments. Do not enter real payment
            card details. The demo order flow is designed to show the intended
            checkout experience.
          </p>
          <p>
            Use fictional contact and address details when trying the demo. Any
            delivery details saved with a demo order remain in this browser and
            should be removed by clearing this site’s data on shared devices.
          </p>
        </section>
        <section>
          <h2>Services and cookies</h2>
          <p>
            This template does not include marketing analytics or advertising
            cookies. The hosting provider may process routine technical
            information needed to serve the site. Product and editorial imagery
            may be delivered through an image service.
          </p>
          <p>
            A live store must explain every service it connects, including
            payments, analytics, email, customer accounts, and fulfilment, and
            implement consent choices wherever needed.
          </p>
        </section>
        <section>
          <h2>Questions and requests</h2>
          <p>
            The contact configured for this demo is{" "}
            <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>.
            For a live store, the merchant’s final policy should explain how to
            request access, correction, or deletion and how long information is
            retained.
          </p>
        </section>
      </div>
    </div>
  );
}

function Terms({ brand }: { brand: Brand }) {
  return (
    <div className="content-page container">
      <PageHeader
        eyebrow="A shared understanding"
        title="Terms & conditions."
        description="The terms of using this demonstration storefront."
      />
      <div className="content-copy content-copy--narrow">
        <p className="content-note">
          These are example terms for the {brand.name} template. They describe
          demo behaviour and must be replaced with the merchant’s own reviewed
          terms before a live launch.
        </p>
        <section>
          <h2>A demonstration store</h2>
          <p>
            {brand.name} is a fictional brand presented to demonstrate a
            clothing storefront. Products, stock levels, delivery estimates, and
            prices are examples. Completing checkout creates a demo order only;
            it does not enter a purchase contract or arrange a shipment.
          </p>
        </section>
        <section>
          <h2>Products and prices</h2>
          <p>
            Prices are displayed in {brand.currency}. Product photography is
            illustrative; colours can appear differently on different screens.
            Size and fit information is supplied as example data and can vary by
            product.
          </p>
          <p>
            Inventory is simulated at the variant level. Selecting an available
            size and colour in this demo does not reserve actual stock.
          </p>
        </section>
        <section>
          <h2>Payments and orders</h2>
          <p>
            No payment is taken. Card payments and digital wallet options are
            placeholders. Never enter real financial information into this
            demonstration.
          </p>
          <p>
            Before going live, the merchant must publish their full business
            details, order acceptance process, payment terms, tax treatment,
            cancellation rights, and delivery commitments.
          </p>
        </section>
        <section>
          <h2>Delivery and returns</h2>
          <p>
            The <Link href="/shipping-returns">shipping & returns page</Link>{" "}
            displays configurable example settings. These examples do not create
            a delivery commitment or a real returns service.
          </p>
        </section>
        <section>
          <h2>Using the site</h2>
          <p>
            You may browse and test the intended shopping flow. Do not use the
            forms to submit sensitive personal information. Links to external
            services are subject to those services’ own terms.
          </p>
          <p>
            For information about local data, read the{" "}
            <Link href="/privacy">privacy policy</Link>. The configured contact
            is{" "}
            <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { page } = await params;
  if (!Object.hasOwn(pageTitles, page)) notFound();
  const brand = await getBrandConfig();
  switch (page) {
    case "contact":
      return <Contact brand={brand} />;
    case "size-guide":
      return <Sizing brand={brand} />;
    case "shipping-returns":
      return <Shipping brand={brand} />;
    case "privacy":
      return <Privacy brand={brand} />;
    case "terms":
      return <Terms brand={brand} />;
    default:
      notFound();
  }
}
