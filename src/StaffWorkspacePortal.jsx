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
  const canManageUsers = ["checker", "approver"].includes(String(staffRole).toLowerCase());
  const [activeMenu, setActiveMenu] = useState(() => readPortalMenu(defaultTab));
  const availableNavItems = useMemo(
    () => STAFF_NAV_ITEMS.filter((item) => item.key !== "add-user" || canManageUsers),
    [canManageUsers],
  );
  const effectiveActiveMenu = availableNavItems.some((item) => item.key === activeMenu) ? activeMenu : "dashboard";
  const handleMenuChange = useCallback((nextMenu) => {
    const normalizedMenu = normalizePortalMenu(nextMenu);
    if (!availableNavItems.some((item) => item.key === normalizedMenu)) return;
    setActiveMenu(normalizedMenu);
    writePortalMenu(normalizedMenu);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [availableNavItems]);

  useEffect(() => {
    replacePortalMenu(readPortalMenu(defaultTab));
    const handlePopState = () => {
      setActiveMenu(readPortalMenu(defaultTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultTab]);

  const content = useMemo(() => {
    if (effectiveActiveMenu === "dashboard") return <DashboardView />;
    if (effectiveActiveMenu === "tasklist") return <TasklistView staffRole={staffRole} />;
    if (effectiveActiveMenu === "buat-penawaran") return <OfferProductsView />;
    if (effectiveActiveMenu === "add-partner") return <AddPartnerView />;
    if (effectiveActiveMenu === "promotion") return <PromotionView />;
    if (effectiveActiveMenu === "transaksi-polis") return <PolicyTransactionsView />;
    if (effectiveActiveMenu === "riwayat-klaim") return <ClaimHistoryView />;
    if (effectiveActiveMenu === "add-user" && canManageUsers) return <AddUserView />;
    if (effectiveActiveMenu === "master-data") return <MasterDataView />;
    if (effectiveActiveMenu === "settings") return <StaffSettingsView sessionName={staffSessionName} />;
    return <DashboardView />;
  }, [canManageUsers, effectiveActiveMenu, staffRole, staffSessionName]);

  return (
    <div className="min-h-screen bg-white text-[#041E42]" style={{ fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <TopBar sessionName={staffSessionName} onGoHome={onGoHome} onExit={onExit} />
      <Sidebar activeMenu={effectiveActiveMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} sessionName={sessionProfile?.name || staffSessionName} staffRole={staffRole} onLogout={onExit} />
      <PageShell>
        <WorkspaceFilters activeMenu={effectiveActiveMenu} setActiveMenu={handleMenuChange} navItems={availableNavItems} />
        {content}
      </PageShell>
    </div>
  );
}
