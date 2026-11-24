import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ActionHeader from "../../../components/ActionHeader";
import KpiCard from "../../../components/KpiCard";
import TransactionsTableSection from "../../payments/Sections/TransactionsTableSection";
import TransactionsPaginationSection from "../../payments/Sections/TransactionsPaginationSection";
import TransactionDetailModal from "../../payments/Sections/TransactionDetailModal";
import { usePaymentsQuery } from "../../payments/hooks/usePaymentsQuery";
import {
  AlertCircle,
  X,
  CreditCard,
  IndianRupee,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";
import { exportPaymentLedgerCsv } from "../../reports/services/reportExport.service";

export default function PaymentsTabSection({ initialSearch = "", onSearchUpdate, onCountUpdate }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [errorMsg, setErrorMsg] = useState("");

  // Inspect Modal State
  const [detailPayment, setDetailPayment] = useState(null);

  useEffect(() => {
    setSearchQuery(initialSearch || "");
    setDebouncedSearch(initialSearch || "");
    setPage(1);
  }, [initialSearch]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearch(trimmed);
      setPage(1);
      if (onSearchUpdate) {
        onSearchUpdate(trimmed);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchUpdate]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val) {
      setDebouncedSearch("");
      setPage(1);
      if (onSearchUpdate) {
        onSearchUpdate("");
      }
    }
  };

  const handleRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "transactions", "allPayments"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    await refetch();
  };

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

  useEffect(() => {
    if (metrics?.totalCount !== undefined && onCountUpdate) {
      onCountUpdate(metrics.totalCount);
    }
  }, [metrics?.totalCount, onCountUpdate]);

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
      subtitle: "All recorded gateway attempts",
    },
    {
      id: "settled-volume",
      title: "Settled Volume",
      value: `₹${(metrics.totalVolume || 0).toLocaleString("en-IN")}`,
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
    <div className="space-y-3.5 sm:space-y-6 w-full font-primary animate-in fade-in duration-200">
      {/* ── KPI Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
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
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        refreshing={loading}
        actionLabel="Download CSV"
        actionIcon={Download}
        onActionClick={() => {
          const timestamp = new Date().toISOString().slice(0, 10);
          exportPaymentLedgerCsv(payments, `payments-ledger-${timestamp}.csv`);
        }}
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
