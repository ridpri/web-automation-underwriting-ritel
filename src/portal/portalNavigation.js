export const PORTAL_MENU_KEYS = ["dashboard", "policies", "claims", "cart", "help", "settings"];

export const PORTAL_MENU_SLUGS = {
  dashboard: "dashboard",
  policies: "polis-saya",
  claims: "klaim-saya",
  cart: "keranjang",
  help: "bantuan",
  settings: "setelan",
};

export function normalizePortalMenu(value, fallback = "dashboard") {
  if (PORTAL_MENU_KEYS.includes(value)) return value;
  return Object.entries(PORTAL_MENU_SLUGS).find(([, slug]) => slug === value)?.[0] || fallback;
}

export function portalMenuSlug(menu) {
  return PORTAL_MENU_SLUGS[normalizePortalMenu(menu)];
}

export function readPortalMenu(defaultTab) {
  if (typeof window === "undefined") return normalizePortalMenu(defaultTab);
  const params = new URLSearchParams(window.location.search);
  const pathSlug = window.location.pathname.split("/").filter(Boolean).pop();
  return normalizePortalMenu(params.get("menu") || pathSlug || defaultTab);
}

export function writePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = `/${portalMenuSlug(menu)}`;
  nextUrl.searchParams.delete("menu");
  window.history.pushState({}, "", nextUrl);
}

export function replacePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = `/${portalMenuSlug(menu)}`;
  nextUrl.searchParams.delete("menu");
  window.history.replaceState({}, "", nextUrl);
}
