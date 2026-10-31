import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import useAdminPlans from "./hooks/useAdminPlans";

import DashboardHeader from "./Sections/DashboardHeader";
import DashboardMetricsSection from "./Sections/DashboardMetricsSection";
import DashboardFiltersSection from "./Sections/DashboardFiltersSection";
import DesktopPlansTable from "./Sections/DesktopPlansTable";
import MobilePlansList from "./Sections/MobilePlansList";
import DeleteServiceModal from "./Sections/DeleteServiceModal";

export default function AdminPlansDashboard() {
  const { currentUser, isAdmin, isStaff, authLoading } = useAuth();
  const navigate = useNavigate();

  // Security guard: Only admins or staff can view
  useEffect(() => {
    if (!authLoading && (!currentUser || (!isAdmin && !isStaff))) {
      navigate("/login?redirect=/admin/plans");
    }
  }, [currentUser, isAdmin, isStaff, authLoading, navigate]);

  const {
    loading,searchQuery,actionInProgress,statusFilter,paymentFilter,feedback,expandedServiceIds,serviceToDelete,
    setPaymentFilter,setFeedback,setStatusFilter,setSearchQuery,toggleExpand,
    handleToggleStatus,handleConfirmDelete,handleClearFilters,setServiceToDelete,
    metrics,filteredPlans,
  } = useAdminPlans({ currentUser });

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 text-left">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <DashboardHeader userEmail={currentUser?.email} />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-lg p-3 text-xs font-semibold flex items-center justify-between gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {feedback.type === "success" ? "check_circle" : "error"}
              </span>
              {feedback.text}
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[10px] uppercase font-bold opacity-60 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <DashboardMetricsSection metrics={metrics} />

        {/* Filters & Search */}
        <DashboardFiltersSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          onClear={handleClearFilters}
        />

        {/* Plans Table / Cards Container */}
        <div className="rounded-xl border border-gray-200/70 bg-white shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="mt-2.5 text-xs text-text-secondary">Loading services and plans...</p>
            </div>
          ) : filteredPlans.length > 0 ? (
            <div>
              {/* Desktop Table View (lg screens and above) */}
              <DesktopPlansTable
                plans={filteredPlans}
                expandedServiceIds={expandedServiceIds}
                onToggleExpand={toggleExpand}
                onToggleStatus={handleToggleStatus}
                onDeleteClick={setServiceToDelete}
                actionInProgress={actionInProgress}
              />

              {/* Mobile / Tablet Cards View (screens below lg) */}
              <MobilePlansList
                plans={filteredPlans}
                expandedServiceIds={expandedServiceIds}
                onToggleExpand={toggleExpand}
                onToggleStatus={handleToggleStatus}
                onDeleteClick={setServiceToDelete}
                actionInProgress={actionInProgress}
              />
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-gray-300">search_off</span>
              <p className="text-xs font-semibold text-gray-700">No services found</p>
              <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                No services or duration plans matched your search or filter parameters.
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteServiceModal
          service={serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={Boolean(actionInProgress)}
        />
      </div>
    </div>
  );
}
