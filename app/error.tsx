"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-page container">
      <p className="eyebrow">A SMALL INTERRUPTION</p>
      <h1>Let’s try that again.</h1>
      <p>Something went wrong while loading this page.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
