import React, { useState } from "react";
import {
  ReceiptText,
  Eye,
  User,
  UserCheck,
  ExternalLink,
  Calendar,
  Tag,
  ShieldCheck,
  ArrowRight,
  Phone,
  Copy,
  Check,
  ShoppingBag,
  BadgeIndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";
import TransactionsTable from "../../transactions/components/TransactionsTable";
import { cleanImageUrl } from "../services/Purchases";

export const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  PENDING_MANDATE: {
    label: "Mandate Pending",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  PENDING_PAYMENT: {
    label: "Payment Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  REFUNDED: {
    label: "Refunded",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
  },
};

export const formatStatus = (rawStatus) => {
  const normalized = String(rawStatus || "").toUpperCase();
  if (STATUS_CONFIG[normalized]) return STATUS_CONFIG[normalized];
  return {
    label: normalized.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };
};

/** Compact "Order Link" pill — reused across all three tables */
export function OrderLink({ orderId, label = "Order Link" }) {
  if (!orderId) return <span className="text-slate-400 text-xs italic">—</span>;
  return (
    <Link
      to={`/admin/transactions?tab=purchases&search=${encodeURIComponent(orderId)}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0f5c3e] bg-[#e8f5ee] border border-[#d1fae5] hover:bg-[#0f5c3e] hover:text-white transition shadow-2xs group whitespace-nowrap"
      title={`View order: ${orderId}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ShoppingBag size={11} className="shrink-0" />
      <span>{label}</span>
      <ExternalLink size={10} className="shrink-0 opacity-70 group-hover:opacity-100" />
    </Link>
  );
}

/** Customer avatar + name + phone cell — reused across all three tables */
export function CustomerCell({ name, phone, userId }) {
  const [copied, setCopied] = useState(false);
  const displayName = name || "Customer";

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d1fae5]/70">
        {displayName.charAt(0).toUpperCase() || <User size={13} />}
      </div>
      <div className="min-w-0">
        <div
          className="font-semibold text-slate-900 text-sm truncate max-w-[160px] leading-snug"
          title={displayName}
        >
          {displayName}
        </div>
        {phone ? (
          <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0f5c3e] hover:underline"
              title="Call customer"
            >
              <Phone size={10} className="text-[#0f5c3e] shrink-0" />
              <span>{phone}</span>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title={copied ? "Copied!" : "Copy phone"}
            >
              {copied ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
            {userId || "No phone"}
          </div>
        )}
      </div>
    </div>
  );
}

/** Salesman / Sold By avatar + name badge cell — prioritized across views */
export function SalesmanCell({ name }) {
  const isAssigned = Boolean(
    name &&
    name !== "—" &&
    name.toLowerCase() !== "direct / online" &&
    name.toLowerCase() !== "n/a"
  );
  const displayName = isAssigned ? name : (name === "—" ? "—" : (name || "Unassigned"));

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-7 h-7 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d1fae5]/80 shadow-2xs">
        {isAssigned ? displayName.charAt(0).toUpperCase() : <UserCheck size={12} />}
      </div>
      <div className="min-w-0">
        <div
          className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[140px] leading-snug"
          title={displayName}
        >
          {displayName}
        </div>
        <div className="text-[10px] text-[#0f5c3e] font-bold uppercase tracking-wider leading-none mt-0.5">
          Salesman
        </div>
      </div>
    </div>
  );
}

