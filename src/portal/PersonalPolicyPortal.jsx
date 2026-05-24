import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_BILLING_ITEMS, DEFAULT_CLAIMS, DEFAULT_OFFICIAL_CONTACTS, DEFAULT_POLICIES } from "./portalData.js";
import { normalizePortalMenu, readPortalMenu, replacePortalMenu, writePortalMenu } from "./portalNavigation.js";
import { TopBar, Sidebar, MobileTabs, PageShell } from "./components/portalComponents.jsx";
import { DashboardView } from "./views/DashboardView.jsx";
import { PoliciesView } from "./views/PoliciesView.jsx";
import { ClaimsView } from "./views/ClaimsView.jsx";
import { CartView } from "./views/CartView.jsx";
import { HelpView } from "./views/HelpView.jsx";
import { SettingsView } from "./views/SettingsView.jsx";

export default function PersonalPolicyPortal({
  sessionName = "ayu1797",
  onGoHome,
  onExit,
  policies: incomingPolicies,
  claims: incomingClaims,
  billingItems: incomingBillingItems,
  contacts: incomingContacts,
  defaultTab = "dashboard",
}) {
  const policies = incomingPolicies?.length ? incomingPolicies : DEFAULT_POLICIES;
  const claims = incomingClaims?.length ? incomingClaims : DEFAULT_CLAIMS;
  const billingItems = incomingBillingItems?.length ? incomingBillingItems : DEFAULT_BILLING_ITEMS;
  const contacts = incomingContacts?.length ? incomingContacts : DEFAULT_OFFICIAL_CONTACTS;
  const [activeMenu, setActiveMenu] = useState(() => readPortalMenu(defaultTab));
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const handleMenuChange = useCallback((nextMenu) => {
    const normalizedMenu = normalizePortalMenu(nextMenu);
    setActiveMenu(normalizedMenu);
    writePortalMenu(normalizedMenu);
  }, []);

  useEffect(() => {
    replacePortalMenu(readPortalMenu(defaultTab));
    const handlePopState = () => setActiveMenu(readPortalMenu(defaultTab));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultTab]);

  const content = useMemo(() => {
    if (activeMenu === "dashboard") return <DashboardView policies={policies} claims={claims} billingItems={billingItems} setActiveMenu={handleMenuChange} />;
    if (activeMenu === "claims") return <ClaimsView claims={claims} policies={policies} />;
    if (activeMenu === "help") return <HelpView contacts={contacts} />;
    if (activeMenu === "cart") return <CartView billingItems={billingItems} policies={policies} />;
    if (activeMenu === "settings") return <SettingsView sessionName={sessionName} />;
    return (
      <PoliciesView
        policies={policies}
        claims={claims}
        billingItems={billingItems}
        selectedPolicyId={selectedPolicyId}
        setSelectedPolicyId={setSelectedPolicyId}
      />
    );
  }, [activeMenu, billingItems, claims, contacts, handleMenuChange, policies, selectedPolicyId, sessionName]);

  return (
    <div className="min-h-screen bg-white text-[#041E42]">
      <TopBar sessionName={sessionName} onGoHome={onGoHome} onExit={onExit} />
      <Sidebar activeMenu={activeMenu} setActiveMenu={handleMenuChange} />
      <PageShell>
        <MobileTabs activeMenu={activeMenu} setActiveMenu={handleMenuChange} />
        {content}
      </PageShell>
    </div>
  );
}
