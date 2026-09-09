import { Drawer } from "@/components/ui/Drawer";
import type { DemoAddress } from "@/types/account";
import { Check } from "lucide-react";
import { useState } from "react";
import { useAccountCustomer } from "../AccountProviders";

const fields = [
  { key: "label", label: "Address label", autoComplete: "off", required: true },
  { key: "fullName", label: "Full name", autoComplete: "name", required: true },
  {
    key: "line1",
    label: "Address line 1",
    autoComplete: "address-line1",
    required: true,
  },
  {
    key: "line2",
    label: "Address line 2",
    autoComplete: "address-line2",
    required: false,
  },
  {
    key: "city",
    label: "City",
    autoComplete: "address-level2",
    required: true,
  },
  {
    key: "postcode",
    label: "Postcode",
    autoComplete: "postal-code",
    required: true,
  },
  {
    key: "country",
    label: "Country",
    autoComplete: "country-name",
    required: true,
  },
] as const;

export function AddressDrawer({
  address,
  onClose,
  onSaved,
}: {
  address: DemoAddress;
  onClose: () => void;
  onSaved: (label: string) => void;
}) {
  const { saveAddress } = useAccountCustomer();
  const [error, setError] = useState("");
  return (
    <Drawer
      open
      onClose={onClose}
      title={address.id ? "Edit address" : "Add address"}
    >
      <form
        className="account-form account-drawer-body"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const text = (key: string) => String(data.get(key) ?? "").trim();
          const result = saveAddress({
            ...address,
            label: text("label"),
            fullName: text("fullName"),
            line1: text("line1"),
            line2: text("line2"),
            city: text("city"),
            postcode: text("postcode"),
            country: text("country"),
          });
          if (result.ok) onSaved(text("label"));
          else setError(result.message);
        }}
      >
        <p className="muted">A few details for your next delivery.</p>
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              name={field.key}
              defaultValue={address[field.key]}
              required={field.required}
              maxLength={120}
              autoComplete={field.autoComplete}
            />
          </label>
        ))}
        {error && (
          <p role="alert" className="account-form-error">
            {error}
          </p>
        )}
        <button className="button" type="submit">
          Save address
          <Check size={15} aria-hidden="true" />
        </button>
      </form>
    </Drawer>
  );
}
