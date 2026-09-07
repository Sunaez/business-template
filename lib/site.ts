/** A configured origin avoids trusting incoming Host headers in public feeds. */
export function getSiteOrigin(
  value = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
) {
  const url = new URL(value);
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path or credentials.",
    );
  }
  return url.origin;
}

export function isSiteIndexable() {
  return process.env.SITE_INDEXING_ENABLED === "true";
}
