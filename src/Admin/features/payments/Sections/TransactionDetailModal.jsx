import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  X,
  ShoppingBag,
  User,
  ExternalLink,
  AlertCircle,
  RotateCcw,
  Clock,
  Hourglass,
  CheckCircle2,
  Copy,
  Check,
  Phone,
} from "lucide-react";

export default function TransactionDetailModal({ payment, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!payment) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Friendly human-readable status configuration
  const statusConfig = {
    SUCCESS: {
      label: "Success",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    PENDING_MANDATE: {
      label: "Mandate Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Hourglass,
    },
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Hourglass,
    },
    FAILED: {
      label: "Failed",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertCircle,
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-purple-50 text-purple-700 border-purple-200",
      icon: RotateCcw,
    },
  };

  const statusMeta =
    statusConfig[payment.status] || {
      label: payment.status || "Unknown",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: AlertCircle,
    };
  const StatusIcon = statusMeta.icon;

  const paymentTypeLabels = {
    FULL: "Full Payment",
    EMI_UPFRONT: "EMI Upfront",
    EMI_RECURRING: "EMI Recurring",
  };

  const formatTimestamp = (val) => {
    if (!val) return "N/A";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4 font-primary">
        {/* Top Header Row */}
        <div className="flex items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#0f5c3e] border border-emerald-200/80 shrink-0 shadow-2xs">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-tight">
                Payment Audit Record
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="font-semibold text-slate-500">Payment ID:</span>
                <span className="font-mono font-bold text-xs text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-0.5 rounded-lg border border-[#d1fae5] inline-flex items-center gap-1.5 shadow-2xs break-all">
                  {payment.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(payment.id, "paymentId")}
                  className="p-1 text-slate-500 hover:text-[#0f5c3e] hover:bg-[#e8f5ee] rounded-md transition cursor-pointer"
                  title="Copy Payment ID"
                >
                  {copiedKey === "paymentId" ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${statusMeta.className}`}
            >
              <StatusIcon size={13} className="shrink-0" />
              <span>{statusMeta.label}</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1. Gateway & Financial Overview */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#f7faf8] to-slate-50/80 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-medium">Settlement:</span>
            <span className="text-xl font-extrabold font-heading text-[#0f5c3e]">
              ₹{(payment.amount || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              {payment.currency || "INR"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Type:</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {paymentTypeLabels[payment.paymentType] || payment.paymentType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={12} className="text-slate-400" />
              <span>{formatTimestamp(payment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 2. Customer & Linked Order Context */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0f5c3e] flex items-center gap-1.5">
            <User size={13} />
            <span>1. Customer & Purchase Context</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">Customer</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {payment.user?.userName || payment.userName || "Customer"}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">User ID</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs break-all">
                  {payment.user?.userId || payment.userId || "N/A"}
                </span>
                {(payment.user?.userId || payment.userId) && (
                  <button
                    type="button"
                    onClick={() => handleCopy(payment.user?.userId || payment.userId, "userId")}
                    className="p-1 text-slate-500 hover:text-[#0f5c3e] hover:bg-emerald-50 rounded transition cursor-pointer"
                    title="Copy User ID"
                  >
                    {copiedKey === "userId" ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">Customer Phone</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {(payment.user?.phone || payment.phone || payment.userPhone || payment.customerPhone) ? (
                  <>
                    <a
                      href={`tel:${payment.user?.phone || payment.phone || payment.userPhone || payment.customerPhone}`}
                      className="font-semibold text-slate-800 hover:text-[#0f5c3e] hover:underline text-xs inline-flex items-center gap-1"
                      title="Click to call customer"
                    >
                      <Phone size={11} className="text-[#0f5c3e] shrink-0" />
                      <span>{payment.user?.phone || payment.phone || payment.userPhone || payment.customerPhone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(payment.user?.phone || payment.phone || payment.userPhone || payment.customerPhone, "phone")}
                      className="p-1 text-slate-500 hover:text-[#0f5c3e] hover:bg-emerald-50 rounded transition cursor-pointer"
                      title="Copy Phone Number"
                    >
                      {copiedKey === "phone" ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-slate-400 text-xs italic">N/A</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">Sold By (Salesman)</span>
              <span className="font-bold text-[#0f5c3e] text-sm mt-0.5 block">
                {payment.SaleBy || payment.saleBy || payment.itemSnapshot?.SaleBy || "Direct / Online"}
              </span>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">Linked Purchase ID</span>
              <div className="mt-0.5">
                {payment.orderId ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/admin/transactions?tab=purchases&search=${encodeURIComponent(payment.orderId)}`}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#0f5c3e] hover:text-[#1a8a5a] hover:underline font-semibold bg-white px-2 py-0.5 rounded border border-emerald-200 transition break-all"
                      title="View linked purchase in purchases ledger"
                    >
                      <ShoppingBag size={11} className="shrink-0" />
                      <span className="break-all">{payment.orderId}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopy(payment.orderId, "orderId")}
                      className="p-1 text-slate-500 hover:text-[#0f5c3e] hover:bg-[#e8f5ee] rounded transition cursor-pointer"
                      title="Copy Purchase ID"
                    >
                      {copiedKey === "orderId" ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-xs font-medium">Subscription ID</span>
              <span className="font-mono text-slate-700 break-all text-xs block mt-0.5">
                {payment.subscriptionId || "None (One-time)"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Failure Context (If status === "FAILED" or error present) */}
        {(payment.status === "FAILED" || payment.error) && (
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
              <AlertCircle size={13} />
              <span>3. Failure Context</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-rose-900 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-rose-500 font-medium">Code:</span>
                <span className="font-mono font-bold">{payment.error?.code || "PAYMENT_FAILED"}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <span className="text-rose-500 font-medium">Reason:</span>
                <span className="text-rose-800">{payment.error?.description || "Payment transaction failed."}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Refund Context (If status === "REFUNDED" or refund present) */}
        {(payment.status === "REFUNDED" || payment.refund) && (
          <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-xs space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
              <RotateCcw size={13} />
              <span>4. Refund Context</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-purple-900 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-purple-500 font-medium">Refund ID:</span>
                <span className="font-mono font-bold break-all">{payment.refund?.refundId || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-purple-500 font-medium">Refund Amount:</span>
                <span className="font-bold">₹{(payment.refund?.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-purple-500 font-medium">Refunded At:</span>
                <span>{formatTimestamp(payment.refund?.refundedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
