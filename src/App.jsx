import { Building2, Car, ChevronDown, Home, LogIn, MapPin, Package, Phone, Plane, Shield } from "lucide-react";
import { createElement, Suspense, useEffect, useMemo, useState } from "react";
import { OPERATING_QUEUE_SEED, buildTimelineEvent, statusTone } from "./operatingLayer.js";
import { buildPropertyCatalog, buildVehicleCatalog, PERSONAL_PRODUCTS } from "./app/catalogData.js";
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

const PRODUCTION_ASSETS = {
  danantara: "/production-assets/danantara.57629308.png",
  jasindoWhite: "/production-assets/jasindo-white-all.814f5299.png",
  jasindoPositive: "/production-assets/Jasindo_Positive-2.adb9525c.png",
  iso: "/production-assets/iso-jasindo.0f9f4aa7.png",
  mari: "/production-assets/logo-mari-berasuransi.803b8b56.png",
  lifeGuard: "/production-assets/product-lintasan.df53665c.jpg",
  tripGuard: "/production-assets/product-kecelakaan-diri.31916e3d.jpg",
  eduProtect: "/production-assets/product-anak-sekolah.56785bac.jpg",
  travelSafe: "/production-assets/product-travel.51b3edff.jpg",
  propertyFire: "/production-assets/property-fire.jpg",
  propertyAllRisk: "/production-assets/property-all-risk.jpg",
  vehicleMotor: "/production-assets/vehicle-motor-tlo.jpg",
  vehicleCarTlo: "/production-assets/vehicle-car-tlo.jpg",
  vehicleCarComp: "/production-assets/vehicle-car-comp.jpg",
};

const PRODUCT_IMAGE_BY_TITLE = {
  "Life Guard": PRODUCTION_ASSETS.lifeGuard,
  "Trip Guard": PRODUCTION_ASSETS.tripGuard,
  "Edu Protect": PRODUCTION_ASSETS.eduProtect,
  "Travel Safe": PRODUCTION_ASSETS.travelSafe,
  "Asuransi Kebakaran": PRODUCTION_ASSETS.propertyFire,
  "Asuransi Property All Risk": PRODUCTION_ASSETS.propertyAllRisk,
  "Asuransi Sepeda Motor - Total Loss": PRODUCTION_ASSETS.vehicleMotor,
  "Asuransi Mobil - Total Loss": PRODUCTION_ASSETS.vehicleCarTlo,
  "Asuransi Mobil Komprehensif": PRODUCTION_ASSETS.vehicleCarComp,
};

function productionImageFor(item) {
  return PRODUCT_IMAGE_BY_TITLE[item.title] || item.image;
}

function ProductionCategoryIcon({ category }) {
  if (category === "Perjalanan") return <Plane className="production-product-card__tag-icon" aria-hidden="true" />;
  if (category === "Harta Benda") return <Building2 className="production-product-card__tag-icon" aria-hidden="true" />;
  if (category === "Kendaraan Bermotor") return <Car className="production-product-card__tag-icon" aria-hidden="true" />;
  return <Shield className="production-product-card__tag-icon" aria-hidden="true" />;
}

function ProductionProductCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={item.active ? onClick : undefined}
      className={cls("production-product-card", !item.active && "is-disabled")}
      aria-label={item.title}
    >
      <img src={item.image} alt="" width="640" height="720" className="production-product-card__image" />
      <span className="production-product-card__shade" />
      <span className="production-product-card__tag">
        <ProductionCategoryIcon category={item.category} />
        <span>{item.category}</span>
      </span>
      <span className="production-product-card__title">{item.title}</span>
    </button>
  );
}

function ProductionProductSection({ icon, title, subtitle, items, onOpen }) {
  return (
    <section className="production-product-section">
      <div className="production-product-section__header">
        <div className="production-product-section__icon" aria-hidden="true">
          {createElement(icon, { size: 35, strokeWidth: 2.25 })}
        </div>
        <div className="production-product-section__copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <ChevronDown className="production-product-section__chevron" aria-hidden="true" />
      </div>
      <div className={cls("production-product-grid", items.length === 3 && "is-three-column")}>
        {items.map((item) => (
          <ProductionProductCard key={item.title} item={item} onClick={() => onOpen(item.key)} />
        ))}
      </div>
    </section>
  );
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="16.6" cy="7.4" r="1" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8.2h2V5h-2.6c-3 0-4.6 1.7-4.6 4.5v1.7H6.5v3.3h2.3V21h3.6v-6.5h2.9l.5-3.3h-3.4V9.8c0-1 .4-1.6 1.6-1.6Z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 5h3.5l3 4.2L16.2 5H19l-5 5.7L19.7 19h-3.5l-3.5-5-4.4 5H5.5l5.7-6.5L6 5Zm2.2 1.6 8.8 10.8h.6L8.8 6.6h-.6Z" />
    </svg>
  );
}

