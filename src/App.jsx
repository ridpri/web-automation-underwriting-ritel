import { Building2, Car, ChevronDown, Home, Plane, Shield } from "lucide-react";
import { LogIn, MapPin, Phone } from "lucide-react";
import { createElement, Suspense, useEffect, useMemo, useState } from "react";
import { OPERATING_QUEUE_SEED, buildTimelineEvent, statusTone } from "./operatingLayer.js";
import { PERSONAL_PRODUCTS } from "./app/catalogData.js";
import {
  CarCompInternalPrototype,
  CarTloInternalPrototype,
  InternalOperatingShell,
  MotorInternalPrototype,
  MotorLatestExact,
  PartnerConfigStudio,
  PropertySafeBrdPage,
  PropertyPrototype,
  ReviewWorkbench,
  SelfCarePortalBridge,
} from "./app/lazyJourneys.js";
import { resolveSessionName, resolveSessionProfile, SESSION_OPTIONS } from "./app/sessionConfig.js";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function isValidSessionRole(value) {
  return SESSION_OPTIONS.some((item) => item.key === value);
}

const SESSION_ROLE_STORAGE_KEY = "underwriting-demo-session-role";
const PUBLIC_URL_SESSION_ROLES = new Set(["external", "partner", "guest"]);
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

function readStoredSessionRole() {
  if (typeof window === "undefined") return null;
  const storedRole = window.sessionStorage.getItem(SESSION_ROLE_STORAGE_KEY);
  return isValidSessionRole(storedRole) ? storedRole : null;
}

function resolveUrlSessionRole(value) {
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

function hasMatchingShareContext(journey) {
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

function sanitizeJourneyForRole(journey, sessionRole, options = {}) {
  if (!journey) return "";
  if (DISABLED_PUBLIC_JOURNEYS.has(journey) && !options.allowSharedOfferJourney) return "";
  if (INTERNAL_ONLY_JOURNEYS.has(journey) && sessionRole !== "internal") return "";
  if (journey === "self-care-portal" && sessionRole === "guest") return "self-care-lookup";
  return journey;
}

function resolveInitialNavigationState() {
  if (typeof window === "undefined") {
    return { activeJourney: "", sessionRole: "guest" };
  }

  const params = new URLSearchParams(window.location.search);
  const shareJourney = inferJourneyFromShareData(decodeUrlShareToken(params.get("share") || ""));
  const propertyOfferViews = new Set(["offer-indicative", "offer-final", "external-underwriting", "payment"]);
  const propertyOfferJourney = propertyOfferViews.has(params.get("view") || "") && window.location.pathname.includes("/guest/property")
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

function isExternalUrl(value) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

function clearSharedJourneyParams() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  ["view", "viewer", "share", "referral", "sender", "customer", "offer"].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function ProductCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={item.active ? onClick : undefined}
      className={cls(
        "group relative h-[212px] overflow-hidden rounded-[10px] text-left transition sm:h-[228px] md:h-[252px]",
        item.active ? "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)]" : "cursor-not-allowed opacity-80",
      )}
    >
      <img src={item.image} alt={item.title} width="960" height="540" className="absolute inset-0 h-full w-full object-cover" />
      <div className={cls("absolute inset-0", item.active ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.24)_0%,rgba(15,23,42,0.18)_36%,rgba(15,23,42,0.74)_100%)]" : "bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.28)_36%,rgba(15,23,42,0.82)_100%)]")} />
      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[8px] bg-[rgba(116,124,138,0.82)] px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm">
        {item.category === "Perjalanan" ? <Plane className="h-3.5 w-3.5" aria-hidden="true" /> : <Shield className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{item.category}</span>
      </div>
      {!item.active ? (
        <div className="absolute right-4 top-4 rounded-[8px] border border-white/35 bg-slate-950/50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          Belum Tersedia
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-4 text-white">
        <div className="translate-y-0 transition duration-300 ease-out group-hover:-translate-y-1">
          <div className="max-w-[92%] text-[18px] font-bold leading-tight md:max-w-[88%] md:text-[20px]">{item.title}</div>
          <div className="mt-2 max-w-[92%] text-sm leading-6 text-white/95 md:max-w-[80%]">
            {item.subtitle || item.description}
          </div>
          <div className="mt-3 md:mt-4">
            <span className={cls("inline-flex min-w-[132px] items-center justify-center rounded-[14px] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em]", item.active ? "bg-white text-[#102A43]" : "bg-white text-slate-500")}>
              {item.active ? "Cek Premi" : "Segera Hadir"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function PublicBrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-2 text-white">
      <div className="relative h-5 w-5 overflow-hidden rounded-full bg-white">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-red-600" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <div className="absolute inset-0 rounded-full ring-1 ring-black/10" />
      </div>
      <div className={cls("font-black leading-[0.95]", compact ? "text-[11px]" : "text-[13px]")}>
        Danantara
        <div>Indonesia</div>
      </div>
    </div>
  );
}

function JasindoLogo({ dark = false }) {
  return (
    <div className={cls("flex flex-col leading-none", dark ? "text-[#0A4D82]" : "text-white")}>
      <div className="flex items-end gap-1">
        <span className="text-[24px] font-black italic text-[#F5A623]">j</span>
        <span className="text-[13px] font-black">asuransi</span>
      </div>
      <span className="ml-4 text-[15px] font-black">jasindo</span>
      <span className="ml-4 mt-1 text-[7px] font-semibold opacity-80">A member of IFG</span>
    </div>
  );
}

function PublicProductCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={item.active ? onClick : undefined}
      className={cls(
        "group relative h-[240px] overflow-hidden rounded-[4px] text-left shadow-sm transition",
        item.active ? "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.18)]" : "cursor-not-allowed opacity-80",
      )}
    >
      <img src={item.image} alt={item.title} width="480" height="576" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.30)_48%,rgba(15,23,42,0.74)_100%)]" />
      <div className="absolute left-3 top-4 inline-flex items-center gap-2 rounded-[5px] bg-slate-500/80 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm">
        {item.category === "Perjalanan" ? <Plane className="h-3.5 w-3.5" aria-hidden="true" /> : <Shield className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{item.category}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="text-[18px] font-black leading-tight text-white drop-shadow-sm">{item.title}</div>
      </div>
    </button>
  );
}

