import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import useAdminPlans from "../hooks/useAdminPlans";
import ActionHeader from "../../../components/ActionHeader";

import DashboardMetricsSection from "../sections/dashboard/DashboardMetricsSection";
import DesktopPlansTable from "../sections/dashboard/DesktopPlansTable";
import MobilePlansList from "../sections/dashboard/MobilePlansList";
import DeleteServiceModal from "../sections/dashboard/DeleteServiceModal";
import ClonePlanModal from "../sections/dashboard/ClonePlanModal";
import PaginationControl from "../../../components/PaginationControl";

export default function AdminPlansDashboard() {
  const { currentUser, isAdmin, isStaff, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [planToClone, setPlanToClone] = useState(null);

  // Security guard: Only admins or staff can view
  useEffect(() => {
    if (!authLoading && (!currentUser || (!isAdmin && !isStaff))) {
      navigate("/login?redirect=/admin/plans");
    }
  }, [currentUser, isAdmin, isStaff, authLoading, navigate]);

  const {
    plans = [],
    loading,
    isFetching,
    searchQuery,
    actionInProgress,
    statusFilter,
    paymentFilter,
    feedback,
    expandedServiceIds,
    serviceToDelete,
    loadPlans,
    setPaymentFilter,
    setFeedback,
    setStatusFilter,
    setSearchQuery,
    toggleExpand,
    handleToggleStatus,
    handleConfirmDelete,
    setServiceToDelete,
    metrics,
    filteredPlans,
    currentPage,
    pageSize,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    onPageSizeChange,
    totalItems,
  } = useAdminPlans({ currentUser });

  // Consume feedback from navigation state (e.g. after cloning or creating a plan)
  useEffect(() => {
    if (location.state?.feedback) {
      setFeedback(location.state.feedback);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setFeedback]);

  const handleConfirmClone = () => {
    if (!planToClone) return;
    const cloneId = planToClone.id;
    setPlanToClone(null);
    navigate(`/admin/plans/new?cloneFrom=${cloneId}`);
  };

  const filterTabs = [
    { label: "All Plans", value: "all", count: plans.length },
    {
      label: "Published",
      value: "published",
      count: plans.filter((p) => p.status === "published" || p.isActive === true).length,
    },
    {
      label: "Draft",
      value: "draft",
      count: plans.filter((p) => p.status === "draft" || (!p.isActive && p.status !== "archived")).length,
    },
    {
      label: "Archived",
      value: "archived",
      count: plans.filter((p) => p.status === "archived").length,
    },
  ];

  return (
    <div className="space-y-6 w-full font-primary">
      {/* Unified Action & Filter Toolbar */}
      <ActionHeader
        filters={filterTabs}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        searchPlaceholder="Search service, plan, or category..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadPlans}
        refreshing={isFetching || loading}
        actionLabel="Create Plan"
        actionTo="/admin/plans/new"
      >
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3.5 py-2 sm:py-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f5c3e] cursor-pointer shrink-0 shadow-2xs hover:shadow-xs transition"
        >
          <option value="all">All Payment Modes</option>
          <option value="BOTH">Full & EMI</option>
          <option value="EMI">EMI Only</option>
          <option value="FULL">Full Only</option>
        </select>
      </ActionHeader>

      {/* Metric Cards */}
      <DashboardMetricsSection metrics={metrics} />

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`rounded-xl p-3.5 text-sm font-semibold flex items-center justify-between gap-2 shadow-2xs ${
            feedback.type === "success"
              ? "bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]/70"
              : "bg-red-50 text-red-700 border border-red-200/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-bold opacity-70 hover:opacity-100 cursor-pointer px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Plans Table / Cards Section */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200/60 bg-white shadow-xs">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[#0f5c3e] border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading services and plans...</p>
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View (lg screens and above) */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-sm transition-shadow duration-200">
            <DesktopPlansTable
              plans={filteredPlans}
              expandedServiceIds={expandedServiceIds}
              onToggleExpand={toggleExpand}
              onToggleStatus={handleToggleStatus}
              onDeleteClick={setServiceToDelete}
              onCloneClick={setPlanToClone}
              actionInProgress={actionInProgress}
            />
          </div>

          {/* Mobile / Tablet Cards View (screens below lg) */}
          <MobilePlansList
            plans={filteredPlans}
            expandedServiceIds={expandedServiceIds}
            onToggleExpand={toggleExpand}
            onToggleStatus={handleToggleStatus}
            onDeleteClick={setServiceToDelete}
            onCloneClick={setPlanToClone}
            actionInProgress={actionInProgress}
          />

          {/* Server-Side Pagination Bar */}
          <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-xs">
            <PaginationControl
              currentPage={currentPage}
              pageSize={pageSize}
              hasPreviousPage={hasPreviousPage}
              hasNextPage={hasNextPage}
              onPreviousPage={onPreviousPage}
              onNextPage={onNextPage}
              currentCount={filteredPlans.length}
              totalItems={totalItems}
              loading={loading || isFetching}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-200/60 bg-white shadow-xs space-y-2">
          <p className="text-sm font-bold text-slate-800">No services found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            No services or duration plans matched your search or filter parameters.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteServiceModal
        service={serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={Boolean(actionInProgress)}
      />

      {/* Clone Confirmation Modal */}
      <ClonePlanModal
        service={planToClone}
        onClose={() => setPlanToClone(null)}
        onConfirm={handleConfirmClone}
      />
    </div>
  );
}
