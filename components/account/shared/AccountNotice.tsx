import { Check } from "lucide-react";

export function AccountNotice({
  message,
  onUndo,
}: {
  message: string;
  onUndo?: () => void;
}) {
  return (
    <div role="status" className={message ? "account-notice" : "sr-only"}>
      {message && (
        <>
          <Check size={15} aria-hidden="true" />
          {message}
          {onUndo && (
            <button type="button" onClick={onUndo}>
              Undo
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function AccountSectionLoading() {
  return (
    <div
      className="account-section-loading"
      role="status"
      aria-label="Loading account section"
    >
      <div className="loading-title" />
      <div className="account-section-loading__rows" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="sr-only">Loading your account section…</span>
    </div>
  );
}
