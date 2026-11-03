import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import useAdminPlans from "./hooks/useAdminPlans";

import DashboardHeader from "./Sections/DashboardHeader";
import DashboardMetricsSection from "./Sections/DashboardMetricsSection";
import DashboardFiltersSection from "./Sections/DashboardFiltersSection";
import DesktopPlansTable from "./Sections/DesktopPlansTable";
import MobilePlansList from "./Sections/MobilePlansList";
import DeleteServiceModal from "./Sections/DeleteServiceModal";
import ClonePlanModal from "./Sections/ClonePlanModal";

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
    loading,searchQuery,actionInProgress,statusFilter,paymentFilter,feedback,expandedServiceIds,serviceToDelete,
    setPaymentFilter,setFeedback,setStatusFilter,setSearchQuery,toggleExpand,
    handleToggleStatus,handleConfirmDelete,handleClearFilters,setServiceToDelete,
    metrics,filteredPlans,
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

  return (
    <div className="min-h-screen bg-slate-50/50 py-3 sm:py-6 px-3 sm:px-6 lg:px-8 text-left">
      <div className="mx-auto max-w-7xl space-y-3.5 sm:space-y-4">
        {/* Header */}
        <DashboardHeader userEmail={currentUser?.email} />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl sm:rounded-lg p-3 text-sm sm:text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg sm:text-base shrink-0">
                {feedback.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs sm:text-[10px] uppercase font-bold opacity-70 hover:opacity-100 cursor-pointer min-h-[32px] sm:min-h-0 px-2 py-1"
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
        <div className="rounded-2xl sm:rounded-xl border border-gray-200/70 bg-white shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-10 sm:p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="mt-3 text-sm sm:text-xs font-semibold text-text-secondary">Loading services and plans...</p>
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
                onCloneClick={setPlanToClone}
                actionInProgress={actionInProgress}
              />

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
            </div>
          ) : (
            <div className="p-10 sm:p-12 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
              <p className="text-sm font-bold text-gray-800">No services found</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
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

        {/* Clone Confirmation Modal */}
        <ClonePlanModal
          service={planToClone}
          onClose={() => setPlanToClone(null)}
          onConfirm={handleConfirmClone}
        />
      </div>
    </div>
  );
}
