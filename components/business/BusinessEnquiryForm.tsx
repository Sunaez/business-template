"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Download } from "lucide-react";
import {
  enquiryNeeds,
  sellingChannels,
  productCounts,
  validateBusinessEnquiry,
  enquiryDraft,
  type BusinessEnquiry,
  type EnquiryErrors,
} from "@/lib/business-enquiry";

export function BusinessEnquiryForm({
  intent,
  deliveryEnabled,
  initialNeed,
}: {
  intent: string;
  deliveryEnabled: boolean;
  initialNeed?: string;
}) {
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"draft" | "sent" | null>(null);
  const [draft, setDraft] = useState<BusinessEnquiry | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const submission = useRef({ payload: "", id: "" });

  function showErrors(next: EnquiryErrors, message: string) {
    setErrors(next);
    setError(message);
    const first = Object.keys(next)[0];
    const input = first && formRef.current?.elements.namedItem(first);
    if (input instanceof HTMLElement) {
      const details = input.closest("details");
      if (details) details.open = true;
      input.focus();
    } else requestAnimationFrame(() => errorRef.current?.focus());
  }

  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(
      new Blob([enquiryDraft(draft)], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-store-enquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = new FormData(event.currentTarget);
    const raw = {
      ...Object.fromEntries(form),
      needs: form.getAll("needs"),
      intent,
    };
    const validated = validateBusinessEnquiry(raw);
    setCopyStatus("");
    if (!validated.ok) {
      showErrors(validated.errors, "Please check the highlighted details.");
      return;
    }
    setErrors({});
    setError("");
    setDraft(validated.value);
    if (!deliveryEnabled) {
      setResult("draft");
      requestAnimationFrame(() => resultRef.current?.focus());
      return;
    }
    pending.current = true;
    setBusy(true);
    const payload = JSON.stringify(validated.value);
    if (submission.current.payload !== payload)
      submission.current = { payload, id: crypto.randomUUID() };
    try {
      const response = await fetch("/api/business-enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": submission.current.id,
        },
        body: payload,
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.json();
      if (!response.ok || body.ok !== true) {
        showErrors(
          body.errors ?? {},
          body.error ?? "Delivery could not be confirmed. Please try again.",
        );
        return;
      }
      setResult("sent");
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      showErrors(
        {},
        "Delivery could not be confirmed. Your details are still here. Check your connection and try again, or save a copy.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function fieldError(name: keyof BusinessEnquiry) {
    return errors[name] ? (
      <span className="biz-field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  }
  function attributes(name: keyof BusinessEnquiry) {
    const labels: Partial<Record<keyof BusinessEnquiry, string>> = {
      businessName: "Business name",
      contactName: "Your name",
      email: "Email address",
      sells: "What do you sell?",
      website: "Website",
      social: "Instagram or social profile",
      productCount: "Approximate number of products",
      channel: "Main selling channel",
      phone: "Phone number",
      message: "Anything else you’d like me to know?",
    };
    return {
      "aria-label": labels[name],
      "aria-invalid": errors[name] ? (true as const) : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <>
      <div
        hidden={!result}
        ref={resultRef}
        tabIndex={-1}
        className="biz-confirmation"
      >
        {result && (
          <>
            <Check size={30} aria-hidden="true" />
            <h2>
              {result === "sent"
                ? "Your enquiry is on its way."
                : "Your enquiry is ready. Not sent yet."}
            </h2>
            <p>
              {result === "sent"
                ? "Your details have been accepted by my enquiry service. I’ll review your business and contact you using the details you provided to discuss the next step."
                : "Enquiry delivery isn’t connected in this preview. You can review, copy or download your details below. No one has received this enquiry."}
            </p>
            {result === "draft" && draft && (
              <>
                <label htmlFor="enquiry-draft" className="sr-only">
                  Your enquiry draft
                </label>
                <textarea
                  id="enquiry-draft"
                  className="biz-draft"
                  readOnly
                  value={enquiryDraft(draft)}
                />
                <div className="biz-actions">
                  <button
                    className="biz-button"
                    type="button"
                    onClick={download}
                  >
                    Download my enquiry{" "}
                    <Download size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="biz-button biz-button--outline"
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          enquiryDraft(draft),
                        );
                        setCopyStatus("Copied to clipboard.");
                      } catch {
                        setCopyStatus(
                          "Copy isn’t available here. Select the draft above or download it instead.",
                        );
                      }
                    }}
                  >
                    Copy details
                  </button>
                  <button
                    className="biz-text-link"
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setCopyStatus("");
                      requestAnimationFrame(() => {
                        const input =
                          formRef.current?.elements.namedItem("businessName");
                        if (input instanceof HTMLElement) input.focus();
                      });
                    }}
                  >
                    Edit my details
                  </button>
                </div>
                <p role="status" className="biz-small">
                  {copyStatus}
                </p>
              </>
            )}
            <Link className="biz-text-link" href="/shop">
              Explore the working store{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
      <form
        ref={formRef}
        hidden={Boolean(result)}
        className="biz-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={busy}
      >
        <p className="biz-small">
          Four quick details to start. Everything else is optional.
        </p>
        {!deliveryEnabled && (
          <p className="biz-form-note">
            Preview mode: this form prepares an enquiry you can save. It does
            not send your details yet.
          </p>
        )}
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="biz-form-error"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="biz-honeypot" aria-hidden="true">
          <label>
            Leave this empty
            <input name="companyFax" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label>
          Business name
          <input
            name="businessName"
            autoComplete="organization"
            required
            maxLength={120}
            placeholder="The name above your door"
            {...attributes("businessName")}
          />
          {fieldError("businessName")}
        </label>
        <div className="biz-form-grid">
          <label>
            Your name
            <input
              name="contactName"
              autoComplete="name"
              required
              maxLength={100}
              {...attributes("contactName")}
            />
            {fieldError("contactName")}
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@yourshop.co.uk"
              {...attributes("email")}
            />
            {fieldError("email")}
          </label>
        </div>
        <label>
          What do you sell?
          <input
            name="sells"
            required
            maxLength={300}
            placeholder="For example, womenswear and accessories"
            {...attributes("sells")}
          />
          {fieldError("sells")}
        </label>
        <fieldset aria-describedby={errors.needs ? "needs-error" : undefined}>
          <legend>
            What would you like help with? <span>(optional)</span>
          </legend>
          <div className="biz-choice-grid">
            {enquiryNeeds.map((need) => (
              <label key={need}>
                <input
                  name="needs"
                  type="checkbox"
                  value={need}
                  defaultChecked={need === initialNeed}
                />
                {need}
              </label>
            ))}
          </div>
          {fieldError("needs")}
        </fieldset>
        <details>
          <summary>A little more about your business (optional)</summary>
          <div>
            <label>
              Website
              <input
                name="website"
                type="text"
                inputMode="url"
                autoComplete="url"
                maxLength={300}
                placeholder="yourshop.co.uk"
                {...attributes("website")}
              />
              {fieldError("website")}
            </label>
            <label>
              Instagram or social profile
              <input
                name="social"
                maxLength={300}
                placeholder="@yourshop or a profile link"
                {...attributes("social")}
              />
              {fieldError("social")}
            </label>
            <div className="biz-form-grid">
              <label>
                Approximate number of products
                <select
                  name="productCount"
                  defaultValue=""
                  {...attributes("productCount")}
                >
                  <option value="">Choose a range</option>
                  {productCounts.map((count) => (
                    <option key={count}>{count}</option>
                  ))}
                </select>
                {fieldError("productCount")}
              </label>
              <label>
                Main selling channel
                <select
                  name="channel"
                  defaultValue=""
                  {...attributes("channel")}
                >
                  <option value="">Choose a channel</option>
                  {sellingChannels.map((channel) => (
                    <option key={channel}>{channel}</option>
                  ))}
                </select>
                {fieldError("channel")}
              </label>
            </div>
            <label>
              Phone number
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                {...attributes("phone")}
              />
              {fieldError("phone")}
            </label>
            <label>
              Anything else you’d like me to know?
              <textarea
                name="message"
                rows={4}
                maxLength={1500}
                placeholder="What’s working, what’s tricky, or what you have in mind."
                {...attributes("message")}
              />
              {fieldError("message")}
            </label>
          </div>
        </details>
        <p className="biz-small">
          By {deliveryEnabled ? "sending" : "preparing"} this enquiry, you’re
          asking about the service, not placing an order.{" "}
          <a className="biz-text-link" href="#enquiry-privacy">
            How your details are used
          </a>
        </p>
        <button type="submit" disabled={busy} className="biz-button">
          {busy
            ? "Sending your enquiry…"
            : deliveryEnabled
              ? "Send my enquiry"
              : "Prepare my enquiry"}
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
        {error && draft && (
          <button className="biz-text-link" type="button" onClick={download}>
            Save a copy of my enquiry <Download size={16} aria-hidden="true" />
          </button>
        )}
        <noscript>
          <p className="biz-form-note">
            Please enable JavaScript to prepare and review your enquiry.
          </p>
        </noscript>
      </form>
    </>
  );
}
