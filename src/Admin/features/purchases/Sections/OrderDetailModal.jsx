import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ReceiptText,
  X,
  CreditCard,
  User,
  ExternalLink,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Tag,
  Clock,
  Check,
  Package,
  Copy,
  Phone,
} from "lucide-react";
import { formatStatus } from "./OrdersTableSection";
import { cleanImageUrl } from "../services/Purchases";

const MANDATE_STATUS_CONFIG = {
  AUTHORIZED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function OrderDetailModal({ order, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!order) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statusInfo = formatStatus(order.status);
  const isEmi = order.paymentMethod === "EMI";

  const mandateBadgeClass =
    (order.mandate?.status && MANDATE_STATUS_CONFIG[order.mandate.status]) ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-primary"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* ── Modal Header ── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100/90 flex items-start sm:items-center justify-between gap-3 bg-slate-50/50 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f5c3e] border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                <ReceiptText size={16} />
              </span>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-none">
                Purchase Details
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                <span>{statusInfo.label}</span>
              </span>
            </div>

            {/* Purchase ID with Copy Button */}
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 flex-wrap">
              <span className="font-semibold text-slate-500">Purchase ID:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-xs text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-1 rounded-lg border border-[#d1fae5] inline-flex items-center gap-1.5 shadow-2xs break-all">
                  {order.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.id, "orderId")}
                  className="p-1 text-slate-500 hover:text-[#0f5c3e] hover:bg-[#e8f5ee] rounded-md transition cursor-pointer"
                  title="Copy Purchase ID"
                >
                  {copiedKey === "orderId" ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0f5c3e]/20 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-xs text-slate-600">
          {/* ── 1. Service & Plan Information ── */}
          <div className="bg-slate-50/60 border border-slate-200/70 rounded-xl p-4 flex items-start gap-3.5">
            {cleanImageUrl(order.itemSnapshot?.imageUrl) ? (
              <img
                src={cleanImageUrl(order.itemSnapshot.imageUrl)}
                alt={order.itemSnapshot.planTitle || "Service"}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200/80 shrink-0 shadow-2xs bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center shrink-0 shadow-2xs text-slate-400 ${
                cleanImageUrl(order.itemSnapshot?.imageUrl) ? "hidden" : ""
              }`}
            >
              <Package size={22} className="text-[#0f5c3e]/70" />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {order.itemSnapshot?.serviceTitle || "NeedMet Service"}
                </span>
                {order.itemSnapshot?.planTitle && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold">
                    {order.itemSnapshot.planTitle}
                  </span>
                )}
                {order.itemSnapshot?.category && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {order.itemSnapshot.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-xs flex-wrap">
                {order.itemSnapshot?.durationDays && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Duration: <strong className="text-slate-700">{order.itemSnapshot.durationDays} days</strong></span>
                  </span>
                )}
                {order.itemSnapshot?.serviceId && (
                  <span className="font-mono text-slate-500">
                    Service ID: {order.itemSnapshot.serviceId}
                  </span>
                )}
                {order.itemSnapshot?.planId && (
                  <span className="font-mono text-slate-500">
                    Plan ID: {order.itemSnapshot.planId}
                  </span>
                )}
              </div>

              {Array.isArray(order.itemSnapshot?.features) &&
                order.itemSnapshot.features.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Included Plan Features
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600">
                      {order.itemSnapshot.features.map((feat, idx) => {
                        const featureText =
                          typeof feat === "object" && feat !== null
                            ? feat.title
                              ? feat.desc
                                ? `${feat.title}: ${feat.desc}`
                                : feat.title
                              : feat.desc || ""
                            : String(feat);
                        return (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check size={12} className="text-[#0f5c3e] shrink-0" />
                            <span className="truncate">{featureText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* ── 2. Customer & Ownership (User ID, Customer Name, Phone, SaleBy) ── */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} className="text-[#0f5c3e]" />
              <span>Customer & Ownership</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs font-medium">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {order.user?.userName || order.userName || "Customer"}
                </span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs font-medium">User ID (UID)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs break-all">
                    {order.user?.userId || order.userId || "N/A"}
                  </span>
                  {(order.user?.userId || order.userId) && (
                    <button
                      type="button"
                      onClick={() => handleCopy(order.user?.userId || order.userId, "userId")}
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
                  {(order.user?.phone || order.phone || order.userPhone) ? (
                    <>
                      <a
                        href={`tel:${order.user?.phone || order.phone || order.userPhone}`}
                        className="font-semibold text-slate-800 hover:text-[#0f5c3e] hover:underline text-xs inline-flex items-center gap-1"
                        title="Click to call customer"
                      >
                        <Phone size={11} className="text-[#0f5c3e] shrink-0" />
                        <span>{order.user?.phone || order.phone || order.userPhone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.user?.phone || order.phone || order.userPhone, "phone")}
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
                  {order.SaleBy || order.saleBy || order.itemSnapshot?.SaleBy || "Direct / Online"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 3. Financial Breakdown ── */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={13} className="text-[#0f5c3e]" />
              <span>Financial Breakdown</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Original Price
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  ₹{Number(order.pricing?.originalPrice || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                  Discount
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-700">
                  -₹{Number(order.pricing?.discountAmount || 0).toLocaleString()}
                </span>
                {order.derived?.discountPercent > 0 && (
                  <span className="text-xs text-emerald-600 block mt-0.5">
                    ({order.derived.discountPercent}% off)
                  </span>
                )}
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Final Price
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#0f5c3e]">
                  ₹{Number(order.pricing?.finalPrice || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Upfront Paid
                </span>
                <span className="text-sm sm:text-base font-bold text-[#0f5c3e]">
                  ₹{Number(order.pricing?.upfrontAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {order.pricing?.remainingAmount > 0 && (
              <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-600">
                <span>Remaining Balance (via Mandate EMI):</span>
                <strong className="text-slate-900 text-sm">
                  ₹{Number(order.pricing.remainingAmount).toLocaleString()}
                </strong>
              </div>
            )}

            {order.pricing?.couponCode && (
              <div className="flex items-center gap-1.5 pt-1 px-1 text-xs text-amber-800">
                <Tag size={12} className="text-amber-600" />
                <span>Applied Coupon:</span>
                <span className="font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {order.pricing.couponCode}
                </span>
              </div>
            )}
          </div>

          {/* ── 4. Access Window & Validity ── */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-[#0f5c3e]" />
              <span>Access Window & Validity</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Activated On</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {order.accessWindow?.activatedAt
                    ? new Date(order.accessWindow.activatedAt).toLocaleDateString()
                    : "Pending activation"}
                </span>
              </div>
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Expires On</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {order.accessWindow?.expiresAt
                    ? new Date(order.accessWindow.expiresAt).toLocaleDateString()
                    : "No expiration set"}
                </span>
              </div>
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Access Status</span>
                <div className="mt-0.5">
                  {order.derived?.isExpired ? (
                    <span className="text-rose-600 font-bold">Expired</span>
                  ) : order.derived?.remainingDays !== null ? (
                    <span className="text-emerald-700 font-bold">
                      {order.derived.remainingDays} days remaining
                    </span>
                  ) : (
                    <span className="text-slate-600">Active</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. Upfront Settlement Link ── */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={13} className="text-[#0f5c3e]" />
              <span>Upfront Payment Settlement</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Payment ID</span>
                {order.upfrontPayment?.paymentId ? (
                  <Link
                    to={`/admin/transactions?tab=payments&search=${encodeURIComponent(
                      order.upfrontPayment.paymentId
                    )}`}
                    className="font-mono text-xs text-[#0f5c3e] hover:text-[#0b462f] hover:underline font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1 break-all mt-0.5"
                  >
                    <span>{order.upfrontPayment.paymentId}</span>
                    <ExternalLink size={11} className="shrink-0" />
                  </Link>
                ) : (
                  <span className="text-slate-400 italic">None recorded</span>
                )}
              </div>
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Amount Settled</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  ₹{Number(order.upfrontPayment?.amount || order.pricing?.upfrontAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs">Paid At</span>
                <span className="text-slate-700 mt-0.5 block">
                  {order.upfrontPayment?.paidAt
                    ? new Date(order.upfrontPayment.paidAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 6. Mandate & EMI Ledger (If EMI) ── */}
          {isEmi && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#0f5c3e]" />
                  <span>Mandate & EMI Schedule</span>
                </span>
                {order.mandate?.status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border uppercase ${mandateBadgeClass}`}
                  >
                    {order.mandate.status}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs">Subscription ID</span>
                  <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/70 text-xs break-all block mt-0.5">
                    {order.mandate?.subscriptionId || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs">EMI Amount</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    ₹{Number(order.mandate?.emiAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs">Cycles</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {order.mandate?.paidCycles ?? 0} / {order.mandate?.totalCycles ?? 0} Paid
                  </span>
                </div>
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-xs">Next Debit</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {order.mandate?.nextDebitDate
                      ? new Date(order.mandate.nextDebitDate).toLocaleDateString()
                      : "None"}
                  </span>
                </div>
              </div>

              {/* Installments Table */}
              {Array.isArray(order.mandate?.installments) &&
                order.mandate.installments.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Installment Ledger
                  </span>
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f7faf8] text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Cycle</th>
                            <th className="py-2 px-3">Due Date</th>
                            <th className="py-2 px-3">Amount</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Payment ID</th>
                            <th className="py-2 px-3 text-right">Paid At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.mandate.installments.map((inst, idx) => {
                            const isPaid = inst.status === "PAID";
                            return (
                              <tr
                                key={idx}
                                className="hover:bg-slate-50/70 transition-colors"
                              >
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  #{inst.cycleIndex}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                  {inst.dueDate
                                    ? new Date(inst.dueDate).toLocaleDateString()
                                    : "—"}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                  ₹{Number(inst.amount || 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold border inline-flex items-center gap-1 shadow-2xs ${
                                      isPaid
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isPaid ? "bg-emerald-500" : "bg-amber-500"
                                      }`}
                                    />
                                    {inst.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-xs text-slate-600 max-w-[140px]">
                                  {inst.paymentId ? (
                                    <Link
                                      to={`/admin/transactions?tab=payments&search=${encodeURIComponent(
                                        inst.paymentId
                                      )}`}
                                      className="text-[#0f5c3e] hover:text-[#0b462f] bg-slate-50 hover:bg-emerald-50 px-1.5 py-0.5 rounded border border-slate-200/80 hover:border-emerald-300 transition-colors inline-flex items-center gap-1 max-w-[130px]"
                                      title={inst.paymentId}
                                    >
                                      <span className="truncate">{inst.paymentId}</span>
                                      <ExternalLink size={9} className="shrink-0" />
                                    </Link>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-600 text-xs whitespace-nowrap">
                                  {inst.paidAt
                                    ? new Date(inst.paidAt).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Modal Footer: Timestamps ── */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span>
              Created:{" "}
              <strong className="text-slate-700 font-semibold">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
              </strong>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span>
              Updated:{" "}
              <strong className="text-slate-700 font-semibold">
                {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "N/A"}
              </strong>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