function PublicProductLanding({ onOpen }) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="bg-[#004B78] text-white">
        <div className="mx-auto flex h-[52px] max-w-[1800px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <PublicBrandLogo />
            <JasindoLogo />
          </div>
          <nav className="flex items-center gap-2">
            <button type="button" onClick={() => { window.location.href = "https://esppa.asuransijasindo.co.id/"; }} className="inline-flex h-8 items-center gap-2 rounded-[4px] bg-[#064467] px-4 text-sm font-semibold text-white hover:bg-[#0A5A86]">
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Beranda
            </button>
            <button type="button" className="inline-flex h-8 items-center gap-2 rounded-[4px] bg-[#F5A623] px-4 text-sm font-bold text-white shadow-sm">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              Produk
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <div className="inline-flex h-8 items-center gap-2 rounded-full bg-[#064467] px-3 text-sm font-bold">
              <span className="relative h-5 w-5 overflow-hidden rounded-full bg-white">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-red-600" />
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
              </span>
              ID
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-2 rounded-[4px] bg-[#064467] px-4 text-sm font-bold text-white hover:bg-[#0A5A86]">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Masuk
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1820px] px-8 pb-14 pt-8">
        <h1 className="text-center text-[17px] font-black tracking-tight text-black">Pilihan Produk Asuransi Jasindo</h1>
        <section className="mt-7 rounded-[4px] bg-[#F1F2F2] px-3 py-5 md:px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-slate-800 shadow-sm ring-1 ring-slate-200">
                <Shield className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-[20px] font-black leading-tight text-[#004B78]">Asuransi Kecelakaan Diri</h2>
                <p className="mt-1 text-[15px] leading-6 text-slate-600">Perlindungan biaya pengobatan akibat kecelakaan</p>
              </div>
            </div>
            <ChevronDown className="mt-5 h-5 w-5 shrink-0 text-slate-800" aria-hidden="true" />
          </div>
          <div className="mt-5 grid max-w-[840px] grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {PERSONAL_PRODUCTS.map((item) => (
              <PublicProductCard key={item.title} item={item} onClick={() => onOpen(item.key)} />
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto">
        <div className="mx-auto grid max-w-[1800px] gap-8 px-10 pb-10 pt-2 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <JasindoLogo dark />
            <div className="mt-7 flex gap-4">
              {["ig", "f", "x"].map((label) => (
                <button key={label} type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-[12px] font-bold text-slate-700">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[17px] font-black">Hubungi Kami</h2>
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-bold">Graha Jasindo</div>
                  <div className="mt-2 text-slate-700">Jln. Menteng Raya No. 21 Jakarta Pusat, 10340</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-bold">Contact Center</div>
                  <div className="mt-2 font-bold">1500073</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-[17px] font-black">Tautan Cepat</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>Website Asuransi Jasindo</div>
              <div>Representative Office</div>
              <div>Pusat Privasi</div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 text-center text-[9px] font-black text-[#004B78]">OJK</div>
              <div className="text-[18px] font-black leading-tight text-[#0A4D82]">PAHAMI & MILIKI<br />ASURANSI</div>
            </div>
          </div>
        </div>
        <div className="bg-[#004B78] text-white">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between px-8 py-4 text-[12px] font-semibold">
            <span>Copyright 2026 PT. Asuransi Jasa Indonesia, Hak Cipta Dilindungi Undang-undang</span>
            <span>PT Asuransi Jasa Indonesia Berizin dan Diawasi oleh OJK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionShelf({ icon, title, subtitle, items, onOpen }) {
  return (
    <div className="mt-5 rounded-[14px] bg-[#F5F6F7] p-4 md:mt-6 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 text-[#0A4D82]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white text-[#2D3748] shadow-sm ring-1 ring-slate-200">
            {createElement(icon, { className: "h-7 w-7" })}
          </div>
          <div>
            <div className="text-[18px] font-bold leading-tight md:text-[20px]">{title}</div>
            <div className="mt-1 text-[14px] leading-6 text-slate-600 md:text-[15px]">{subtitle}</div>
          </div>
        </div>
        <ChevronDown className="mt-1 hidden h-6 w-6 text-slate-500 md:block" />
      </div>
      <div className={cls("mt-5 grid gap-3 md:gap-4", items.length === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {items.map((item) => (
          <ProductCard key={item.title} item={item} onClick={() => onOpen(item.key)} />
        ))}
      </div>
    </div>
  );
}

function resolveRoleLabel(sessionRole) {
  if (sessionRole === "internal") return "Internal";
  if (sessionRole === "external") return "Eksternal";
  if (sessionRole === "partner") return "Partner";
  return "Tanpa Login";
}

function JourneyFallback() {
  return (
    <div className="min-h-screen bg-[#F3F5F7] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0A4D82]" />
        <div className="mt-4 text-[18px] font-semibold text-slate-900">Menyiapkan halaman</div>
        <div className="mt-2 text-sm text-slate-500">Komponen produk sedang dimuat agar halaman utama tetap ringan dan cepat dibuka.</div>
      </div>
    </div>
  );
}

export default function App() {
  const initialNavigationState = useMemo(() => resolveInitialNavigationState(), []);
  const [activeJourney, setActiveJourney] = useState(initialNavigationState.activeJourney);
  const [sessionRole] = useState(initialNavigationState.sessionRole);
  const [partnerConfigRole, setPartnerConfigRole] = useState("Maker");
  const [operatingRecords, setOperatingRecords] = useState(OPERATING_QUEUE_SEED);
  const [activeTransactionId, setActiveTransactionId] = useState(OPERATING_QUEUE_SEED[0]?.id || "");
  const allowSharedOfferJourney = useMemo(() => hasMatchingShareContext(activeJourney), [activeJourney]);
  const resolvedActiveJourney = useMemo(
    () => sanitizeJourneyForRole(activeJourney, sessionRole, { allowSharedOfferJourney }),
    [activeJourney, allowSharedOfferJourney, sessionRole],
  );
  const activeSessionName = resolveSessionName(sessionRole);
  const activeSessionProfile = resolveSessionProfile(sessionRole);
  const isAuthenticatedCustomerSession = sessionRole === "external" || sessionRole === "partner";
  const ownedOperatingRecords = useMemo(
    () => operatingRecords.filter((item) => item.owner === activeSessionName),
    [activeSessionName, operatingRecords],
  );
  const externalAccountMenuItems = [
    {
      label: "Polis Saya",
      primary: true,
      onClick: () => setActiveJourney("self-care-portal"),
    },
  ];

  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (!win) return;
    if (sessionRole) win.sessionStorage.setItem(SESSION_ROLE_STORAGE_KEY, sessionRole);
    else win.sessionStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
  }, [sessionRole]);

  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (!win) return;
    const url = new URL(win.location.href);
    if (resolvedActiveJourney) url.searchParams.set("journey", resolvedActiveJourney);
    else url.searchParams.delete("journey");
    const publicUrlSessionRole = resolveUrlSessionRole(sessionRole);
    if (publicUrlSessionRole) url.searchParams.set("role", publicUrlSessionRole);
    else url.searchParams.delete("role");
    win.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [resolvedActiveJourney, sessionRole]);

  const handleOpenJourney = (target) => {
    if (isExternalUrl(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }
    clearSharedJourneyParams();
    const matchingRecord = operatingRecords.find((item) => item.journeyKey === target);
    if (matchingRecord) setActiveTransactionId(matchingRecord.id);
    setActiveJourney(target);
  };

  const updateOperatingRecord = (recordId, patch) => {
    setOperatingRecords((prev) => {
      const current = prev.find((item) => item.id === recordId);
      if (!current) return prev;
      const nextCandidate = {
        ...current,
        ...patch,
        owner: patch.owner || current.owner || activeSessionName,
        statusTone: patch.statusTone || (patch.status ? statusTone(patch.status) : current.statusTone),
      };
      const unchanged =
        nextCandidate.status === current.status &&
        nextCandidate.reason === current.reason &&
        nextCandidate.notes === current.notes &&
        JSON.stringify(nextCandidate.authority || null) === JSON.stringify(current.authority || null) &&
        JSON.stringify(nextCandidate.flags || []) === JSON.stringify(current.flags || []) &&
        JSON.stringify(nextCandidate.timeline || []) === JSON.stringify(current.timeline || []);

      if (unchanged) return prev;

      return prev.map((item) =>
        item.id === recordId
          ? {
              ...item,
              ...patch,
              owner: patch.owner || item.owner || activeSessionName,
              statusTone: patch.statusTone || (patch.status ? statusTone(patch.status) : item.statusTone),
            }
          : item,
      );
    });
  };

  const getActiveRecord = (journeyKey) =>
    operatingRecords.find((item) => item.id === activeTransactionId && item.journeyKey === journeyKey) ||
    operatingRecords.find((item) => item.journeyKey === journeyKey) ||
    null;

  const buildShell = (journeyKey, nodeFactory) => {
    const activeRecord = getActiveRecord(journeyKey);
    return (
      <Suspense fallback={<JourneyFallback />}>
        <InternalOperatingShell
          record={activeRecord}
          onUpdateRecord={(patch) =>
            updateOperatingRecord(activeRecord.id, {
              ...patch,
              owner: sessionRole === "internal" ? activeSessionName : activeRecord.owner,
              timeline: patch.timeline || [buildTimelineEvent("Status transaksi diperbarui.", activeSessionName), ...activeRecord.timeline],
            })
          }
          onOpenWorkbench={() => setActiveJourney("review-internal")}
          sessionName={activeSessionName}
        >
          {nodeFactory(activeRecord, (signal) => {
            const signalChanged =
              (signal.status || "") !== (activeRecord.status || "") ||
              (signal.reason || "") !== (activeRecord.reason || "") ||
              (signal.notes || "") !== (activeRecord.notes || "") ||
              JSON.stringify(signal.authority || null) !== JSON.stringify(activeRecord.authority || null) ||
              JSON.stringify(signal.flags || []) !== JSON.stringify(activeRecord.flags || []);

            updateOperatingRecord(activeRecord.id, {
              ...signal,
              owner: activeSessionName,
              timeline:
                signal.timeline ||
                (signalChanged && (signal.status || signal.reason)
                  ? [buildTimelineEvent(signal.reason || "Status transaksi diperbarui.", activeSessionName), ...activeRecord.timeline]
                  : activeRecord.timeline),
            });
          })}
        </InternalOperatingShell>
      </Suspense>
    );
  };

  const internalMenuHandlers = {
    onOpenWorkspace: () => setActiveJourney("internal-workspace"),
    onOpenQueue: () => setActiveJourney("review-internal"),
    onOpenPartnerConfig: () => setActiveJourney("partner-config"),
  };

  if (resolvedActiveJourney === "review-internal") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <ReviewWorkbench
          records={operatingRecords}
          onBack={() => setActiveJourney("")}
          onOpenJourney={(record) => { setActiveTransactionId(record.id); setActiveJourney(record.journeyKey); }}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
          onNavigateHome={() => setActiveJourney("")}
          onNavigateProducts={() => setActiveJourney("")}
          onOpenWorkspace={() => setActiveJourney("internal-workspace")}
          onOpenPartnerConfig={() => setActiveJourney("partner-config")}
        />
      </Suspense>
    );
  }

  if (resolvedActiveJourney === "internal-workspace") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <ReviewWorkbench
          title="Ruang Kerja Saya"
          subtitle={`Transaksi yang saat ini menjadi tanggung jawab ${activeSessionName}. Dari sini Anda bisa lanjut review, revisi, atau buka transaksi yang sedang aktif.`}
          emptyMessage="Belum ada transaksi yang menjadi tanggung jawab Anda saat ini."
          defaultFilter="Perlu Ditindak"
          showWorkspaceRail
          defaultWorkspaceLane="review"
          records={ownedOperatingRecords}
          onBack={() => setActiveJourney("")}
          onOpenJourney={(record) => { setActiveTransactionId(record.id); setActiveJourney(record.journeyKey); }}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
          onNavigateHome={() => setActiveJourney("")}
          onNavigateProducts={() => setActiveJourney("")}
          onOpenWorkspace={() => setActiveJourney("internal-workspace")}
          onOpenPartnerConfig={() => setActiveJourney("partner-config")}
        />
      </Suspense>
    );
  }

  if (resolvedActiveJourney === "property-internal") {
    return buildShell(
      "property-internal",
      (activeRecord, onOperatingSignal) => (
        <PropertyPrototype
          embedded
          entryMode="internal"
          productVariant="property-safe"
          sessionName={activeSessionName}
          onExit={() => setActiveJourney("")}
          operatingRecord={activeRecord}
          onOperatingSignal={onOperatingSignal}
          {...internalMenuHandlers}
        />
      ),
    );
  }
  if (resolvedActiveJourney === "property-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertyPrototype
          embedded
          entryMode="external"
          productVariant="property-safe"
          sessionName={activeSessionName}
          sessionProfile={isAuthenticatedCustomerSession ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          onOpenPolicies={() => setActiveJourney("self-care-portal")}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "property-all-risk-internal") {
    return buildShell(
      "property-all-risk-internal",
      (activeRecord, onOperatingSignal) => (
        <PropertyPrototype
          embedded
          entryMode="internal"
          productVariant="property-all-risk"
          sessionName={activeSessionName}
          onExit={() => setActiveJourney("")}
          operatingRecord={activeRecord}
          onOperatingSignal={onOperatingSignal}
          {...internalMenuHandlers}
        />
      ),
    );
  }
  if (resolvedActiveJourney === "property-all-risk-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertyPrototype
          embedded
          entryMode="external"
          productVariant="property-all-risk"
          sessionName={activeSessionName}
          sessionProfile={isAuthenticatedCustomerSession ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          onOpenPolicies={() => setActiveJourney("self-care-portal")}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "motor-internal") {
    return buildShell(
      "motor-internal",
      (activeRecord, onOperatingSignal) => (
        <MotorInternalPrototype
          sessionName={activeSessionName}
          onExit={() => setActiveJourney("")}
          operatingRecord={activeRecord}
          onOperatingSignal={onOperatingSignal}
          {...internalMenuHandlers}
        />
      ),
    );
  }
  if (resolvedActiveJourney === "motor-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          sessionName={activeSessionName}
          sessionProfile={isAuthenticatedCustomerSession ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "car-tlo-internal") {
    return buildShell(
      "car-tlo-internal",
      (activeRecord, onOperatingSignal) => (
        <CarTloInternalPrototype
          sessionName={activeSessionName}
          onExit={() => setActiveJourney("")}
          operatingRecord={activeRecord}
          onOperatingSignal={onOperatingSignal}
          {...internalMenuHandlers}
        />
      ),
    );
  }
  if (resolvedActiveJourney === "car-comp-internal") {
    return buildShell(
      "car-comp-internal",
      (activeRecord, onOperatingSignal) => (
        <CarCompInternalPrototype
          sessionName={activeSessionName}
          onExit={() => setActiveJourney("")}
          operatingRecord={activeRecord}
          onOperatingSignal={onOperatingSignal}
          {...internalMenuHandlers}
        />
      ),
    );
  }
  if (resolvedActiveJourney === "car-tlo-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          initialFlow="carTlo"
          sessionName={activeSessionName}
          sessionProfile={isAuthenticatedCustomerSession ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "mobil-comp") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          initialFlow="carComp"
          sessionName={activeSessionName}
          sessionProfile={isAuthenticatedCustomerSession ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "self-care-portal" || resolvedActiveJourney === "self-care-lookup") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <SelfCarePortalBridge
          sessionRole={sessionRole}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
          onGoHome={() => setActiveJourney("")}
          onExit={() => setActiveJourney("")}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "partner-config") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PartnerConfigStudio
          initialRole={partnerConfigRole}
          role={partnerConfigRole}
          onRoleChange={setPartnerConfigRole}
          onExit={() => setActiveJourney("")}
          onOpenWorkspace={() => setActiveJourney("internal-workspace")}
          onOpenQueue={() => setActiveJourney("review-internal")}
          onOpenPartnerConfig={() => setActiveJourney("partner-config")}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
        />
      </Suspense>
    );
  }
  if (resolvedActiveJourney === "brd-property-safe") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertySafeBrdPage onBack={() => setActiveJourney("")} />
      </Suspense>
    );
  }
  return <PublicProductLanding onOpen={handleOpenJourney} />;
}
