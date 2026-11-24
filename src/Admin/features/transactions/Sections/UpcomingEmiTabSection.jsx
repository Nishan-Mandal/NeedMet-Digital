import React, { useState, useEffect } from "react";
import ActionHeader from "../../../components/ActionHeader";
import KpiCard from "../../../components/KpiCard";
import UpcomingEmiTableSection from "./UpcomingEmiTableSection";
import UpcomingEmiPaginationSection from "./UpcomingEmiPaginationSection";
import OrderDetailModal from "../../purchases/Sections/OrderDetailModal";
import { useUpcomingEmiQuery } from "../hooks/useUpcomingEmiQuery";
import {
  Clock,
  IndianRupee,
  Calendar,
  AlertTriangle,
  AlertCircle,
  X,
  CalendarClock,
  CalendarDays,
  Hash,
  DollarSign,
  Download,
} from "lucide-react";
import { exportUpcomingEmiCsv } from "../services/upcomingEmi.service";

export default function UpcomingEmiTabSection({ initialSearch = "", onSearchUpdate }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [errorMsg, setErrorMsg] = useState("");
  const [sortField, setSortField] = useState("dueDate");
  const [sortDir, setSortDir] = useState("asc");

  // Inspect Modal
  const [detailOrder, setDetailOrder] = useState(null);

  // Sort options for EMI list
  const sortOptions = [
    { value: "dueDate", label: "Due Date", icon: CalendarDays },
    { value: "amount", label: "Amount", icon: IndianRupee },
    { value: "installmentNumber", label: "Installment #", icon: Hash },
  ];

  useEffect(() => {
    setSearchQuery(initialSearch || "");
    setDebouncedSearch(initialSearch || "");
    setPage(1);
  }, [initialSearch]);

  // Debounce search input
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

  const {
    installments,
    metrics,
    pagination,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useUpcomingEmiQuery({
    page,
    pageSize: 25,
    filter,
    search: debouncedSearch,
    sortField,
    sortDir,
  });

  // Time-period based filter tabs
  const filterTabs = [
    { value: "ALL", label: "All Periods", count: metrics?.totalCount || 0 },
    { value: "OVERDUE", label: "Overdue", count: metrics?.overdueCount || 0 },
    { value: "TODAY", label: "Today", count: metrics?.todayCount || 0 },
    { value: "THIS_WEEK", label: "Next 7 Days", count: metrics?.thisWeekCount || 0 },
    { value: "THIS_MONTH", label: "Next 30 Days", count: metrics?.thisMonthCount || 0 },
    { value: "NEXT_MONTH", label: "Next Month", count: metrics?.nextMonthCount || 0 },
    { value: "LATER", label: "Later (60d+)", count: metrics?.laterCount || 0 },
  ];

  const kpiCards = [
    {
      id: "total-upcoming-volume",
      title: "Total Upcoming EMI",
      value: `₹${(metrics?.totalVolume || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      variant: "primary",
      subtitle: `${metrics?.totalCount || 0} scheduled debit cycles`,
    },
    {
      id: "due-next-7-days",
      title: "Due in Next 7 Days",
      value: `₹${(metrics?.thisWeekVolume || 0).toLocaleString("en-IN")}`,
      icon: CalendarClock,
      variant: "blue",
      subtitle: `${metrics?.thisWeekCount || 0} debits due this week`,
    },
    {
      id: "due-today",
      title: "Due Today",
      value: `₹${(metrics?.todayVolume || 0).toLocaleString("en-IN")}`,
      icon: Clock,
      variant: (metrics?.todayCount || 0) > 0 ? "amber" : "slate",
      subtitle: `${metrics?.todayCount || 0} debits due today`,
    },
    {
      id: "overdue-installments",
      title: "Overdue Installments",
      value: `₹${(metrics?.overdueVolume || 0).toLocaleString("en-IN")}`,
      icon: AlertTriangle,
      variant: (metrics?.overdueCount || 0) > 0 ? "rose" : "slate",
      subtitle: `${metrics?.overdueCount || 0} overdue debit cycles`,
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-6 w-full font-primary animate-in fade-in duration-200">
      {/* ── KPI Summary Cards by Period ── */}
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

      {/* ── Toolbar: Time-Period Filters, Search & Refresh ── */}
      <ActionHeader
        filters={filterTabs}
        activeFilter={filter}
        onFilterChange={(st) => {
          setFilter(st);
          setPage(1);
        }}
        sortOptions={sortOptions}
        activeSort={sortField}
        sortDir={sortDir}
        onSortChange={(field, dir) => {
          setSortField(field);
          setSortDir(dir);
          setPage(1);
        }}
        searchPlaceholder="Search customer name, phone, order ID, plan title..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={refetch}
        refreshing={loading}
        /* Download CSV button temporarily commented out
        actionLabel="Download CSV"
        actionIcon={Download}
        onActionClick={() => exportUpcomingEmiCsv(installments, filter)}
        */
      />

      {/* Error / Alert */}
      {(errorMsg || queryError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg || queryError?.message || "Failed to load upcoming EMI debits."}</span>
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

      {/* ── Upcoming EMI Table (AMOUNT, EMI Date, Customer & Phone, Purchase Link) ── */}
      <UpcomingEmiTableSection
        loading={loading}
        installments={installments}
        searchQuery={debouncedSearch}
        currentFilter={filter}
        onInspect={(purchase) => setDetailOrder(purchase)}
      />

      {/* ── Pagination ── */}
      <UpcomingEmiPaginationSection
        page={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        totalCount={pagination?.total || 0}
        onPageChange={(p) => setPage(p)}
      />

      {/* ── Order Detail Modal ── */}
      <OrderDetailModal
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />
    </div>
  );
}
