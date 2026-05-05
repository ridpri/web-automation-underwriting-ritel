export const ROUTE_DEFINITIONS = [
  { path: "/workspace", journey: "internal-workspace", sessionRole: "internal" },
  { path: "/review", journey: "review-internal", sessionRole: "internal" },
  { path: "/admin/partner-config", journey: "partner-config", sessionRole: "internal" },

  { path: "/internal/property", journey: "property-internal", sessionRole: "internal" },
  { path: "/internal/property-all-risk", journey: "property-all-risk-internal", sessionRole: "internal" },
  { path: "/internal/motor", journey: "motor-internal", sessionRole: "internal" },
  { path: "/internal/car-tlo", journey: "car-tlo-internal", sessionRole: "internal" },
  { path: "/internal/car-comprehensive", journey: "car-comp-internal", sessionRole: "internal" },

  { path: "/external/property", journey: "property-external", sessionRole: "external" },
  { path: "/external/property-all-risk", journey: "property-all-risk-external", sessionRole: "external" },
  { path: "/external/motor", journey: "motor-external", sessionRole: "external" },
  { path: "/external/car-tlo", journey: "car-tlo-external", sessionRole: "external" },

  { path: "/guest/property", journey: "property-external", sessionRole: "guest" },
  { path: "/guest/property-all-risk", journey: "property-all-risk-external", sessionRole: "guest" },
  { path: "/guest/motor", journey: "motor-external", sessionRole: "guest" },
  { path: "/guest/car-tlo", journey: "car-tlo-external", sessionRole: "guest" },

  { path: "/offer/property", journey: "property-external", sessionRole: "guest", offer: true },
  { path: "/offer/property-all-risk", journey: "property-all-risk-external", sessionRole: "guest", offer: true },
  { path: "/offer/motor", journey: "motor-external", sessionRole: "guest", offer: true },
  { path: "/offer/car-tlo", journey: "car-tlo-external", sessionRole: "guest", offer: true },

  { path: "/self-care", journey: "self-care-portal", sessionRole: "external" },
  { path: "/self-care/lookup", journey: "self-care-lookup", sessionRole: "guest" },
  { path: "/brd/property-safe", journey: "brd-property-safe", sessionRole: "internal" },
];

const PATH_ROUTE_LOOKUP = new Map(ROUTE_DEFINITIONS.map((route) => [route.path, route]));

function normalizePath(pathname = "/") {
  const normalized = String(pathname || "/").replace(/\/+$/g, "") || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function resolveRouteFromPath(pathname = "/") {
  return PATH_ROUTE_LOOKUP.get(normalizePath(pathname)) || null;
}

function hasOfferContext(searchParams) {
  return Boolean(searchParams?.get("view") || searchParams?.get("offer") || searchParams?.get("share"));
}

export function getCanonicalPathForJourney(journey, sessionRole = "guest", searchParams = new URLSearchParams()) {
  if (!journey) return "/";
  if (hasOfferContext(searchParams)) {
    const offerRoute = ROUTE_DEFINITIONS.find((item) => item.journey === journey && item.offer);
    if (offerRoute) return offerRoute.path;
  }
  const route = ROUTE_DEFINITIONS.find((item) => {
    if (item.journey !== journey) return false;
    if (item.offer) return false;
    return item.sessionRole === sessionRole;
  });
  if (route) return route.path;

  const fallback = ROUTE_DEFINITIONS.find((item) => item.journey === journey && !item.offer);
  return fallback?.path || "/";
}

export function shouldKeepRoleQuery(sessionRole, canonicalPath) {
  if (sessionRole === "partner") return true;
  const route = resolveRouteFromPath(canonicalPath);
  return Boolean(sessionRole && route && route.sessionRole !== sessionRole);
}
