import { ClipboardList, CreditCard, FileText, Gauge, Settings, Shield, ShoppingCart, User } from "lucide-react";

export const STAFF_NAV_ITEMS = [
  { key: "dashboard", slug: "dashboard", label: "Dashboard", icon: Gauge },
  { key: "tasklist", slug: "tasklist", label: "Tasklist", icon: ClipboardList, badge: 5 },
  { key: "buat-penawaran", slug: "buat-penawaran", label: "Penawaran", icon: ShoppingCart },
  { key: "add-partner", slug: "add-partner", label: "Add Partner", icon: User },
  { key: "promotion", slug: "promotion", label: "Promosi", icon: CreditCard },
  { key: "transaksi-polis", slug: "transaksi-polis", label: "Transaksi Polis", icon: Shield },
  { key: "riwayat-klaim", slug: "riwayat-klaim", label: "Riwayat Klaim", icon: FileText },
  { key: "add-user", slug: "add-user", label: "Add User", icon: User },
  { key: "master-data", slug: "master-data", label: "Master Data", icon: Settings },
  { key: "settings", slug: "setelan", label: "Setelan", icon: Settings },
];

const PORTAL_MENU_KEYS = STAFF_NAV_ITEMS.map((item) => item.key);
const PORTAL_MENU_SLUGS = STAFF_NAV_ITEMS.reduce((map, item) => ({ ...map, [item.key]: item.slug }), {});
const STAFF_WORKSPACE_BASE_PATH = "/dashboard";

export function normalizePortalMenu(value, fallback = "dashboard") {
  if (PORTAL_MENU_KEYS.includes(value)) return value;
  return Object.entries(PORTAL_MENU_SLUGS).find(([, slug]) => slug === value)?.[0] || fallback;
}

function portalMenuSlug(menu) {
  return PORTAL_MENU_SLUGS[normalizePortalMenu(menu)];
}

export function readPortalMenuFromUrl(urlInput, defaultTab) {
  const url = urlInput instanceof URL ? urlInput : new URL(urlInput, "http://localhost/");
  const pathSlug = url.pathname.split("/").filter(Boolean).pop();
  const menuParam = url.searchParams.get("menu");
  const journey = url.searchParams.get("journey");
  const pathMenu = journey === "internal-workspace" ? "" : pathSlug;
  return normalizePortalMenu(menuParam || pathMenu || defaultTab);
}

export function portalMenuUrlFromUrl(urlInput, menu) {
  const nextUrl = urlInput instanceof URL ? new URL(urlInput.toString()) : new URL(urlInput, "http://localhost/");
  const normalizedMenu = normalizePortalMenu(menu);
  nextUrl.pathname = STAFF_WORKSPACE_BASE_PATH;
  if (normalizedMenu === "dashboard") nextUrl.searchParams.delete("menu");
  else nextUrl.searchParams.set("menu", normalizedMenu);
  return nextUrl;
}

export function readPortalMenu(defaultTab) {
  if (typeof window === "undefined") return normalizePortalMenu(defaultTab);
  return readPortalMenuFromUrl(window.location.href, defaultTab);
}

export function writePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = portalMenuUrlFromUrl(window.location.href, portalMenuSlug(menu));
  window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
}

export function replacePortalMenu(menu) {
  if (typeof window === "undefined") return;
  const nextUrl = portalMenuUrlFromUrl(window.location.href, portalMenuSlug(menu));
  window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
}