function ProductionFooter() {
  return (
    <footer className="production-footer">
      <div className="production-footer__main">
        <div className="production-footer__brand">
          <img src={PRODUCTION_ASSETS.jasindoPositive} alt="Asuransi Jasindo" />
          <div className="production-footer__socials" aria-label="Media sosial Jasindo">
            <a href="https://www.instagram.com/asuransijasindo" aria-label="Instagram Asuransi Jasindo">
              <InstagramLogo />
            </a>
            <a href="https://www.facebook.com/AsuransiJasindo" aria-label="Facebook Asuransi Jasindo">
              <FacebookLogo />
            </a>
            <a href="https://x.com/asuransijasindo" aria-label="X Asuransi Jasindo">
              <XLogo />
            </a>
          </div>
        </div>
        <div className="production-footer__contact">
          <h2>Hubungi Kami</h2>
          <div className="production-footer__info">
            <MapPin size={20} strokeWidth={2.2} aria-hidden="true" />
            <div>
              <strong>Graha Jasindo</strong>
              <span>Jln. Menteng Raya No. 21 Jakarta Pusat, 10340</span>
            </div>
          </div>
          <div className="production-footer__info">
            <Phone size={20} strokeWidth={2.2} aria-hidden="true" />
            <div>
              <strong>Contact Center</strong>
              <span>1500073</span>
            </div>
          </div>
        </div>
        <div className="production-footer__links">
          <h2>Tautan Cepat</h2>
          <a href="https://asuransijasindo.co.id/">Website Asuransi Jasindo</a>
          <a href="https://asuransijasindo.co.id/representative-office">Representative Office</a>
          <a href="https://asuransijasindo.co.id/privacy-policy">Pusat Privasi</a>
        </div>
        <div className="production-footer__certs">
          <img src={PRODUCTION_ASSETS.iso} alt="ISO Jasindo" />
          <img src={PRODUCTION_ASSETS.mari} alt="Pahami dan Miliki Asuransi" />
        </div>
      </div>
      <div className="production-footer__bar">
        <span>Copyright 2026 PT. Asuransi Jasa Indonesia, Hak Cipta Dilindungi Undang-undang</span>
        <span>PT Asuransi Jasa Indonesia Berizin dan Diawasi oleh OJK</span>
      </div>
    </footer>
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
  const [sessionRole, setSessionRole] = useState(initialNavigationState.sessionRole);
  const [partnerConfigRole, setPartnerConfigRole] = useState("Maker");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [operatingRecords, setOperatingRecords] = useState(OPERATING_QUEUE_SEED);
  const [activeTransactionId, setActiveTransactionId] = useState(OPERATING_QUEUE_SEED[0]?.id || "");
  const allowSharedOfferJourney = useMemo(() => hasMatchingShareContext(activeJourney), [activeJourney]);
  const resolvedActiveJourney = useMemo(
    () => sanitizeJourneyForRole(activeJourney, sessionRole, { allowSharedOfferJourney }),
    [activeJourney, allowSharedOfferJourney, sessionRole],
  );
  const activeSessionName = resolveSessionName(sessionRole);
  const activeSessionProfile = resolveSessionProfile(sessionRole);
  const isInternalSession = sessionRole === "internal";
  const isGuestSession = sessionRole === "guest";
  const isAuthenticatedCustomerSession = sessionRole === "external" || sessionRole === "partner";
  const propertyItems = useMemo(
    () => ({
      safeItem: sessionRole === "internal" ? "property-internal" : "property-external",
      allRiskItem: sessionRole === "internal" ? "property-all-risk-internal" : "property-all-risk-external",
    }),
    [sessionRole],
  );
  const motorItem = useMemo(() => (sessionRole === "internal" ? "motor-internal" : "motor-external"), [sessionRole]);
  const carTloItem = useMemo(() => (sessionRole === "internal" ? "car-tlo-internal" : "car-tlo-external"), [sessionRole]);
  const carCompItem = useMemo(() => (sessionRole === "internal" ? "car-comp-internal" : ""), [sessionRole]);
  const productionPersonalProducts = useMemo(
    () => PERSONAL_PRODUCTS.map((item) => ({ ...item, image: productionImageFor(item) })),
    [],
  );
  const productionPropertyProducts = useMemo(
    () => buildPropertyCatalog(propertyItems).map((item) => ({ ...item, image: productionImageFor(item) })),
    [propertyItems],
  );
  const productionVehicleProducts = useMemo(
    () => buildVehicleCatalog({ motorItem, carTloItem, carCompItem, sessionRole }).map((item) => ({ ...item, image: productionImageFor(item) })),
    [carCompItem, carTloItem, motorItem, sessionRole],
  );
  const ownedOperatingRecords = useMemo(
    () => operatingRecords.filter((item) => item.owner === activeSessionName),
    [activeSessionName, operatingRecords],
  );
  const accountPrimaryDestination = isInternalSession ? "internal-workspace" : "self-care-portal";
  const accountPrimaryLabel = isInternalSession ? "Ruang Kerja Saya" : "Polis Saya";
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
    setAccountMenuOpen(false);
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

  const exitSharedJourneyToProducts = () => {
    clearSharedJourneyParams();
    setActiveJourney("");
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
          onExit={exitSharedJourneyToProducts}
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
          onExit={exitSharedJourneyToProducts}
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
  return (
    <div className="production-page">
      <header className="production-header">
        <div className="production-header__inner">
          <div className="production-header__brand">
            <img src={PRODUCTION_ASSETS.danantara} alt="Danantara Indonesia" />
            <img src={PRODUCTION_ASSETS.jasindoWhite} alt="Asuransi Jasindo" />
          </div>

          <nav className="production-nav" aria-label="Navigasi utama">
            <button
              type="button"
              className="production-nav__item"
              onClick={() => {
                window.location.href = "https://esppa.asuransijasindo.co.id/";
              }}
            >
              <Home size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>Beranda</span>
            </button>
            <button
              type="button"
              className="production-nav__item is-active"
              onClick={() => {
                clearSharedJourneyParams();
                setActiveJourney("");
              }}
            >
              <Package size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>Produk</span>
            </button>
          </nav>

          <div className="production-actions">
            <button type="button" className="production-language" aria-label="Bahasa Indonesia">
              <span className="production-language__flag" aria-hidden="true" />
              <span>ID</span>
            </button>
            <div className="production-account">
              {isGuestSession ? (
                <>
                  <button
                    type="button"
                    className="production-login"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="guest-account-menu"
                    onClick={() => {
                      setAccountMenuOpen((current) => !current);
                    }}
                  >
                    <LogIn size={17} strokeWidth={2.25} aria-hidden="true" />
                    <span>Masuk</span>
                  </button>
                  {accountMenuOpen ? (
                    <div id="guest-account-menu" role="menu" className="production-menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setSessionRole("external");
                        }}
                      >
                        Login / Buat Akun
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setActiveJourney("self-care-lookup");
                        }}
                      >
                        Lanjut tanpa Login
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="production-profile"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="account-menu"
                    onClick={() => {
                      setAccountMenuOpen((current) => !current);
                    }}
                  >
                    <span className="production-profile__badge">ID</span>
                    <span>{activeSessionName}</span>
                    <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                  {accountMenuOpen ? (
                    <div id="account-menu" role="menu" className="production-menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setActiveJourney(accountPrimaryDestination);
                        }}
                      >
                        {accountPrimaryLabel}
                      </button>
                      {isInternalSession ? (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setActiveJourney("partner-config");
                          }}
                        >
                          Konfigurasi Partner
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="production-main">
        <h1>Pilihan Produk Asuransi Jasindo</h1>
        <ProductionProductSection
          icon={Shield}
          title="Asuransi Kecelakaan Diri"
          subtitle="Perlindungan biaya pengobatan akibat kecelakaan"
          items={productionPersonalProducts}
          onOpen={handleOpenJourney}
        />
        <ProductionProductSection
          icon={Building2}
          title="Asuransi Harta Benda"
          subtitle="Perlindungan bangunan dan isi properti dengan simulasi premi dan penawaran digital."
          items={productionPropertyProducts}
          onOpen={handleOpenJourney}
        />
        <ProductionProductSection
          icon={Car}
          title="Asuransi Kendaraan"
          subtitle="Perlindungan motor dan mobil dengan simulasi premi dan penawaran digital."
          items={productionVehicleProducts}
          onOpen={handleOpenJourney}
        />
      </main>
      <ProductionFooter />
    </div>
  );
}
