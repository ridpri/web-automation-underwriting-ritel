import { Suspense } from "react";
import { buildTimelineEvent } from "../operatingLayer.js";
import JourneyFallback from "./JourneyFallback.jsx";
import { clearSharedJourneyParams, normalizeJourneyEntryUrl, resolveRoleLabel } from "./journeyAccess.js";
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
  StaffWorkspacePortal,
} from "./lazyJourneys.js";

export default function JourneyRouter({
  resolvedActiveJourney,
  sessionRole,
  activeSessionName,
  activeSessionProfile,
  isAuthenticatedCustomerSession,
  operatingRecords,
  updateOperatingRecord,
  getActiveRecord,
  setActiveTransactionId,
  setActiveJourney,
  partnerConfigRole,
  setPartnerConfigRole,
  exitSharedJourneyToProducts,
  externalAccountMenuItems,
  fallback = null,
}) {
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
          onOpenWorkbench={() => openJourney("review-internal")}
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

  const openJourney = (target) => {
    clearSharedJourneyParams();
    normalizeJourneyEntryUrl(target);
    setActiveJourney(target);
  };
  const internalMenuHandlers = {
    onOpenWorkspace: () => openJourney("internal-workspace"),
    onOpenQueue: () => openJourney("review-internal"),
    onOpenPartnerConfig: () => openJourney("partner-config"),
  };
  const returnToProducts = exitSharedJourneyToProducts || (() => setActiveJourney(""));

  if (resolvedActiveJourney === "review-internal") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <ReviewWorkbench
          records={operatingRecords}
          allRecords={operatingRecords}
          onBack={returnToProducts}
          onOpenJourney={(record) => { setActiveTransactionId(record.id); openJourney(record.journeyKey); }}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
          onNavigateHome={returnToProducts}
          onNavigateProducts={returnToProducts}
          onOpenWorkspace={() => openJourney("internal-workspace")}
          onOpenQueue={() => openJourney("review-internal")}
          onOpenPartnerConfig={() => openJourney("partner-config")}
          onUpdateRecord={updateOperatingRecord}
        />
      </Suspense>
    );
  }

  if (resolvedActiveJourney === "internal-workspace") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <StaffWorkspacePortal
          sessionName={activeSessionName}
          onGoHome={returnToProducts}
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
          onOpenPolicies={() => openJourney("self-care-portal")}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
          onOpenPolicies={() => openJourney("self-care-portal")}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onExit={returnToProducts}
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
          onGoHome={returnToProducts}
          onExit={returnToProducts}
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
          onExit={returnToProducts}
          onOpenWorkspace={() => openJourney("internal-workspace")}
          onOpenQueue={() => openJourney("review-internal")}
          onOpenPartnerConfig={() => openJourney("partner-config")}
          sessionName={activeSessionName}
          sessionRoleLabel={resolveRoleLabel(sessionRole)}
        />
      </Suspense>
    );
  }

  if (resolvedActiveJourney === "brd-property-safe") {
    return (
      <Suspense fallback={<JourneyFallback />}>
        <PropertySafeBrdPage onBack={returnToProducts} />
      </Suspense>
    );
  }

  return fallback;
}
