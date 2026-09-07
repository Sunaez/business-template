"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Brand } from "@/types";

export function Newsletter({ brand }: { brand: Brand }) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <section className="newsletter-section">
      <div>
        <p className="eyebrow">{brand.newsletter.eyebrow}</p>
        <h2>{brand.newsletter.title}</h2>
        <p>{brand.newsletter.description}</p>
      </div>
      <div className="newsletter-form-wrap">
        {subscribed ? (
          <div className="newsletter-success" role="status">
            <Check size={22} />
            <div>
              <strong>{brand.newsletter.successTitle}</strong>
              <p>{brand.newsletter.successDescription}</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="newsletter-field">
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email address"
                autoComplete="email"
              />
              <button type="submit" aria-label="Subscribe to the newsletter">
                <ArrowRight size={23} />
              </button>
            </div>
            <p>
              {brand.newsletter.signupNote}{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
