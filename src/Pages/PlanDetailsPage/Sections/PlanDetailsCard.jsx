import React, { useState } from "react";
import {
  checkIsEmi,
  deriveDurationDays,
  getSafeDate,
  extractDateFromId,
  formatPlanDate,
  derivePurchaseReference,
  copyToClipboardSafe,
} from "../utils/planDetails.utils";

/**
 * PlanDetailsCard Component
 *
 * Renders the collapsible Plan & Service Details card with clean typography,
 * monospace reference codes, and high-contrast labels.
 */
export default function PlanDetailsCard({ purchase }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!purchase) return null;

  const isEmi = checkIsEmi(purchase);
  const rawDurationDays = deriveDurationDays(purchase);
  const durationDays = rawDurationDays > 0 ? rawDurationDays : 90;

  const baseDate = getSafeDate(
    purchase.startDate || purchase.createdAt,
    extractDateFromId(purchase.id || purchase.orderId) || new Date()
  );
  const startDateStr = formatPlanDate(baseDate);

  // Compute calculated target end date strictly from start date + durationDays
  const calculatedEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // If purchase.endDate is in database, verify it is strictly after the start date (>24 hours)
  // Prevents legacy bugs where endDate was stored identical to startDate/createdAt
  let endDateObj = null;
  if (purchase.endDate) {
    const candidateEnd = getSafeDate(purchase.endDate, null);
    if (candidateEnd && candidateEnd.getTime() > baseDate.getTime() + 24 * 60 * 60 * 1000) {
      endDateObj = candidateEnd;
    }
  }

  // Fallback to calculatedEndDate
  if (!endDateObj) {
    endDateObj = calculatedEndDate;
  }

  const endDateStr = formatPlanDate(endDateObj);

  const purchaseRef = derivePurchaseReference(purchase, baseDate);
  const serviceName = purchase.serviceName || purchase.category || "NeedMet Plan";
  const planName = purchase.planName || purchase.planTitle || "Starter-3M";
  const planType = isEmi ? "Monthly EMI Plan" : "Full Payment";

  const subscriptionId = purchase.mandate?.subscriptionId || (isEmi ? "Pending Mandate" : null);
  const couponText = purchase.couponCode
    ? `${purchase.couponCode}${purchase.discount ? ` (₹${purchase.discount} off)` : ""}`
    : "No coupon applied";

  const handleCopy = async (text, key) => {
    if (!text) return;
    await copyToClipboardSafe(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const detailsRows = [
    {
      id: "service",
      label: "Service",
      value: serviceName,
      icon: "hub",
      show: Boolean(serviceName),
    },
    {
      id: "plan_name",
      label: "Plan Name",
      value: planName,
      icon: "layers",
      show: Boolean(planName),
    },
    {
      id: "plan_type",
      label: "Billing Model",
      value: planType,
      icon: "account_balance",
      show: Boolean(planType),
    },
    {
      id: "duration",
      label: "Duration",
      value: `${durationDays} Days`,
      icon: "calendar_month",
      show: durationDays > 0,
    },
    {
      id: "start_date",
      label: "Start Date",
      value: startDateStr,
      icon: "event",
      show: Boolean(startDateStr),
    },
    {
      id: "end_date",
      label: "End Date",
      value: endDateStr,
      icon: "event_available",
      show: Boolean(endDateStr),
    },
    {
      id: "purchase_ref",
      label: "Purchase Reference",
      value: purchaseRef,
      icon: "badge",
      isMono: true,
      isCopyable: true,
      copyKey: "ref",
      show: Boolean(purchaseRef),
    },
    {
      id: "subscription_id",
      label: "Subscription ID",
      value: subscriptionId,
      icon: "fingerprint",
      isMono: true,
      isCopyable: Boolean(subscriptionId && subscriptionId !== "Pending Mandate"),
      copyKey: "sub",
      isMuted: subscriptionId === "Pending Mandate",
      show: Boolean(subscriptionId),
    },
    {
      id: "coupon",
      label: "Coupon",
      value: couponText,
      icon: "sell",
      isMuted: couponText === "No coupon applied",
      show: true,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs text-left">
      {/* Header with Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
              Plan & Service Details
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
              Contract specifications & identifiers
            </p>
          </div>
        </div>

        <span
          className={`material-symbols-outlined text-gray-400 group-hover:text-slate-800 transition-transform duration-200 shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Details List */}
      {isExpanded && (
        <div className="mt-4 sm:mt-5 space-y-0 divide-y divide-gray-100 border-t border-gray-100 text-xs sm:text-sm">
          {detailsRows
            .filter((row) => row.show)
            .map((row) => (
              <div
                key={row.id}
                className="flex items-start sm:items-center justify-between py-2.5 gap-3"
              >
                {/* Left Label with Icon */}
                <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
                  <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                    {row.icon}
                  </span>
                  <span>{row.label}</span>
                </div>

                {/* Right Value */}
                <div className="flex items-center gap-1.5 text-right justify-end min-w-0 max-w-[60%] sm:max-w-none">
                  {row.isMono ? (
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded font-semibold tracking-tight ${
                        row.isMuted
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "bg-slate-100 text-slate-800 border border-slate-200/80"
                      }`}
                      title={row.value}
                    >
                      {row.value}
                    </span>
                  ) : (
                    <span
                      className={`font-heading font-semibold truncate ${
                        row.isMuted
                          ? "text-slate-400 font-normal"
                          : "text-slate-900"
                      }`}
                      title={row.value}
                    >
                      {row.value}
                    </span>
                  )}

                  {row.isCopyable && (
                    <button
                      type="button"
                      onClick={() => handleCopy(row.value, row.copyKey)}
                      className="p-1 text-gray-400 hover:text-emerald-700 transition cursor-pointer shrink-0"
                      title="Copy to clipboard"
                      aria-label="Copy to clipboard"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedKey === row.copyKey ? "check" : "content_copy"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