/** Amount + method badge cell */
export function AmountMethodCell({ amount, method, currency = "INR" }) {
  const methodStyles = {
    FULL: "bg-emerald-50 text-emerald-800 border-emerald-200",
    EMI: "bg-blue-50 text-blue-800 border-blue-200",
    UPI: "bg-purple-50 text-purple-700 border-purple-200",
    CARD: "bg-blue-50 text-blue-700 border-blue-200",
    NETBANKING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const methodKey = (method || "").toUpperCase();

  return (
    <div className="flex flex-col gap-1">
      <div className="font-extrabold text-sm text-[#0f5c3e] font-heading">
        ₹{Number(amount || 0).toLocaleString("en-IN")}
      </div>
      {method && (
        <span
          className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border shadow-2xs w-fit ${
            methodStyles[methodKey] || "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {method}
        </span>
      )}
    </div>
  );
}

export default function OrdersTableSection({
  loading = false,
  orders = [],
  searchQuery = "",
  onInspect = () => {},
}) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (orderId) =>
    setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const expandAll = () => {
    const all = {};
    orders.forEach((o) => { all[o.id] = true; });
    setExpandedRows(all);
  };

  const collapseAll = () => setExpandedRows({});

  // ── Column definitions ────────────────────────────────────────────
  // Purchases Table: Customer | Sold By (Salesman) | Date | Service | Status | Amount & Type | Actions
  const columns = [
    { key: "customer",    header: "Customer",         align: "left" },
    { key: "soldBy",      header: "Sold By",          align: "left" },
    { key: "createdAt",   header: "Date",              align: "left" },
    { key: "service",     header: "Service",           align: "left" },
    { key: "status",      header: "Status",            align: "left" },
    { key: "amountType",  header: "Amount & Type",     align: "left" },
    { key: "action",      header: "Actions",           align: "right" },
  ];

  // Toolbar
  const toolbar = (
    <div className="flex items-center justify-between px-1 text-xs text-slate-500 py-1">
      <span className="font-semibold text-slate-700">
        Showing {orders.length} {orders.length === 1 ? "purchase" : "purchases"}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="text-xs font-semibold text-[#0f5c3e] hover:underline cursor-pointer"
        >
          Expand All
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          onClick={collapseAll}
          className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
        >
          Collapse All
        </button>
      </div>
    </div>
  );

  // Desktop row renderer
  const renderRow = (order) => {
    const isExpanded = !!expandedRows[order.id];
    const statusInfo = formatStatus(order.status);
    const isEmi = order.paymentMethod === "EMI";
    const name = order.user?.userName || order.userName || "Customer";
    const phone = order.user?.phone || order.phone || order.userPhone || "";
    const userId = order.user?.userId || order.userId || "";
    const soldBy = order.SaleBy || order.saleBy || order.itemSnapshot?.SaleBy || "—";

    return (
      <React.Fragment key={order.id}>
        <tr className="hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer" onClick={() => toggleRow(order.id)}>

          {/* 1. Customer Name + Phone */}
          <td className="px-4 py-4 align-middle">
            <CustomerCell name={name} phone={phone} userId={userId} />
          </td>

          {/* 2. Sold By / Salesman — Prioritized */}
          <td className="px-4 py-4 align-middle whitespace-nowrap">
            <SalesmanCell name={soldBy} />
          </td>

          {/* 3. Date */}
          <td className="px-4 py-4 align-middle whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </td>

          {/* 4. Service & Plan */}
          <td className="px-4 py-4 align-middle">
            <div className="flex items-center gap-2 max-w-[200px]">
              {cleanImageUrl(order.itemSnapshot?.imageUrl) ? (
                <img
                  src={cleanImageUrl(order.itemSnapshot.imageUrl)}
                  alt=""
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200/80 shrink-0 shadow-2xs"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-7 h-7 rounded-lg bg-[#e8f5ee] border border-[#d1fae5] flex items-center justify-center shrink-0 ${
                  cleanImageUrl(order.itemSnapshot?.imageUrl) ? "hidden" : ""
                }`}
              >
                <Tag size={12} className="text-[#0f5c3e]" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-xs truncate leading-snug" title={order.itemSnapshot?.serviceTitle}>
                  {order.itemSnapshot?.serviceTitle || "NeedMet Service"}
                </div>
                <div className="text-[10px] text-[#0f5c3e] font-semibold truncate">
                  {order.itemSnapshot?.planTitle || "Plan"}
                </div>
              </div>
            </div>
          </td>

          {/* 5. Status */}
          <td className="px-4 py-4 align-middle whitespace-nowrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${statusInfo.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </td>

          {/* 6. Amount & Type */}
          <td className="px-4 py-4 align-middle whitespace-nowrap">
            <AmountMethodCell
              amount={order.pricing?.finalPrice}
              method={order.paymentMethod}
            />
          </td>

          {/* 7. Actions */}
          <td className="px-4 py-4 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onInspect(order)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0f5c3e] bg-[#e8f5ee] hover:bg-[#0f5c3e] hover:text-white border border-[#d1fae5] transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
              title="View Details"
            >
              <Eye size={12} />
              <span>Details</span>
            </button>
          </td>
        </tr>

        {/* Expanded sub-row */}
        {isExpanded && (
          <tr className="bg-[#fcfdfc] border-b border-slate-200/70">
            <td colSpan={7} className="p-4 pl-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-primary">
                {/* Access Window */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Access Window</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck size={14} className="text-[#0f5c3e]" />
                    <span>
                      {order.accessWindow?.activatedAt
                        ? new Date(order.accessWindow.activatedAt).toLocaleDateString("en-IN")
                        : "Not Activated"}
                    </span>
                    <ArrowRight size={11} className="text-slate-400" />
                    <span>
                      {order.accessWindow?.expiresAt
                        ? new Date(order.accessWindow.expiresAt).toLocaleDateString("en-IN")
                        : "Ongoing"}
                    </span>
                  </div>
                  {order.derived?.remainingDays != null && (
                    <span className="text-[11px] font-medium text-emerald-700">
                      {order.derived.remainingDays} days remaining
                    </span>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial Summary</span>
                  <div className="flex justify-between text-slate-600">
                    <span>Base Price:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{(order.pricing?.originalPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {Boolean(order.pricing?.discountAmount) && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({order.pricing?.couponCode || "Promo"}):</span>
                      <span className="font-semibold">-₹{order.pricing.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
                    <span>Final:</span>
                    <span className="text-[#0f5c3e]">₹{(order.pricing?.finalPrice || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Settlement */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Settlement Status</span>
                  <div className="text-slate-600">
                    <span>Upfront Paid: </span>
                    <span className="font-bold text-slate-900">
                      ₹{(order.upfrontPayment?.amount ?? order.pricing?.upfrontAmount ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {isEmi && (
                    <div className="text-slate-600">
                      <span>Mandate: </span>
                      <span className="font-bold text-slate-900 capitalize">{order.mandate?.status || "Authorized"}</span>
                      <span className="block text-[11px] text-slate-400">
                        {order.mandate?.paidCycles || 0} of {order.mandate?.totalCycles || 0} cycles settled
                      </span>
                    </div>
                  )}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onInspect(order)}
                      className="text-[#0f5c3e] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Order Ledger</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Compact, High-Density Mobile Card
  const renderMobileCard = (order) => {
    const statusInfo = formatStatus(order.status);
    const name = order.user?.userName || order.userName || "Customer";
    const phone = order.user?.phone || order.phone || order.userPhone || "";
    const soldBy = order.SaleBy || order.saleBy || order.itemSnapshot?.SaleBy || "";
    const isEmi = order.paymentMethod === "EMI";
    const finalPrice = Number(order.pricing?.finalPrice || 0);

    return (
      <div
        key={order.id}
        onClick={() => onInspect(order)}
        className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-2 cursor-pointer active:bg-slate-50/80"
      >
        {/* Row 1: Primary Header - Customer & Status on left, Amount & Method on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d1fae5]/70">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[125px] leading-tight" title={name}>
                  {name}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${statusInfo.badge}`}>
                  <span className={`w-1 h-1 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>
              {phone && (
                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-[#0f5c3e]"
                  >
                    <Phone size={9} className="text-[#0f5c3e] shrink-0" />
                    <span>{phone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(phone);
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                    title="Copy phone"
                  >
                    <Copy size={9} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Amount & Method: High prominence */}
          <div className="text-right shrink-0">
            <div className="text-base font-extrabold font-heading text-[#0f5c3e] leading-tight">
              ₹{finalPrice.toLocaleString("en-IN")}
            </div>
            <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border mt-0.5 ${
              isEmi
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}>
              {order.paymentMethod || "FULL"}
            </span>
          </div>
        </div>

        {/* Row 2: Prioritized Salesman Bar + Service snippet */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100/90 text-xs">
          {/* Salesman info with avatar and bold name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-[#0f5c3e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
              {soldBy && soldBy !== "—" ? soldBy.charAt(0).toUpperCase() : <UserCheck size={10} />}
            </div>
            <div className="min-w-0 flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800/80 tracking-wider shrink-0">
                Sold By:
              </span>
              <span className="font-extrabold text-slate-900 text-xs truncate" title={soldBy}>
                {soldBy || "Unassigned"}
              </span>
            </div>
          </div>

          {/* Service & Plan */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 shrink-0 max-w-[140px] truncate">
            {cleanImageUrl(order.itemSnapshot?.imageUrl) ? (
              <img
                src={cleanImageUrl(order.itemSnapshot.imageUrl)}
                alt=""
                className="w-4 h-4 rounded object-cover border border-slate-200 shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = "block";
                  }
                }}
              />
            ) : null}
            <Tag
              size={10}
              className={`text-[#0f5c3e] shrink-0 ${
                cleanImageUrl(order.itemSnapshot?.imageUrl) ? "hidden" : ""
              }`}
            />
            <span className="font-semibold text-slate-800 text-[11px] truncate" title={order.itemSnapshot?.serviceTitle}>
              {order.itemSnapshot?.serviceTitle || "Service"}
            </span>
          </div>
        </div>

        {/* Row 3: Date on left, Details action on right */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 font-medium">
            <Calendar size={11} className="text-slate-400 shrink-0" />
            <span>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(order);
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
      data={orders}
      loading={loading}
      loadingMessage="Loading purchases from database..."
      emptyTitle="No Purchases Recorded"
      emptyDescription={
        searchQuery
          ? `No purchases match "${searchQuery}". Try refining your search.`
          : "No purchase orders found in the ledger."
      }
      emptyIcon={ReceiptText}
      toolbar={toolbar}
      renderRow={renderRow}
      renderMobileCard={renderMobileCard}
    />
  );
}
