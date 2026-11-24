import { CreditCard, Clock, Eye, AlertCircle, CheckCircle2, RotateCcw, Hourglass } from "lucide-react";
import TransactionsTable from "../../transactions/components/TransactionsTable";
import { CustomerCell, OrderLink, AmountMethodCell } from "../../purchases/Sections/OrdersTableSection";

export default function TransactionsTableSection({
  loading = false,
  payments = [],
  searchQuery = "",
  onInspect = () => {},
}) {
  // ── Status config ────────────────────────────────────────────────
  const statusConfig = {
    SUCCESS:        { label: "Success",         className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    PENDING_MANDATE:{ label: "Mandate Pending", className: "bg-amber-50 text-amber-700 border-amber-200",    icon: Hourglass    },
    PENDING:        { label: "Pending",         className: "bg-amber-50 text-amber-700 border-amber-200",    icon: Hourglass    },
    FAILED:         { label: "Failed",          className: "bg-rose-50 text-rose-700 border-rose-200",       icon: AlertCircle  },
    REFUNDED:       { label: "Refunded",        className: "bg-purple-50 text-purple-700 border-purple-200", icon: RotateCcw    },
  };

  const paymentTypeLabels = {
    FULL:          "Full Payment",
    EMI_UPFRONT:   "EMI Upfront",
    EMI_RECURRING: "EMI Recurring",
  };

  const formatDate = (val) => {
    if (!val) return "N/A";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // ── Columns ──────────────────────────────────────────────────────
  // Payments Table: Customer Name & Phone | Order Link | Date | Payment Amount & Type | Actions
  const columns = [
    {
      key: "customer",
      header: "Customer",
      align: "left",
      render: (p) => (
        <CustomerCell
          name={p.user?.userName || p.userName}
          phone={p.user?.phone || p.phone}
          userId={p.user?.userId || p.userId}
        />
      ),
    },
    {
      key: "orderId",
      header: "Order Link",
      align: "left",
      render: (p) => <OrderLink orderId={p.orderId} />,
    },
    {
      key: "createdAt",
      header: "Date",
      align: "left",
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
          <Clock size={13} className="text-slate-400 shrink-0" />
          <span>{formatDate(p.createdAt)}</span>
        </div>
      ),
    },
    {
      key: "amountType",
      header: "Amount & Type",
      align: "left",
      render: (p) => {
        const typeLabel = paymentTypeLabels[p.paymentType] || p.paymentType || "";
        return (
          <div className="flex flex-col gap-1">
            <div className="font-extrabold text-sm text-[#0f5c3e] font-heading">
              ₹{(p.amount || 0).toLocaleString("en-IN")}
            </div>
            {typeLabel && (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                {typeLabel}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "action",
      header: "Actions",
      align: "right",
      render: (p) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onInspect(p); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0f5c3e] bg-[#e8f5ee] hover:bg-[#0f5c3e] hover:text-white border border-[#d1fae5] transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
          title="View Details"
        >
          <Eye size={12} />
          <span>Details</span>
        </button>
      ),
    },
  ];

  // Compact, High-Density Mobile Card
  const renderMobileCard = (payment) => {
    const statusMeta = statusConfig[payment.status] || {
      label: payment.status || "Unknown",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: AlertCircle,
    };
    const StatusIcon = statusMeta.icon;
    const typeLabel = paymentTypeLabels[payment.paymentType] || payment.paymentType || "";
    const name = payment.user?.userName || payment.userName || "Customer";
    const phone = payment.user?.phone || payment.phone || payment.userPhone || "";

    return (
      <div
        key={payment.id}
        onClick={() => onInspect(payment)}
        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-2 cursor-pointer active:bg-slate-50/80"
      >
        {/* Row 1: Customer on left, Amount & Type on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d1fae5]/70">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block leading-tight" title={name}>
                {name}
              </span>
              {phone ? (
                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-[#0f5c3e]"
                  >
                    <span>{phone}</span>
                  </a>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono truncate block">
                  {payment.user?.userId || payment.userId || "—"}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-extrabold font-heading text-[#0f5c3e] leading-tight">
              ₹{(payment.amount || 0).toLocaleString("en-IN")}
            </div>
            {typeLabel && (
              <span className="inline-block text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 mt-0.5">
                {typeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Payment ID + Linked Order + Status Badge */}
        <div className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[110px]"
              title={payment.id}
            >
              #{payment.id?.slice(-8) || payment.id}
            </span>
            <div onClick={(e) => e.stopPropagation()}>
              <OrderLink orderId={payment.orderId} />
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusMeta.className}`}>
            <StatusIcon size={10} className="shrink-0" />
            <span>{statusMeta.label}</span>
          </span>
        </div>

        {/* Row 3: Date & Details Button */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 font-medium">
            <Clock size={11} className="text-slate-400 shrink-0" />
            <span>{formatDate(payment.createdAt)}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(payment);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0f5c3e] bg-[#e8f5ee] hover:bg-[#0f5c3e] hover:text-white border border-[#d1fae5] transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Eye size={11} />
            <span>Details</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <TransactionsTable
      columns={columns}
      data={payments}
      loading={loading}
      loadingMessage="Loading payments ledger from database..."
      emptyTitle="No Payments Recorded"
      emptyDescription={
        searchQuery
          ? `No records match "${searchQuery}". Try refining your search.`
          : "No payment records found in the ledger."
      }
      emptyIcon={CreditCard}
      renderMobileCard={renderMobileCard}
      onRowClick={(p) => onInspect(p)}
    />
  );
}
