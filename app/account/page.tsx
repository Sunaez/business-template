import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Package,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { demoAdmin, demoCustomer } from "@/data/accounts";
import { getBrandConfig } from "@/lib/catalog";

export default async function AccountPage() {
  const brand = await getBrandConfig();
  return (
    <div className="account-entry container">
      <div className="account-entry__intro">
        <p className="eyebrow">Your space at {brand.name}</p>
        <h1>
          Good to have
          <br />
          you here.
        </h1>
        <p>
          A place for your favourites. A little order for your everyday. Explore
          the store from either side.
        </p>
        <div className="account-entry__image">
          <Image
            src={brand.story.image.src}
            alt={brand.story.image.alt}
            fill
            sizes="(max-width: 800px) 90vw, 45vw"
            loading="lazy"
          />
          <span>Considered, in every detail.</span>
        </div>
      </div>
      <div className="account-entry__choices">
        <div className="account-section-heading">
          <p className="eyebrow">Choose a demo account</p>
          <span className="account-demo-tag">Demo preview</span>
        </div>
        <p className="account-entry__note">
          Two perspectives. One considered experience.
          <br />
          No password needed — just step inside.
        </p>
        <Link
          className="account-choice"
          href="/account/customer"
          prefetch={false}
        >
          <div className="account-choice__top">
            <UserRound size={23} strokeWidth={1.3} aria-hidden="true" />
            <span className="eyebrow">01 / The customer</span>
          </div>
          <h2>Make yourself at home.</h2>
          <p>
            Your orders, saved pieces and the details that make shopping feel
            personal.
          </p>
          <div className="account-choice__features">
            <span>
              <Package size={14} aria-hidden="true" />
              Orders & tracking
            </span>
            <span>
              <Heart size={14} aria-hidden="true" />
              Wishlist
            </span>
          </div>
          <div className="account-choice__bottom">
            <span>
              <strong>{demoCustomer.name}</strong>
              <small>{demoCustomer.email}</small>
            </span>
            <span className="account-choice__action">
              Explore customer <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
        </Link>
        <Link
          className="account-choice account-choice--admin"
          href="/account/admin"
          prefetch={false}
        >
          <div className="account-choice__top">
            <SlidersHorizontal size={23} strokeWidth={1.3} aria-hidden="true" />
            <span className="eyebrow">02 / The admin</span>
          </div>
          <h2>Behind the storefront.</h2>
          <p>
            A clear view of your business. Look after orders, keep stock in
            check and get to know your customers.
          </p>
          <div className="account-choice__bottom">
            <span>
              <strong>{demoAdmin.name}</strong>
              <small>{demoAdmin.email}</small>
            </span>
            <span className="account-choice__action">
              Explore admin <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
        </Link>
        <p className="account-entry__footnote">
          Fictional accounts and sample data. Changes reset on refresh.
        </p>
        <Link className="text-link" href="/shop">
          Back to the collection <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
