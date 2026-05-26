import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  PageShell,
  Sidebar,
  TopBar,
  WorkspaceFilters,
} from "./staff-workspace/staffWorkspaceShared";
import {
  STAFF_NAV_ITEMS,
  normalizePortalMenu,
  readPortalMenu,
  replacePortalMenu,
  writePortalMenu,
} from "./staff-workspace/staffWorkspaceNavigation";
import AddPartnerView from "./staff-workspace/views/AddPartnerView";
import AddUserView from "./staff-workspace/views/AddUserView";
import ClaimHistoryView from "./staff-workspace/views/ClaimHistoryView";
import DashboardView from "./staff-workspace/views/DashboardView";
import MasterDataView from "./staff-workspace/views/MasterDataView";
import OfferProductsView from "./staff-workspace/views/OfferProductsView";
import PolicyTransactionsView from "./staff-workspace/views/PolicyTransactionsView";
import PromotionView from "./staff-workspace/views/PromotionView";
import StaffSettingsView from "./staff-workspace/views/StaffSettingsView";
import TasklistView from "./staff-workspace/views/TasklistView";

export default function StaffWorkspacePortal({
  sessionName = "Budi Santoso",
  sessionProfile,
  onGoHome,
  onExit,
  defaultTab = "dashboard",
}) {
  const staffSessionName = sessionName;
  const staffRole = sessionProfile?.staffRole || "Maker";
  const [activeMenu, setActiveMenu] = useState(() => readPortalMenu(defaultTab));
  const availableNavItems = STAFF_NAV_ITEMS;
  const handleMenuChange = useCallback((nextMenu) => {
    const normalizedMenu = normalizePortalMenu(nextMenu);
    setActiveMenu(normalizedMenu);
    writePortalMenu(normalizedMenu);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    replacePortalMenu(readPortalMenu(defaultTab));
    const handlePopState = () => {
      setActiveMenu(readPortalMenu(defaultTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultTab]);

  const content = useMemo(() => {
    if (activeMenu === "dashboard") return <DashboardView />;
    if (activeMenu === "tasklist") return <TasklistView staffRole={staffRole} />;
    if (activeMenu === "buat-penawaran") return <OfferProductsView />;
    if (activeMenu === "add-partner") return <AddPartnerView />;
    if (activeMenu === "promotion") return <PromotionView />;
    if (activeMenu === "transaksi-polis") return <PolicyTransactionsView />;
    if (activeMenu === "riwayat-klaim") return <ClaimHistoryView />;
    if (activeMenu === "add-user") return <AddUserView />;
    if (activeMenu === "master-data") return <MasterDataView />;
    if (activeMenu === "settings") return <StaffSettingsView sessionName={staffSessionName} />;
    return <DashboardView />;
  }, [activeMenu, staffRole, staffSessionName]);

  return (
    <div className="min-h-screen bg-white text-[#041E42]" style={{ fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <TopBar sessionName={staffSessionName} onGoHome={onGoHome} onExit={onExit} />
      <Sidebar activeMenu={activeMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} sessionName={sessionProfile?.name || staffSessionName} staffRole={staffRole} onLogout={onExit} />
      <PageShell>
        <WorkspaceFilters activeMenu={activeMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} />
        {content}
      </PageShell>
    </div>
  );
}
