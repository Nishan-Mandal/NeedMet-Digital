import React from "react";
import { useSearchParams } from "react-router-dom";
import TransactionsNavTabs from "../components/TransactionsNavTabs";
import PurchasesTabSection from "../Sections/PurchasesTabSection";
import PaymentsTabSection from "../Sections/PaymentsTabSection";
import UpcomingEmiTabSection from "../Sections/UpcomingEmiTabSection";
import { useTransactionsData } from "../hooks/useTransactionsData";

/**
 * Unified Transactions Page for NeedMet Digital Admin.
 * Combines Purchases, Payments, and Upcoming EMI Payments into a single view
 * with top navigation tabs.
 *
 * Uses cached purchase/payment data across tabs to prevent duplicate network calls.
 */
export default function Transactions({ defaultTab = "purchases" }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL or fallback to defaultTab
  const urlTab = searchParams.get("tab");
  const validTabs = ["purchases", "payments", "upcoming-emi"];
  const activeTab = validTabs.includes(urlTab) ? urlTab : defaultTab;

  const currentSearch = searchParams.get("search") || "";

  // Master hook that reuses already-fetched data or fetches if absent
  const { counts } = useTransactionsData();

  // Handle Tab Switch:
  // Always clear search param when switching tabs so tab-specific search/order IDs don't bleed or stick.
  const handleTabChange = (newTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", newTab);
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  // Synchronize search query with URL search param:
  // If search is cleared (e.g. crossing search bar with 'X'), delete 'search' from URL immediately.
  const handleSearchUpdate = (newSearch) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmed = (newSearch || "").trim();
    if (trimmed) {
      if (nextParams.get("search") !== trimmed) {
        nextParams.set("search", trimmed);
        setSearchParams(nextParams, { replace: true });
      }
    } else {
      if (nextParams.has("search")) {
        nextParams.delete("search");
        setSearchParams(nextParams, { replace: true });
      }
    }
  };

  return (
    <div className="w-full font-primary space-y-6">
      {/* ── Top Navigation Tabs (Purchases, Payments, Upcoming EMI Payments) ── */}
      <TransactionsNavTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* ── Active Tab View ── */}
      {activeTab === "purchases" && (
        <PurchasesTabSection
          initialSearch={currentSearch}
          onSearchUpdate={handleSearchUpdate}
        />
      )}

      {activeTab === "payments" && (
        <PaymentsTabSection
          initialSearch={currentSearch}
          onSearchUpdate={handleSearchUpdate}
        />
      )}

      {activeTab === "upcoming-emi" && (
        <UpcomingEmiTabSection
          initialSearch={currentSearch}
          onSearchUpdate={handleSearchUpdate}
        />
      )}
    </div>
  );
}
