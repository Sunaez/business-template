import { Check } from "lucide-react";
import { useState } from "react";
import { useAccountCustomer } from "../AccountProviders";
import { SectionHeading } from "../shared/AccountPrimitives";

export function ProfileSection({
  onNotice,
}: {
  onNotice: (message: string) => void;
}) {
  const { profile, preferences, saveProfile } = useAccountCustomer();
  const [error, setError] = useState("");
  return (
    <form
      className="account-form account-details-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const result = saveProfile(
          String(data.get("name") ?? ""),
          String(data.get("email") ?? ""),
          { news: data.has("news"), restocks: data.has("restocks") },
        );
        setError(result.ok ? "" : result.message);
        if (result.ok) onNotice("Your demo account details have been saved.");
      }}
    >
      <SectionHeading title="A little about you" />
      <div className="account-form-grid">
        <label>
          Full name
          <input
            name="name"
            defaultValue={profile.name}
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            defaultValue={profile.email}
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
      </div>
      <div className="account-preferences">
        <SectionHeading
          title="Good things, occasionally."
          subtitle="Choose what you’d like to hear about."
        />
        <label className="account-checkbox">
          <input
            type="checkbox"
            name="news"
            defaultChecked={preferences.news}
          />
          <span>
            <strong>Studio notes & new collections</strong>
            <small>
              Fresh arrivals, stories and the occasional thoughtful edit.
            </small>
          </span>
        </label>
        <label className="account-checkbox">
          <input
            type="checkbox"
            name="restocks"
            defaultChecked={preferences.restocks}
          />
          <span>
            <strong>Back-in-stock updates</strong>
            <small>A heads-up when a favourite makes its return.</small>
          </span>
        </label>
      </div>
      {error && (
        <p role="alert" className="account-form-error">
          {error}
        </p>
      )}
      <button type="submit" className="button">
        Save changes
        <Check size={15} aria-hidden="true" />
      </button>
      <p className="account-fine-print">
        Demo preferences only. No emails or subscriptions are created.
      </p>
    </form>
  );
}
