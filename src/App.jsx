import { useEffect, useMemo, useState } from "react";
import JourneyRouter from "./app/JourneyRouter.jsx";
import ProductionHome from "./app/ProductionHome.jsx";
import SsoLoginPage from "./app/SsoLoginPage.jsx";
import { useOperatingRecords } from "./app/useOperatingRecords.js";
import {
  SESSION_ROLE_STORAGE_KEY,
  clearSharedJourneyParams,
  hasMatchingShareContext,
  isExternalUrl,
  normalizeJourneyEntryUrl,
  resolveInitialNavigationState,
  resolveUrlSessionRole,
  sanitizeJourneyForRole,
} from "./app/journeyAccess.js";
import { resolveSessionName, resolveSessionProfile } from "./app/sessionConfig.js";

const SSO_SESSION_STORAGE_KEY = "underwriting-demo-sso-session";

function readSsoSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(SSO_SESSION_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export default function App() {
  const initialNavigationState = useMemo(() => resolveInitialNavigationState(), []);
  const initialSsoSession = useMemo(() => readSsoSession(), []);
  const [activeJourney, setActiveJourney] = useState(initialNavigationState.activeJourney);
  const [sessionRole, setSessionRole] = useState(initialSsoSession?.sessionRole || initialNavigationState.sessionRole);
  const [ssoSession, setSsoSession] = useState(initialSsoSession);
  const [showSsoLogin, setShowSsoLogin] = useState(false);
  const [partnerConfigRole, setPartnerConfigRole] = useState("Maker");
  const allowSharedOfferJourney = useMemo(() => hasMatchingShareContext(activeJourney), [activeJourney]);
  const resolvedActiveJourney = useMemo(
    () => sanitizeJourneyForRole(activeJourney, sessionRole, { allowSharedOfferJourney }),
    [activeJourney, allowSharedOfferJourney, sessionRole],
  );
  const activeSessionName = resolveSessionName(sessionRole);
  const activeSessionProfile = resolveSessionProfile(sessionRole);
  const isAuthenticatedCustomerSession = sessionRole === "external" || sessionRole === "partner";
  const {
    operatingRecords,
    setActiveTransactionId,
    updateOperatingRecord,
    getActiveRecord,
  } = useOperatingRecords(activeSessionName);
  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (!win) return;
    if (sessionRole) win.sessionStorage.setItem(SESSION_ROLE_STORAGE_KEY, sessionRole);
    else win.sessionStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
  }, [sessionRole]);

  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (!win) return;
    if (ssoSession) win.sessionStorage.setItem(SSO_SESSION_STORAGE_KEY, JSON.stringify(ssoSession));
    else win.sessionStorage.removeItem(SSO_SESSION_STORAGE_KEY);
  }, [ssoSession]);

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
    normalizeJourneyEntryUrl(target);
    const matchingRecord = operatingRecords.find((item) => item.journeyKey === target);
    if (matchingRecord) setActiveTransactionId(matchingRecord.id);
    setActiveJourney(target);
  };

  const exitSharedJourneyToProducts = () => {
    clearSharedJourneyParams();
    setActiveJourney("");
  };
  const externalAccountMenuItems = [
    {
      label: "Polis Saya",
      primary: true,
      onClick: () => handleOpenJourney("self-care-portal"),
    },
  ];

  if (showSsoLogin) {
    return (
      <SsoLoginPage
        onBack={() => setShowSsoLogin(false)}
        onAuthenticated={(session) => {
          setSsoSession(session);
          setSessionRole(session.sessionRole);
          setActiveJourney(session.sessionRole === "internal" ? "internal-workspace" : "");
          setShowSsoLogin(false);
        }}
      />
    );
  }

  return (
    <JourneyRouter
      resolvedActiveJourney={resolvedActiveJourney}
      sessionRole={sessionRole}
      activeSessionName={activeSessionName}
      activeSessionProfile={activeSessionProfile}
      isAuthenticatedCustomerSession={isAuthenticatedCustomerSession}
      operatingRecords={operatingRecords}
      updateOperatingRecord={updateOperatingRecord}
      getActiveRecord={getActiveRecord}
      setActiveTransactionId={setActiveTransactionId}
      setActiveJourney={setActiveJourney}
      partnerConfigRole={partnerConfigRole}
      setPartnerConfigRole={setPartnerConfigRole}
      exitSharedJourneyToProducts={exitSharedJourneyToProducts}
      externalAccountMenuItems={externalAccountMenuItems}
      fallback={
        <ProductionHome
          sessionRole={sessionRole}
          sessionName={activeSessionName}
          onOpenJourney={handleOpenJourney}
          onSelectRole={setSessionRole}
          onGuestLogin={() => setShowSsoLogin(true)}
        />
      }
    />
  );
}
