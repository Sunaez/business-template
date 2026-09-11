import type { Metadata } from "next";
import Link from "next/link";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";
import { getEnquiryDeliveryUrl } from "@/lib/business-delivery";
import { businessService, managedPlans } from "@/data/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: `Tell me about your shop | ${businessService.name}` },
  description:
    "Request a store preview or a free conversation about getting your independent business online.",
  openGraph: {
    title: "Let’s talk about your shop",
    description: "Tell me what you sell and what you need help with.",
  },
};

export default async function BusinessStartPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; plan?: string }>;
}) {
  const { intent, plan } = await searchParams;
  const selectedPlan = managedPlans.find((option) => option.id === plan);
  const selectedIntent =
    intent === "preview" || intent === "consultation" ? intent : "store";
  const deliveryEnabled = Boolean(getEnquiryDeliveryUrl());
  return (
    <div className="biz biz-section biz-enquiry">
      <Link className="biz-text-link biz-enquiry-back" href="/for-business">
        ← Back to the managed store service
      </Link>
      <div className="biz-enquiry-grid">
        <div className="biz-enquiry-intro">
          <p className="eyebrow">A SMALL FIRST STEP</p>
          <h1>
            {selectedIntent === "preview"
              ? "Let’s picture\nyour shop online."
              : "Tell me about\nyour shop."}
          </h1>
          <p>
            You don’t need a finished plan. Tell me what you sell and where
            you’d like a hand. I’ll take it from there.
          </p>
          <p className="biz-small">
            No commitment. No payment details. Just the start of a conversation.
          </p>
          <div className="biz-enquiry-next">
            <h2>What happens next?</h2>
            <ol>
              <li>I review your business and what you need.</li>
              <li>
                I discuss a store, a preview or help with your existing setup.
              </li>
              <li>You receive a clear scope and quote before deciding.</li>
            </ol>
          </div>
          <Link className="biz-text-link" href="/shop">
            Explore the demo while you think it over ↗
          </Link>
        </div>
        <div>
          <div className="biz-enquiry-panel" id="business-enquiry">
            <BusinessEnquiryForm
              key={`${selectedIntent}-${selectedPlan?.id ?? "none"}`}
              intent={selectedIntent}
              deliveryEnabled={deliveryEnabled}
              initialNeed={
                selectedPlan?.id === "showcase"
                  ? "Product showcase"
                  : selectedPlan
                    ? "New online store"
                    : undefined
              }
            />
          </div>
          <section
            className="biz-privacy"
            id="enquiry-privacy"
            aria-labelledby="enquiry-privacy-title"
          >
            <h2 id="enquiry-privacy-title">Your enquiry details</h2>
            <p>
              {deliveryEnabled
                ? "Your details are sent to my configured enquiry service to handle this request. This form does not subscribe you to marketing. I don’t save your answers in browser storage."
                : "In this preview, your details stay on this page. Nothing is sent to an enquiry service or saved in browser storage. A downloaded copy is saved only where you choose on your device."}{" "}
              Please don’t include passwords, payment details or customer
              information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
