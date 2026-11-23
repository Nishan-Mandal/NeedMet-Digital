import { useState } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  CalendarClock,
  Eye,
  Download,
} from "lucide-react";
import TransactionsTable from "../components/TransactionsTable";
import { CustomerCell, OrderLink } from "../../purchases/Sections/OrdersTableSection";
import { groupInstallmentsByPeriod, exportUpcomingEmiCsv } from "../services/upcomingEmi.service";

export default function UpcomingEmiTableSection({
  loading = false,
  installments = [],
  searchQuery = "",
  currentFilter = "ALL",
  onInspect = () => {},
}) {
  const [groupByPeriod, setGroupByPeriod] = useState(true);

  // ── Urgency badge ────────────────────────────────────────────────
  const renderUrgencyBadge = (item) => {
    switch (item.urgency) {
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={10} />
            Overdue {item.diffDays !== null ? `(${Math.abs(item.diffDays)}d)` : ""}
          </span>
        );
      case "DUE_TODAY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            <Clock size={10} />
            Due Today
          </span>
        );
      case "DUE_SOON":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={10} />
            In {item.diffDays}d
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle size={10} />
            Failed
          </span>
        );
      default:
        return item.diffDays !== null && item.diffDays > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock size={10} />
            In {item.diffDays}d
          </span>
        ) : null;
    }
  };

  // ── Columns ──────────────────────────────────────────────────────
  // Upcoming EMI: Customer Name & Phone | Date | Amount | Service Name | Order Link
  const columns = [
    {
      key: "customer",
      header: "Customer & Phone",
      align: "left",
      render: (item) => {
        const phone =
          item.user?.phone ||
          item.customerPhone ||
          item.phone ||
          item.userPhone ||
          item.phoneNumber ||
          item.contact ||
          item.fullPurchase?.user?.phone ||
          item.fullPurchase?.userPhone ||
          item.fullPurchase?.customerPhone ||
          item.fullPurchase?.phone ||
          "";
        return (
          <CustomerCell
            name={item.user?.userName || item.userName}
            phone={phone}
            userId={item.user?.userId || item.userId}
          />
        );
      },
    },
    {
      key: "dueDate",
      header: "EMI Date",
      align: "left",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 whitespace-nowrap">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>
              {item.dueDate
                ? new Date(item.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "Scheduled"}
            </span>
          </div>
          {renderUrgencyBadge(item)}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "left",
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-sm text-[#0f5c3e] font-heading tracking-tight">
            ₹{Number(item.amount || 0).toLocaleString("en-IN")}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 w-fit">
            Cycle #{item.cycleIndex}{item.totalCycles ? ` / ${item.totalCycles}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      align: "left",
      render: (item) => (
        <div className="max-w-[180px]">
          <div className="font-semibold text-slate-800 text-xs truncate leading-snug" title={item.serviceTitle}>
            {item.serviceTitle || "—"}
          </div>
          <div className="text-[10px] text-[#0f5c3e] font-semibold truncate mt-0.5" title={item.planTitle}>
            {item.planTitle || ""}
          </div>
        </div>
      ),
    },
    {
      key: "orderLink",
      header: "Order Link",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <OrderLink orderId={item.purchaseId} />
        </div>
      ),
    },
  ];

  // ── Grouped data ─────────────────────────────────────────────────
  const periodGroups =
    groupByPeriod && (currentFilter === "ALL" || !currentFilter)
      ? groupInstallmentsByPeriod(installments)
      : null;

  // ── Toolbar ──────────────────────────────────────────────────────
  const tableToolbar = (
    <div className="flex items-center justify-between text-xs text-slate-500 py-1 flex-wrap gap-2">
      <div className="flex items-center gap-2 font-semibold text-slate-700">
        <Sparkles size={14} className="text-[#0f5c3e]" />
        <span>
          Showing {installments.length} {installments.length === 1 ? "installment" : "installments"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Download CSV button temporarily commented out
        <button
          type="button"
          onClick={() => exportUpcomingEmiCsv(installments, currentFilter)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#0f5c3e] bg-[#e8f5ee] hover:bg-[#0f5c3e] hover:text-white border border-[#d1fae5] transition cursor-pointer shadow-2xs active:scale-95"
          title="Download upcoming installments as CSV (time period wise)"
        >
          <Download size={12} />
          <span>Download CSV</span>
        </button>
        */}
        {currentFilter === "ALL" && (
          <button
            type="button"
            onClick={() => setGroupByPeriod(!groupByPeriod)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
              groupByPeriod
                ? "bg-[#e8f5ee] text-[#0f5c3e] border-[#d1fae5]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers size={12} />
            {groupByPeriod ? "Grouped by Period" : "Flat View"}
          </button>
        )}
      </div>
    </div>
  );

  // ── Group divider ─────────────────────────────────────────────────
  const renderGroupDivider = (group, colSpan) => (
    <tr key={`divider-${group.id}`} className="bg-slate-50/90 border-y border-slate-200/70 select-none">
      <td colSpan={colSpan} className="py-2.5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              group.id === "OVERDUE"    ? "bg-rose-500" :
              group.id === "TODAY"     ? "bg-amber-500 animate-ping" :
              group.id === "THIS_WEEK" ? "bg-blue-500" :
              group.id === "THIS_MONTH"? "bg-emerald-500" : "bg-purple-500"
            }`} />
            <span className="font-bold text-slate-800 text-xs">{group.label}</span>
            <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-white border border-slate-200">
              {group.items.length} {group.items.length === 1 ? "debit" : "debits"}
            </span>
          </div>
          <span className="font-bold text-xs text-[#0f5c3e] font-heading">
            Total: ₹{group.totalVolume.toLocaleString("en-IN")}
          </span>
        </div>
      </td>
    </tr>
  );

  // Compact, High-Density Mobile Card
  const renderMobileCard = (item) => {
    const customerName = item.user?.userName || item.userName || "Customer";
    const customerPhone =
      item.user?.phone ||
      item.customerPhone ||
      item.phone ||
      item.userPhone ||
      item.phoneNumber ||
      item.contact ||
      item.fullPurchase?.user?.phone ||
      item.fullPurchase?.userPhone ||
      item.fullPurchase?.customerPhone ||
      item.fullPurchase?.phone ||
      "";

    return (
      <div
        key={item.id}
        onClick={() => onInspect(item.fullPurchase)}
        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-2 cursor-pointer active:bg-slate-50/80"
      >
        {/* Row 1: Customer on left, Amount & Cycle on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d1fae5]/70">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block leading-tight" title={customerName}>
                {customerName}
              </span>
              {customerPhone ? (
                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${customerPhone}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-[#0f5c3e]"
                  >
                    <span>{customerPhone}</span>
                  </a>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono truncate block">
                  {item.user?.userId || item.userId || "—"}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-extrabold font-heading text-[#0f5c3e] leading-tight">
              ₹{Number(item.amount || 0).toLocaleString("en-IN")}
            </div>
            <span className="inline-block text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 mt-0.5">
              Cycle #{item.cycleIndex}{item.totalCycles ? ` of ${item.totalCycles}` : ""}
            </span>
          </div>
        </div>

        {/* Row 2: Service & Plan on left, Urgency Badge on right */}
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs">
          <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
            <span className="font-semibold text-slate-800 text-xs truncate max-w-[140px]" title={item.serviceTitle}>
              {item.serviceTitle || "Service"}
            </span>
            <span className="text-[10px] text-[#0f5c3e] font-bold shrink-0 truncate max-w-[80px]" title={item.planTitle}>
              • {item.planTitle || "Plan"}
            </span>
          </div>

          <div className="shrink-0">
            {renderUrgencyBadge(item)}
          </div>
        </div>

        {/* Row 3: Due Date on left, Order Link & Inspect on right */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 font-medium">
            <Calendar size={11} className="text-slate-400 shrink-0" />
            <span>
              {item.dueDate
                ? new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Scheduled"}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <OrderLink orderId={item.purchaseId} />
            <button
              type="button"
              onClick={() => onInspect(item.fullPurchase)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#0f5c3e] hover:bg-[#0b462f] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Eye size={11} />
              <span>Inspect</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TransactionsTable
      columns={columns}
      data={installments}
      loading={loading}
      loadingMessage="Loading upcoming EMI installments..."
      emptyTitle={searchQuery ? "No matching upcoming installments" : "No upcoming EMI installments for this period"}
      emptyDescription={
        searchQuery
          ? `No pending EMI cycles matched "${searchQuery}".`
          : "All AutoPay debits for this period are settled, or no active EMI subscriptions are scheduled."
      }
      emptyIcon={CalendarClock}
      toolbar={tableToolbar}
      groupDividers={periodGroups}
      renderGroupDivider={renderGroupDivider}
      renderMobileCard={renderMobileCard}
      onRowClick={(item) => onInspect(item.fullPurchase)}
    />
  );
}
