import { Building2, Car, ChevronDown, Home, Plane, Shield } from "lucide-react";
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
import { resolveSessionDescription, resolveSessionName, resolveSessionProfile, SESSION_OPTIONS } from "./app/sessionConfig.js";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
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
  const [sessionRole, setSessionRole] = useState("internal");
  const [activeJourney, setActiveJourney] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("journey") || "";
  });
  const [partnerConfigRole, setPartnerConfigRole] = useState("Maker");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [operatingRecords, setOperatingRecords] = useState(OPERATING_QUEUE_SEED);
  const [activeTransactionId, setActiveTransactionId] = useState(OPERATING_QUEUE_SEED[0]?.id || "");
  const activeSessionName = resolveSessionName(sessionRole);
  const activeSessionProfile = resolveSessionProfile(sessionRole);
  const isInternalSession = sessionRole === "internal";
  const isGuestSession = sessionRole === "guest";
  const propertyItems = useMemo(
    () => ({
      safeItem: sessionRole === "internal" ? "property-internal" : "property-external",
      allRiskItem: sessionRole === "internal" ? "property-all-risk-internal" : "property-all-risk-external",
    }),
    [sessionRole],
  );
  const motorItem = useMemo(() => (sessionRole === "internal" ? "motor-internal" : "motor-external"), [sessionRole]);
  const carTloItem = useMemo(() => (sessionRole === "internal" ? "car-tlo-internal" : "car-tlo-external"), [sessionRole]);
  const carCompItem = useMemo(() => (sessionRole === "internal" ? "car-comp-internal" : "mobil-comp"), [sessionRole]);
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
    const url = new URL(win.location.href);
    if (activeJourney) url.searchParams.set("journey", activeJourney);
    else url.searchParams.delete("journey");
    win.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activeJourney]);

  const handleOpenJourney = (target) => {
    if (isExternalUrl(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }
    clearSharedJourneyParams();
    const matchingRecord = operatingRecords.find((item) => item.journeyKey === target);
    if (matchingRecord) setActiveTransactionId(matchingRecord.id);
    setRoleMenuOpen(false);
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

  if (activeJourney === "review-internal") {
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

  if (activeJourney === "internal-workspace") {
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

  if (activeJourney === "property-internal") {
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
  if (activeJourney === "property-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertyPrototype
          embedded
          entryMode="external"
          productVariant="property-safe"
          sessionName={activeSessionName}
          sessionProfile={sessionRole === "external" ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          onOpenPolicies={() => setActiveJourney("self-care-portal")}
        />
      </Suspense>
    );
  }
  if (activeJourney === "property-all-risk-internal") {
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
  if (activeJourney === "property-all-risk-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertyPrototype
          embedded
          entryMode="external"
          productVariant="property-all-risk"
          sessionName={activeSessionName}
          sessionProfile={sessionRole === "external" ? activeSessionProfile : null}
          onExit={() => setActiveJourney("")}
          onOpenPolicies={() => setActiveJourney("self-care-portal")}
        />
      </Suspense>
    );
  }
  if (activeJourney === "motor-internal") {
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
  if (activeJourney === "motor-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (activeJourney === "car-tlo-internal") {
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
  if (activeJourney === "car-comp-internal") {
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
  if (activeJourney === "car-tlo-external") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          initialFlow="carTlo"
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (activeJourney === "mobil-comp") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <MotorLatestExact
          entryMode="external"
          initialFlow="carComp"
          onExit={() => setActiveJourney("")}
          accountMenuItems={externalAccountMenuItems}
        />
      </Suspense>
    );
  }
  if (activeJourney === "self-care-portal" || activeJourney === "self-care-lookup") {
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
  if (activeJourney === "partner-config") {
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
  if (activeJourney === "brd-property-safe") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertySafeBrdPage onBack={() => setActiveJourney("")} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <header className="sticky top-0 z-30 bg-[#0A4D82] shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3 text-white md:gap-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm bg-[#091E42] md:h-8 md:w-8">
                <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(135deg,#D71920_0%,#D71920_42%,transparent_42%,transparent_100%)]" />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-white" />
              </div>
              <div className="text-[12px] font-black leading-[0.95] md:text-[18px]">Danantara<div className="-mt-0.5 md:-mt-1">Indonesia</div></div>
            </div>
            <div className="hidden h-10 w-px bg-white/20 md:block" />
            <div className="hidden items-center gap-2.5 text-white md:flex">
              <div className="text-[14px] font-semibold leading-none md:text-[15px]">asuransi</div>
              <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <div className="text-[14px] font-semibold leading-none md:text-[15px]">jasindo</div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => {
                window.location.href = "https://esppa.asuransijasindo.co.id/";
              }}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <Home className="h-4 w-4" />
              Beranda
            </button>
            <button className="inline-flex items-center gap-2 rounded-[8px] bg-white/6 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
              <Shield className="h-4 w-4" />
              Produk
            </button>
          </div>

          <div className="relative flex items-center gap-2 md:gap-3">
            <button
              type="button"
              aria-expanded={roleMenuOpen}
              aria-haspopup="menu"
              aria-controls="role-menu"
              onClick={() => {
                setAccountMenuOpen(false);
                setRoleMenuOpen((current) => !current);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/15"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">View as</span>
              <span className="max-w-[118px] truncate">{resolveRoleLabel(sessionRole)}</span>
              <ChevronDown className={cls("h-4 w-4 text-white/85 transition", roleMenuOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {roleMenuOpen ? (
              <div id="role-menu" role="menu" className="absolute right-0 top-[calc(100%+12px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">View as</div>
                {SESSION_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sessionRole === item.key}
                    onClick={() => {
                      setRoleMenuOpen(false);
                      setSessionRole(item.key);
                      setActiveJourney("");
                    }}
                    className={cls(
                      "flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold hover:bg-[#F7FAFD]",
                      sessionRole === item.key ? "bg-[#F7FAFD] text-[#0A4D82]" : "text-slate-700",
                    )}
                  >
                    {resolveRoleLabel(item.key)}
                  </button>
                ))}
              </div>
            ) : null}
            {isGuestSession ? (
              <>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-[10px] font-bold text-white">ID</span>
                  <span className="text-[13px] md:text-sm">ID</span>
                </button>
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="guest-account-menu"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    setAccountMenuOpen((current) => !current);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0A4D82] px-4 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-[#0C5D9E]"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Masuk
                </button>
                <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
                  <span aria-hidden="true" className="text-[15px] leading-none">🔔</span>
                </button>
                {accountMenuOpen ? (
                  <div id="guest-account-menu" role="menu" className="absolute right-0 top-[calc(100%+12px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setActiveJourney("self-care-lookup");
                      }}
                      className="flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold text-[#0A4D82] hover:bg-[#F7FAFD]"
                    >
                      Cari Polis / Klaim
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="account-menu"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    setAccountMenuOpen((current) => !current);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm md:px-4"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA4335] text-[10px] font-bold text-white">ID</span>
                  <span className="max-w-[108px] truncate text-[13px] md:max-w-none md:text-sm">{activeSessionName}</span>
                  <ChevronDown className={cls("h-4 w-4 text-slate-500 transition", accountMenuOpen && "rotate-180")} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Lihat notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/15 md:inline-flex">
                  <span aria-hidden="true" className="text-[15px] leading-none">🔔</span>
                </button>
                {accountMenuOpen ? (
                  <div id="account-menu" role="menu" className="absolute right-0 top-[calc(100%+12px)] z-40 w-[220px] rounded-[14px] border border-[#D9E1EA] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setActiveJourney(accountPrimaryDestination);
                      }}
                      className="flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold text-[#0A4D82] hover:bg-[#F7FAFD]"
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
                        className="mt-1 flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-[#F7FAFD]"
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
      </header>

      <div className="mx-auto max-w-[1800px] px-4 py-4 md:px-6 md:py-6">
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:mt-6 md:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-[28px] font-bold text-slate-900 md:text-[32px]">Pilihan Produk Asuransi Jasindo</div>
              {resolveSessionDescription(sessionRole) ? (
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {resolveSessionDescription(sessionRole)}
                </div>
              ) : null}
            </div>
          </div>

          <SectionShelf icon={Shield} title="Asuransi Kecelakaan Diri" subtitle="Perlindungan biaya pengobatan akibat kecelakaan" items={PERSONAL_PRODUCTS} onOpen={handleOpenJourney} />
          <SectionShelf icon={Building2} title="Asuransi Harta Benda" subtitle="Perlindungan bangunan dan isi properti dengan simulasi premi dan penawaran digital." items={buildPropertyCatalog(propertyItems)} onOpen={handleOpenJourney} />
          <SectionShelf icon={Car} title="Asuransi Kendaraan" subtitle="Perlindungan motor dan mobil dengan simulasi premi dan penawaran digital." items={buildVehicleCatalog({ motorItem, carTloItem, carCompItem, sessionRole })} onOpen={handleOpenJourney} />
        </div>
      </div>
    </div>
  );
}
