"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import "./content.css";

export function ContactForm({ email }: { email: string }) {
  const [message, setMessage] = useState<{
    name: string;
    email: string;
    subject: string;
    body: string;
  } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage({
      name: String(form.get("name")),
      email: String(form.get("email")),
      subject: String(form.get("subject")),
      body: String(form.get("message")),
    });
  }

  if (message) {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(`${message.body}\n\n${message.name}\n${message.email}`)}`;
    return (
      <div className="contact-form__success" role="status">
        <Check size={28} strokeWidth={1.5} aria-hidden="true" />
        <h2>Your message is ready, {message.name.split(" ")[0]}.</h2>
        <p>
          This demo has prepared your message locally. Nothing has been sent or
          stored. You can open it in your email app below.
        </p>
        <a className="button" href={mailto}>
          Open email app
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <button
          className="catalog-filter-clear"
          style={{ display: "block", marginTop: 20 }}
          type="button"
          onClick={() => setMessage(null)}
        >
          Start another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Your name
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          placeholder="Full name"
        />
      </label>
      <label>
        Email address
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
        />
      </label>
      <label>
        What can we help with?
        <select name="subject" defaultValue="Product question">
          <option>Product question</option>
          <option>A website for my business</option>
          <option>Order management & Google Shopping</option>
          <option>Sizing & fit</option>
          <option>Shipping & returns</option>
          <option>Press & partnerships</option>
          <option>Something else</option>
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={3000}
          placeholder="Tell us a little more…"
          rows={5}
        />
      </label>
      <p>
        This is a demo contact form. Your message is prepared in this browser
        and can be opened in your email app.
      </p>
      <button type="submit" className="button">
        Prepare message
        <ArrowUpRight size={14} aria-hidden="true" />
      </button>
    </form>
  );
}
