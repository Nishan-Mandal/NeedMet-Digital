import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { fetchUserPurchases, fetchUserPlans } from "../../services/db";
import { reconcileUserPurchases, isPurchasePendingMandate } from "./utils/profile.utils";

import ProfileHeader from "./Sections/ProfileHeader";
import ProfileSummaryMetrics from "./Sections/ProfileSummaryMetrics";
import MandateAlertBanner from "./Sections/MandateAlertBanner";
import PurchasedPlansSection from "./Sections/PurchasedPlansSection";

export default function ProfilePage() {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mandatePendingParam = searchParams.get("mandate_pending") === "true";
  const highlightedPurchaseId = searchParams.get("purchaseId");

  const plansSectionRef = useRef(null);

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState(mandatePendingParam ? "pending_mandate" : "all");

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login?redirect=/profile");
    }
  }, [currentUser, authLoading, navigate]);

  // Load user purchases and entitlements (Single Collection Authoritative Query with fallback)
  const loadPurchases = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      // 1. Authoritative fetch from 'purchases' collection (cached in-memory, targeted metadata)
      const purchasesData = await fetchUserPurchases(currentUser.uid, { forceRefresh: true });

      // 2. Fetch user entitlements from users/{uid}.plans for backward compatibility
      const legacyPlans = await fetchUserPlans(currentUser.uid);

      // 3. Reconcile and deduplicate across both authoritative purchases and legacy entitlements
      const unifiedPurchases = reconcileUserPurchases(purchasesData || [], legacyPlans || [], []);

      setPurchases(unifiedPurchases || []);
    } catch (err) {
      console.error("Error loading user profile plans:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.uid) {
      loadPurchases();
    }
  }, [currentUser, loadPurchases]);

  const scrollToPlans = (filterKey) => {
    if (filterKey) setPlanFilter(filterKey);
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pendingMandatePurchases = useMemo(
    () => purchases.filter(isPurchasePendingMandate),
    [purchases]
  );

  if (authLoading || (!currentUser && loading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary py-4 sm:py-6 md:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5 md:space-y-6">
        {/* Section 1: User Profile Header */}
        <ProfileHeader />

        {/* Section 2: Summary Metrics Cards */}
        <ProfileSummaryMetrics
          purchases={purchases}
          activeFilter={planFilter}
          onSelectFilter={scrollToPlans}
        />

        {/* Section 3: Global Mandate Action Banner */}
        <MandateAlertBanner
          pendingCount={pendingMandatePurchases.length}
          onActionClick={() => scrollToPlans("pending_mandate")}
        />

        {/* Section 4: Purchased Plans Section (Filter tabs, Search, Responsive Grid) */}
        <PurchasedPlansSection
          purchases={purchases}
          loading={loading}
          planFilter={planFilter}
          onFilterChange={setPlanFilter}
          highlightedPurchaseId={highlightedPurchaseId}
          sectionRef={plansSectionRef}
        />
      </div>
    </div>
  );
}
