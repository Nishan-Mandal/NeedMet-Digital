import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ActionHeader from "../../../components/ActionHeader";
import KpiCard from "../../../components/KpiCard";
import TransactionsTableSection from "../Sections/TransactionsTableSection";
import TransactionsPaginationSection from "../Sections/TransactionsPaginationSection";
import TransactionDetailModal from "../Sections/TransactionDetailModal";
import { usePaymentsQuery } from "../hooks/usePaymentsQuery";
import {
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  IndianRupee,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function Payments() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [errorMsg, setErrorMsg] = useState("");

  // Inspect Modal State
  const [detailPayment, setDetailPayment] = useState(null);

  // Sync if URL search changes
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) {
      setSearchQuery(s);
      setDebouncedSearch(s);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: queryResult,
    isLoading: loading,
    refetch,
    error: queryError,
  } = usePaymentsQuery({
    page,
    pageSize: 15,
    status: statusFilter,
    search: debouncedSearch,
  });

  const payments = queryResult?.payments || [];
  const metrics = queryResult?.metrics || {
    totalCount: 0,
    totalVolume: 0,
    successfulCount: 0,
    pendingMandateCount: 0,
    failedCount: 0,
    refundedCount: 0,
  };
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const totalCount = queryResult?.pagination?.total || 0;

  const filterTabs = [
    { value: "ALL", label: "All Payments", count: metrics.totalCount },
    { value: "SUCCESS", label: "Success", count: metrics.successfulCount },
    { value: "PENDING_MANDATE", label: "Mandate Pending", count: metrics.pendingMandateCount },
    { value: "FAILED", label: "Failed", count: metrics.failedCount },
    { value: "REFUNDED", label: "Refunded", count: metrics.refundedCount },
  ];

  const kpiCards = [
    {
      id: "total-payments",
      title: "Total Payments",
      value: metrics.totalCount,
      icon: CreditCard,
      variant: "slate",
      subtitle: "All recorded payments",
    },
    {
      id: "settled-volume",
      title: "Settled Volume",
      value: `₹${metrics.totalVolume.toLocaleString()}`,
      icon: IndianRupee,
      variant: "primary",
      subtitle: "Cleared transaction value",
    },
    {
      id: "successful-payments",
      title: "Captured Payments",
      value: metrics.successfulCount,
      icon: CheckCircle,
      variant: "emerald",
      subtitle: "Success status",
    },
    {
      id: "failed-refunded",
      title: "Action Required / Issues",
      value: metrics.pendingMandateCount + metrics.failedCount + metrics.refundedCount,
      icon: AlertTriangle,
      variant: "rose",
      subtitle: `${metrics.pendingMandateCount} Mandate Pending • ${metrics.failedCount} Failed`,
    },
  ];

  return (
    <div className="space-y-6 w-full font-primary">
      {/* ── KPI Summary Stats (Derived from Model) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpiCards.map((kpi) => (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            variant={kpi.variant}
            loading={loading}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Unified Action & Filter Toolbar */}
      <ActionHeader
        filters={filterTabs}
        activeFilter={statusFilter}
        onFilterChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        searchPlaceholder="Search Payment ID, User, Order ID, Bank..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refetch}
        refreshing={loading}
      />

      {/* Alerts */}
      {(errorMsg || queryError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg || queryError?.message || "Failed to retrieve payments ledger from Firestore."}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-red-500 hover:text-red-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Payments Table Section */}
      <TransactionsTableSection
        loading={loading}
        payments={payments}
        searchQuery={debouncedSearch}
        onInspect={(payment) => setDetailPayment(payment)}
      />

      {/* Pagination Footer Section */}
      <TransactionsPaginationSection
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => setPage(p)}
      />

      {/* Payment Detail Modal Section */}
      <TransactionDetailModal
        payment={detailPayment}
        onClose={() => setDetailPayment(null)}
      />
    </div>
  );
}

