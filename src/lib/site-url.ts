/**
 * The canonical production URL, used to build OAuth redirect URIs
 * (Bouncie, DocuSign, PandaDoc) and anything else that needs an
 * absolute, environment-correct link back to this app.
 *
 * Deliberately the single source of truth for this, rather than each
 * integration keeping its own separate `*_REDIRECT_URI` env var — those
 * drift out of sync with the actual deployed domain (e.g. left pointing
 * at localhost after moving to production) with nothing to catch it,
 * since the OAuth provider just redirects wherever it's told.
 */
export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  }
  return siteUrl;
}
