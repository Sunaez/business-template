export default function Loading() {
  return (
    <div
      className="loading-page container"
      role="status"
      aria-label="Loading storefront"
    >
      <div className="loading-title" />
      <div className="loading-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
