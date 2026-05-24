import { SESSION_OPTIONS } from "./sessionConfig.js";

export const SESSION_ROLE_STORAGE_KEY = "underwriting-demo-session-role";
export const PRODUCT_REFERRAL_STORAGE_KEY = "underwriting-demo-product-referral";

const PUBLIC_URL_SESSION_ROLES = new Set(["external", "partner", "guest"]);
const PRODUCT_REFERRAL_TOKEN_PATTERN = /^[a-z0-9]{5}$/i;
const INTERNAL_ONLY_JOURNEYS = new Set([
  "review-internal",
  "internal-workspace",
  "property-internal",
  "property-all-risk-internal",
  "motor-internal",
  "car-tlo-internal",
  "car-comp-internal",
  "partner-config",
]);
const PUBLIC_GUEST_JOURNEYS = new Set([
  "property-external",
  "property-all-risk-external",
  "motor-external",
  "car-tlo-external",
  "self-care-portal",
  "self-care-lookup",
]);
const DISABLED_PUBLIC_JOURNEYS = new Set(["mobil-comp"]);
const SHARED_JOURNEY_QUERY_PARAMS = ["view", "viewer", "share", "referral", "sender", "customer", "offer", "step", "mode"];

function isValidSessionRole(value) {
  return SESSION_OPTIONS.some((item) => item.key === value);
}

function readStoredSessionRole() {
  if (typeof window === "undefined") return null;
  const storedRole = window.sessionStorage.getItem(SESSION_ROLE_STORAGE_KEY);
  return isValidSessionRole(storedRole) ? storedRole : null;
}

export function normalizeProductReferralUrlFromUrl(urlInput) {
  const url = urlInput instanceof URL ? new URL(urlInput.toString()) : new URL(urlInput, "http://localhost/");
  const pathParts = url.pathname.split("/").filter(Boolean);
  const token = pathParts.at(-1) || "";

  if (pathParts[0] !== "product" || pathParts.length < 4 || !PRODUCT_REFERRAL_TOKEN_PATTERN.test(token)) {
    return { changed: false, referralToken: "", url };
  }

  url.pathname = `/${pathParts.slice(0, -1).join("/")}/`;
  return { changed: true, referralToken: token, url };
}

export function normalizeProductReferralUrl() {
  if (typeof window === "undefined") return null;
  const result = normalizeProductReferralUrlFromUrl(window.location.href);
  if (!result.changed) return result;

  window.sessionStorage.setItem(
    PRODUCT_REFERRAL_STORAGE_KEY,
    JSON.stringify({
      token: result.referralToken,
      productPath: result.url.pathname,
      capturedAt: new Date().toISOString(),
    }),
  );
  window.history.replaceState({}, "", `${result.url.pathname}${result.url.search}${result.url.hash}`);
  return result;
}

export function resolveUrlSessionRole(value) {
  return PUBLIC_URL_SESSION_ROLES.has(value) ? value : null;
}

function decodeUrlShareToken(value) {
  if (!value) return null;
  try {
    const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + padding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function inferJourneyFromShareData(shareData) {
  if (shareData?.flowType === "carComp") return "mobil-comp";
  if (shareData?.flowType === "carTlo") return "car-tlo-external";
  if (shareData?.flowType === "motor") return "motor-external";
  return "";
}

export function hasMatchingShareContext(journey) {
  if (typeof window === "undefined" || !journey) return false;
  const params = new URLSearchParams(window.location.search);
  const shareJourney = inferJourneyFromShareData(decodeUrlShareToken(params.get("share") || ""));
  return Boolean(shareJourney && shareJourney === journey);
}

function inferSessionRoleFromJourney(journey) {
  if (!journey) return "guest";
  if (INTERNAL_ONLY_JOURNEYS.has(journey)) return "internal";
  if (PUBLIC_GUEST_JOURNEYS.has(journey)) return "guest";
  return "guest";
}

export function sanitizeJourneyForRole(journey, sessionRole, options = {}) {
  if (!journey) return "";
  if (DISABLED_PUBLIC_JOURNEYS.has(journey) && !options.allowSharedOfferJourney) return "";
  if (INTERNAL_ONLY_JOURNEYS.has(journey) && sessionRole !== "internal") return "";
  if (journey === "self-care-portal" && sessionRole === "guest") return "self-care-lookup";
  return journey;
}

export function resolveInitialNavigationState() {
  if (typeof window === "undefined") {
    return { activeJourney: "", sessionRole: "guest" };
  }

  normalizeProductReferralUrl();

  const params = new URLSearchParams(window.location.search);
  const shareJourney = inferJourneyFromShareData(decodeUrlShareToken(params.get("share") || ""));
  const propertyOfferViews = new Set(["offer-indicative", "offer-final", "external-underwriting", "payment"]);
  const propertyOfferJourney =
    propertyOfferViews.has(params.get("view") || "") && window.location.pathname.includes("/guest/property")
      ? "property-external"
      : "";
  const requestedJourney = params.get("journey") || shareJourney || propertyOfferJourney || "";
  const allowSharedOfferJourney = Boolean(shareJourney && requestedJourney === shareJourney);
  const requestedJourneyRole = requestedJourney ? inferSessionRoleFromJourney(requestedJourney) : null;
  const sessionRole =
    resolveUrlSessionRole(params.get("role"))
    || requestedJourneyRole
    || readStoredSessionRole()
    || "guest";

  return {
    activeJourney: sanitizeJourneyForRole(requestedJourney, sessionRole, { allowSharedOfferJourney }),
    sessionRole,
  };
}

export function isExternalUrl(value) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

export function clearSharedJourneyParamsFromUrl(urlInput) {
  const url = urlInput instanceof URL ? new URL(urlInput.toString()) : new URL(urlInput, "http://localhost/");
  SHARED_JOURNEY_QUERY_PARAMS.forEach((key) => {
    url.searchParams.delete(key);
  });
  return url;
}

export function normalizeJourneyEntryUrlFromUrl(urlInput, targetJourney) {
  const url = urlInput instanceof URL ? new URL(urlInput.toString()) : new URL(urlInput, "http://localhost/");
  if (targetJourney === "internal-workspace") {
    url.pathname = "/dashboard";
    url.searchParams.delete("menu");
  }
  return url;
}

export function normalizeJourneyEntryUrl(targetJourney) {
  if (typeof window === "undefined") return;
  const url = normalizeJourneyEntryUrlFromUrl(window.location.href, targetJourney);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function clearSharedJourneyParams() {
  if (typeof window === "undefined") return;
  const url = clearSharedJourneyParamsFromUrl(window.location.href);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function resolveRoleLabel(sessionRole) {
  if (sessionRole === "internal") return "Internal";
  if (sessionRole === "external") return "Eksternal";
  if (sessionRole === "partner") return "Partner";
  return "Tanpa Login";
}
