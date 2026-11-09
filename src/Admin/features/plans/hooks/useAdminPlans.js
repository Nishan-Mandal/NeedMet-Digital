import { useState, useEffect, useMemo, useCallback } from "react";
import { filterServicesAndPlans, calculateServiceMetrics } from "../utils/dashboard.utils";
import {
  usePlansQuery,
  usePlanMetricsQuery,
  usePlanMutations,
} from "../../../hooks/queries/usePlansQuery";

export default function useAdminPlans({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [feedback, setFeedback] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [expandedServiceIds, setExpandedServiceIds] = useState(new Set());
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Pagination cursor stack
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorStack, setCursorStack] = useState([null]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setPageIndex(0);
    setCursorStack([null]);
  }, []);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    setPageIndex(0);
    setCursorStack([null]);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPageIndex(0);
    setCursorStack([null]);
  }, []);

  const currentCursor = cursorStack[pageIndex] || null;

  // TanStack Query for cursor-paginated plans
  const {
    data: queryResult,
    isLoading,
    isFetching,
    refetch,
  } = usePlansQuery({
    status: statusFilter,
    search: debouncedSearch,
    pageSize,
    cursor: currentCursor,
  });

  // Metrics server-side query
  const { data: serverMetrics } = usePlanMetricsQuery();
  const { publishMutation, archiveMutation, deleteMutation } = usePlanMutations();

  const plans = queryResult?.plans || [];
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

  // Toggle row expand/collapse
  const toggleExpand = useCallback((serviceId) => {
    setExpandedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  }, []);

  // Status transitions
  const handleToggleStatus = useCallback(
    async (plan) => {
      const planId = plan.id;
      const isCurrentlyPublished = plan.status === "published";
      setActionInProgress(planId);
      setFeedback(null);

      try {
        if (isCurrentlyPublished) {
          await archiveMutation.mutateAsync({ id: planId, currentUser });
          setFeedback({ type: "success", text: `Service "${plan.name}" archived successfully.` });
        } else {
          await publishMutation.mutateAsync({ id: planId, currentUser });
          setFeedback({ type: "success", text: `Service "${plan.name}" published successfully.` });
        }
      } catch (err) {
        console.error("Error changing service status:", err);
        setFeedback({ type: "error", text: err.message || "Failed to update service status." });
      } finally {
        setActionInProgress(null);
      }
    },
    [currentUser, archiveMutation, publishMutation]
  );

  // Delete plan
  const handleConfirmDelete = useCallback(async () => {
    if (!serviceToDelete) return;
    const planId = serviceToDelete.id;
    setActionInProgress(planId);
    setFeedback(null);

    try {
      await deleteMutation.mutateAsync(planId);
      setFeedback({ type: "success", text: `Service "${serviceToDelete.name}" deleted permanently.` });
      setServiceToDelete(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      setFeedback({ type: "error", text: err.message || "Failed to delete service." });
    } finally {
      setActionInProgress(null);
    }
  }, [serviceToDelete, deleteMutation]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setPageIndex(0);
    setCursorStack([null]);
  }, []);

  // Filtered plans
  const filteredPlans = useMemo(
    () => filterServicesAndPlans(plans, { statusFilter, paymentFilter, searchQuery: debouncedSearch }),
    [plans, statusFilter, paymentFilter, debouncedSearch]
  );

  // Compute metrics (combining server count and in-memory details)
  const metrics = useMemo(() => {
    if (serverMetrics) {
      return {
        total: serverMetrics.total || 0,
        published: serverMetrics.published || 0,
        draft: serverMetrics.draft || 0,
        archived: serverMetrics.archived || 0,
        active: serverMetrics.published || 0,
        totalPlans: serverMetrics.total || 0,
      };
    }
    return calculateServiceMetrics(plans);
  }, [serverMetrics, plans]);

  return {
    plans,
    loading: isLoading,
    isFetching,
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    paymentFilter,
    setPaymentFilter,
    feedback,
    setFeedback,
    actionInProgress,
    expandedServiceIds,
    toggleExpand,
    serviceToDelete,
    setServiceToDelete,
    loadPlans: refetch,
    handleToggleStatus,
    handleConfirmDelete,
    handleClearFilters,
    metrics,
    filteredPlans,
    // Pagination controls
    currentPage: pageIndex + 1,
    pageSize,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage: handlePreviousPage,
    onNextPage: handleNextPage,
    onPageSizeChange: handlePageSizeChange,
    totalItems: serverMetrics?.total ?? null,
  };
}
