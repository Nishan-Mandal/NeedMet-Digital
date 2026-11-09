import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useUserPurchasesQuery } from "../../hooks/queries/useUserPurchasesQuery";
import { isPurchasePendingMandate } from "./utils/profile.utils";

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

  const [planFilter, setPlanFilter] = useState(mandatePendingParam ? "pending_mandate" : "all");
  const [pageSize, setPageSize] = useState(6);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorStack, setCursorStack] = useState([null]);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login?redirect=/profile");
    }
  }, [currentUser, authLoading, navigate]);

  const currentCursor = cursorStack[pageIndex] || null;

  // TanStack Query for cursor-paginated user purchases (staleTime 2m, auto-cache)
  const {
    data: queryResult,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
  } = useUserPurchasesQuery({
    userId: currentUser?.uid,
    status: planFilter,
    pageSize,
    cursor: currentCursor,
  });

  const purchases = queryResult?.purchases || [];
  const hasNextPage = Boolean(queryResult?.hasMore);
  const hasPreviousPage = pageIndex > 0;

  const handleNextPage = useCallback(() => {
    if (hasNextPage && queryResult?.lastDoc) {
      setCursorStack((prev) => {
        const next = [...prev];
        next[pageIndex + 1] = queryResult.lastDoc;
        return next;
      });
      setPageIndex((prev) => prev + 1);
    }
  }, [hasNextPage, queryResult?.lastDoc, pageIndex]);

  const handlePreviousPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  }, [pageIndex]);

  const handleFilterChange = (filterKey) => {
    setPlanFilter(filterKey);
    setPageIndex(0);
    setCursorStack([null]);
  };

  const scrollToPlans = (filterKey) => {
    if (filterKey) handleFilterChange(filterKey);
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pendingMandatePurchases = useMemo(
    () => purchases.filter(isPurchasePendingMandate),
    [purchases]
  );

  if (authLoading || (!currentUser && isQueryLoading)) {
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

        {/* Section 4: Purchased Plans Section (Filter tabs, Search, Responsive Grid with Server Pagination) */}
        <PurchasedPlansSection
          purchases={purchases}
          loading={isQueryLoading}
          planFilter={planFilter}
          onFilterChange={handleFilterChange}
          highlightedPurchaseId={highlightedPurchaseId}
          sectionRef={plansSectionRef}
          currentPage={pageIndex + 1}
          pageSize={pageSize}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
