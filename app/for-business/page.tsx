import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getBrandConfig, getProducts } from "@/lib/catalog";
import {
  businessService,
  managedPlans,
  priceExplanations,
  onboardingSteps,
  businessFaqs,
  businessCaseStudies,
} from "@/data/business";
import {
  BusinessCta,
  PricingCard,
  CaseStudy,
} from "@/components/business/BusinessPrimitives";
import {
  StorePreview,
  DashboardPreview,
} from "@/components/business/BusinessPreviews";

export const metadata: Metadata = {
  title: {
    absolute: `Websites for independent businesses | ${businessService.name}`,
  },
  description:
    "A product showcase or a managed online shop, with personal setup and support. Compare indicative prices and talk directly to the person building your website.",
  openGraph: {
    title: businessService.headline.replace("\n", " "),
    description: businessService.description,
  },
};

export default async function BusinessPage() {
  const [brand, products] = await Promise.all([
    getBrandConfig(),
    getProducts(),
  ]);
  return (
    <div className="biz biz-landing biz-compact">
      <section className="biz-hero">
        <div className="biz-hero-copy">
          <p className="eyebrow">YOUR BUSINESS. MY PERSONAL ATTENTION.</p>
          <h1>{businessService.headline}</h1>
          <p className="biz-lead">{businessService.description}</p>
          <div className="biz-actions">
            <a className="biz-button" href="#pricing">
              Compare options & prices{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <BusinessCta secondary>Get my store online</BusinessCta>
          </div>
          <p className="biz-hero-note">
            <Check size={16} aria-hidden="true" /> You run your business. I’ll
            deal with the website.
          </p>
        </div>
        <StorePreview brand={brand} products={products} />
        <div className="biz-hero-foot">
          <span>ONE PERSON TO BUILD IT. ONE PERSON TO CALL.</span>
          <Link href="/shop">
            See a working store <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className="biz-section biz-pricing-options"
        id="pricing"
        aria-labelledby="pricing-title"
      >
        <div className="biz-section-heading">
          <p className="eyebrow">CHOOSE WHAT YOUR BUSINESS ACTUALLY NEEDS</p>
          <h2 id="pricing-title">A clear price. A clear purpose.</h2>
          <p>
            Just want to show your products? Start with a showcase. Want people
            to buy online? Choose a managed shop. I’ll help you choose the
            simplest option that does the job.
          </p>
          <p className="biz-small">
            Example starting prices — I’ll confirm your full quote before you
            decide.
          </p>
        </div>
        <div className="biz-plan-grid">
          {managedPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        <div className="biz-cost-explanation" id="included">
          <h3>What are you paying for?</h3>
          <div className="biz-three-columns">
            {priceExplanations.map((item) => (
              <article key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
        <details className="biz-price-detail">
          <summary>
            Will it be worth the cost for my business?
            <span aria-hidden="true">+</span>
          </summary>
          <div>
            <p>
              The useful question is whether the extra business and time saved
              justify the full cost. For a showcase, that might mean more
              qualified enquiries or visits to your shop. For online sales, look
              at what each extra order leaves after product costs, payment fees
              and fulfilment.
            </p>
            <p>
              I’ll help you compare a realistic goal with the quote, including
              setup costs, monthly care and any promotion budget. A website
              needs people to find it, a product they want and a clear reason to
              buy. A launch alone does not ensure sales.
            </p>
            <p>
              <strong>If it is not working:</strong> I’ll discuss the available
              evidence and what could change. Technical care covers the agreed
              maintenance and support; marketing, ongoing conversion work and
              extra features need their own scope. Monthly fees are for that
              work, not a guarantee of revenue.
            </p>
          </div>
        </details>
        <p className="biz-small biz-section-note">
          Already have a website? I can quote for specific changes or ongoing
          help after reviewing it. {businessService.contractNote}
        </p>
      </section>

      <section
        className="biz-section biz-demo biz-demo-consolidated"
        id="demo"
        aria-labelledby="demo-title"
      >
        <div>
          <p className="eyebrow">TRY THE WORK, BEFORE THE CONVERSATION</p>
          <h2 id="demo-title">Picture your products here.</h2>
          <p>
            {brand.name} is my working demonstration shop. Try the catalogue,
            sizes, colours, filters and bag. A showcase would use the product
            presentation without checkout or a management dashboard.
          </p>
          <Link href="/shop" className="biz-text-link">
            Browse the {brand.name} demo{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="biz-demo-details">
          <h3>See both sides of an online shop</h3>
          <p>
            Customers get a clear shopping journey. You get a place to review
            orders and stock. The sample dashboard lets you explore orders,
            dispatch statuses and stock adjustments.
          </p>
          <Link href="/account/admin" className="biz-text-link">
            Try the business dashboard{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <p className="biz-small biz-disclosure">
            Demo only: no payments are taken. Live orders, authenticated
            accounts, product editing, analytics and shared stock require
            production setup. Dashboard changes reset when you leave.
          </p>
        </div>
        <details className="biz-dashboard-disclosure">
          <summary>
            Preview the order & stock dashboard<span aria-hidden="true">+</span>
          </summary>
          <DashboardPreview brand={brand} products={products} />
        </details>
      </section>

      <section
        className="biz-section biz-process"
        id="how-it-works"
        aria-labelledby="process-title"
      >
        <div className="biz-section-heading">
          <p className="eyebrow">PERSONAL SERVICE, WITH A PLAN</p>
          <h2 id="process-title">
            I build it. I look after it.
            <br />
            You know who to call.
          </h2>
          <p>
            I’m one person, and you deal directly with me. My job is to make the
            technical side manageable and help you give the website a useful
            role in your business.
          </p>
        </div>
        <ol className="biz-three-columns">
          {onboardingSteps.map((step, index) => (
            <li key={step.title}>
              <span className="biz-step">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="biz-small biz-section-note">
          I can commit to the work, checks and support in your proposal. Sales
          also depend on your products, pricing, stock and how customers find
          you. I won’t promise a result I can’t control.
        </p>
      </section>

      {businessCaseStudies.length > 0 && (
        <section className="biz-section" aria-label="Client stories">
          <h2>Independent shops, online.</h2>
          {businessCaseStudies.map((study) => (
            <CaseStudy key={study.businessName} study={study} />
          ))}
        </section>
      )}

      <section
        className="biz-section biz-faq"
        id="questions"
        aria-labelledby="faq-title"
      >
        <div>
          <p className="eyebrow">BEFORE YOU DECIDE</p>
          <h2 id="faq-title">The practical questions.</h2>
          <BusinessCta secondary intent="consultation">
            Ask me about your business
          </BusinessCta>
        </div>
        <div>
          {businessFaqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="biz-section biz-final">
        <p className="eyebrow">LET’S START WITH YOUR SHOP</p>
        <h2>
          See what could work
          <br />
          for your business.
        </h2>
        <p>
          Send me your business name, Instagram or website. I’ll talk it through
          with you and agree a useful preview before you commit. No polished
          brief needed.
        </p>
        <div className="biz-actions">
          <BusinessCta intent="preview">
            Show me what my store could look like
          </BusinessCta>
          <Link
            className="biz-text-link"
            href="/for-business/start?intent=consultation"
          >
            Have a free conversation{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <p className="biz-small">
          The initial conversation is free. I’ll agree the preview scope and
          timing with you.
        </p>
      </section>
    </div>
  );
}
