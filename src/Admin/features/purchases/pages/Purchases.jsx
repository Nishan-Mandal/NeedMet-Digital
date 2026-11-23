import { useState, useEffect } from "react";
import ActionHeader from "../../../components/ActionHeader";
import KpiCard from "../../../components/KpiCard";
import OrdersTableSection from "../Sections/OrdersTableSection";
import OrdersPaginationSection from "../Sections/OrdersPaginationSection";
import OrderDetailModal from "../Sections/OrderDetailModal";
import { usePurchasesQuery } from "../hooks/usePurchasesQuery";
import {
  CheckCircle2,
  AlertCircle,
  X,
  ShoppingBag,
  IndianRupee,
  CheckCircle,
  Clock,
  CalendarDays,
  User,
  UserCheck,
  Download,
} from "lucide-react";
import { exportSalesReportCsv } from "../../reports/services/reportExport.service";

export default function Purchases() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Inspect Modal State
  const [detailOrder, setDetailOrder] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Sort options — Salesman prioritized
  const sortOptions = [
    { value: "saleBy", label: "Salesman", icon: UserCheck },
    { value: "createdAt", label: "Purchase Date", icon: CalendarDays },
    { value: "amount", label: "Amount", icon: IndianRupee },
    { value: "customerName", label: "Customer", icon: User },
  ];

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
  } = usePurchasesQuery({
    page,
    pageSize: 15,
    status: statusFilter,
    search: debouncedSearch,
  });

  const orders = queryResult?.purchases || queryResult?.orders || [];

  // Client-side sorting for responsive instant feedback
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === "saleBy") {
      const sA = (a.SaleBy || a.saleBy || a.itemSnapshot?.SaleBy || "").toLowerCase();
      const sB = (b.SaleBy || b.saleBy || b.itemSnapshot?.SaleBy || "").toLowerCase();
      return sortDir === "asc" ? sA.localeCompare(sB) : sB.localeCompare(sA);
    }
    if (sortField === "amount") {
      const pA = Number(a.pricing?.finalPrice || 0);
      const pB = Number(b.pricing?.finalPrice || 0);
      return sortDir === "asc" ? pA - pB : pB - pA;
    }
    if (sortField === "customerName") {
      const nA = (a.user?.userName || a.userName || "").toLowerCase();
      const nB = (b.user?.userName || b.userName || "").toLowerCase();
      return sortDir === "asc" ? nA.localeCompare(nB) : nB.localeCompare(nA);
    }
    if (sortField === "createdAt") {
      const dA = new Date(a.createdAt || 0).getTime();
      const dB = new Date(b.createdAt || 0).getTime();
      return sortDir === "asc" ? dA - dB : dB - dA;
    }
    return 0;
  });

  const metrics = queryResult?.metrics || {
    totalCount: 0,
    totalRevenue: 0,
    activeCount: 0,
    completedCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  };
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const totalCount = queryResult?.pagination?.total || 0;

  // User-friendly life-cycle status filter labels
  const filterTabs = [
    { value: "all", label: "All Purchases" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PENDING_MANDATE", label: "Mandate Pending" },
    { value: "PENDING_PAYMENT", label: "Payment Pending" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  // Derived KPI Cards strictly from purchases model quantities
  const kpiCards = [
    {
      id: "total-purchases",
      title: "Total Purchases",
      value: metrics.totalCount,
      icon: ShoppingBag,
      variant: "slate",
      subtitle: "All recorded purchases",
    },
    {
      id: "total-volume",
      title: "Total Volume",
      value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      variant: "primary",
      subtitle: "Gross purchase value",
    },
    {
      id: "active-plans",
      title: "Active Purchases",
      value: metrics.activeCount,
      icon: CheckCircle,
      variant: "blue",
      subtitle: "Active service subscriptions",
    },
    {
      id: "pending-purchases",
      title: "Pending Purchases",
      value: metrics.pendingCount,
      icon: Clock,
      variant: "amber",
      subtitle: "Mandate or payment pending",
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-6 w-full font-primary">
      {/* ── KPI Summary Stats (Derived Quantities) ── */}
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
        sortOptions={sortOptions}
        activeSort={sortField}
        sortDir={sortDir}
        onSortChange={(field, dir) => {
          setSortField(field);
          setSortDir(dir);
          setPage(1);
        }}
        searchPlaceholder="Search Purchase ID, user ID, customer, service, plan, coupon, payment ID..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refetch}
        refreshing={loading}
        actionLabel="Download CSV"
        actionIcon={Download}
        onActionClick={() => {
          const timestamp = new Date().toISOString().slice(0, 10);
          exportSalesReportCsv(sortedOrders, `purchases-ledger-${timestamp}.csv`);
        }}
      />

      {/* Alerts */}
      {(errorMsg || queryError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg || queryError?.message || "Failed to retrieve purchases ledger from Firestore."}</span>
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

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#e8f5ee] border border-[#d1fae5] text-[#0f5c3e] text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-[#0f5c3e] hover:opacity-75 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Purchases Table Section */}
      <OrdersTableSection
        loading={loading}
        orders={sortedOrders}
        searchQuery={debouncedSearch}
        onInspect={(order) => setDetailOrder(order)}
      />

      {/* Pagination Footer Section */}
      <OrdersPaginationSection
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => setPage(p)}
      />

      {/* Purchase Detail Modal Section (Full details on inspect) */}
      <OrderDetailModal
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />
    </div>
  );
}

