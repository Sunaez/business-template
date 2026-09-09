import { useStorefront } from "@/components/commerce/StorefrontProvider";
import type { DemoAddress } from "@/types/account";
import { MapPin, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useAccountCustomer } from "../AccountProviders";
import { SectionHeading, TextButton } from "../shared/AccountPrimitives";
import { OverlayLoading } from "@/components/ui/OverlayLoading";

const AddressDrawer = dynamic(
  () => import("./AddressDrawer").then((module) => module.AddressDrawer),
  { loading: OverlayLoading },
);

export function AddressesSection({
  onNotice,
}: {
  onNotice: (message: string) => void;
}) {
  const { brand } = useStorefront();
  const { addresses, profile, removeAddress, makeDefault } =
    useAccountCustomer();
  const [editing, setEditing] = useState<DemoAddress>();
  const addAddress = () =>
    setEditing({
      id: "",
      label: "",
      isDefault: !addresses.length,
      fullName: profile.name,
      line1: "",
      city: "",
      postcode: "",
      country: brand.country === "GB" ? "United Kingdom" : brand.country,
    });
  return (
    <>
      <SectionHeading
        title="Saved addresses"
        action={<TextButton onClick={addAddress}>Add address</TextButton>}
      />
      <div className="account-address-grid">
        {addresses.map((address) => (
          <article className="account-address-card" key={address.id}>
            <div className="account-section-heading">
              <MapPin size={21} strokeWidth={1.4} aria-hidden="true" />
              {address.isDefault && (
                <span className="account-demo-tag">Default delivery</span>
              )}
            </div>
            <h2>{address.label}</h2>
            <address>
              {address.fullName}
              <br />
              {address.line1}
              <br />
              {address.line2 && (
                <>
                  {address.line2}
                  <br />
                </>
              )}
              {address.city}, {address.postcode}
              <br />
              {address.country}
            </address>
            <div className="account-address-card__actions">
              <TextButton onClick={() => setEditing(address)}>
                Edit address
              </TextButton>
              {!address.isDefault && (
                <button
                  className="account-text-button"
                  type="button"
                  onClick={() => {
                    makeDefault(address.id);
                    onNotice(`${address.label} is now your default address.`);
                  }}
                >
                  Make default
                </button>
              )}
              <button
                className="icon-button"
                aria-label={`Remove ${address.label} address`}
                type="button"
                onClick={() => {
                  removeAddress(address.id);
                  onNotice(`${address.label} address removed.`);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
        <button
          className="account-add-address"
          type="button"
          onClick={addAddress}
        >
          <Plus size={24} strokeWidth={1.2} aria-hidden="true" />
          <span>Add another address</span>
        </button>
      </div>
      {editing && (
        <AddressDrawer
          address={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(label) => {
            setEditing(undefined);
            onNotice(`${label} address saved for this demo.`);
          }}
        />
      )}
    </>
  );
}
