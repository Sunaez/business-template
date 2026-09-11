"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { businessService } from "@/data/business";
import "./business.css";

/** Keep the existing server-rendered shop footer as a slot, not a client import. */
export function BusinessChrome({
  slot,
  children,
}: {
  slot: "header" | "footer";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/for-business" && !pathname.startsWith("/for-business/"))
    return children;
  if (slot === "footer")
    return (
      <footer className="biz biz-footer">
        <div>
          <Link className="biz-wordmark" href="/for-business">
            {businessService.name}
          </Link>
          <p>For independent shops. For the people behind them.</p>
        </div>
        <nav aria-label="Business footer">
          <Link href="/for-business/start">Business enquiries</Link>
          <Link href="/for-business/start#enquiry-privacy">
            Enquiry privacy
          </Link>
          <Link href="/">
            Explore the demo store <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
        <p className="biz-small">
          The storefront is a fictional demonstration brand. Service details and
          pricing are indicative until agreed in your proposal.
        </p>
      </footer>
    );
  return (
    <header className="biz biz-header">
      <Link className="biz-wordmark" href="/for-business">
        {businessService.name}
      </Link>
      <nav aria-label="Business navigation">
        <Link className="biz-header-pricing" href="/for-business#pricing">
          Pricing
        </Link>
        <Link className="biz-header-demo" href="/shop">
          View demo <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <Link
          className="biz-button"
          href={
            pathname.endsWith("/start")
              ? "#business-enquiry"
              : businessService.enquiryPath
          }
        >
          {pathname.endsWith("/start") ? "Your enquiry" : "Let’s talk"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
