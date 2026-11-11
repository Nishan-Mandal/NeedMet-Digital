import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * InstallmentSchedule Component
 *
 * Renders a vertical installment timeline matching the NeedMet Digital UI:
 * - Upfront payment milestone with status, paid date, amount, and copyable payment ID.
 * - Recurring installments backed by verified backend Firestore records (Completed, Upcoming, Retrying, Payment Failed, Overdue).
 * - Continuous vertical connector line linking all timeline milestones.
 * - Elevated with brand typography (Sora / DM Sans) and tabular numerical clarity.
 */
export default function InstallmentSchedule({ purchase }) {
  const [copiedPid, setCopiedPid] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!purchase) return null;

  const pricing = purchase.pricing || {};
  const finalPrice = Number(pricing.finalPrice ?? purchase.amount ?? 0);
  const rawUpfront =
    pricing.upfrontAmount ??
    purchase.upfrontPayment?.amount ??
    purchase.upfrontAmount;

  // Take upfront amount directly from DB, never rounding up
  const upfrontPaid = Number(rawUpfront ?? 0);

  // Take remaining amount directly from DB pricing.remainingAmount, never rounding up
  const remainingBalance = Number(
    pricing.remainingAmount !== undefined && pricing.remainingAmount !== null
      ? pricing.remainingAmount
      : Math.max(0, finalPrice - upfrontPaid)
  );

  // Extract base creation / enrollment date
  const getBaseDate = () => {
    const raw =
      purchase.accessWindow?.activatedAt ||
      purchase.createdAt ||
      purchase.startDate ||
      purchase.timestamp;
    if (!raw) return new Date();
    if (typeof raw.toDate === "function") return raw.toDate();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const baseDate = getBaseDate();

  const formatScheduleDate = (dateObj) => {
    try {
      if (!dateObj) return "—";
      if (typeof dateObj.toDate === "function") dateObj = dateObj.toDate();
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedPid(text);
    setTimeout(() => setCopiedPid(null), 2000);
  };

  // Upfront details
  const statusUpper = String(purchase.status || "").toUpperCase();
  const upfrontStatus = String(purchase.upfrontPayment?.status || "").toLowerCase();
  const isUpfrontCaptured =
    Boolean(purchase.upfrontPayment?.paymentId) ||
    Boolean(purchase.paymentId) ||
    upfrontStatus === "captured" ||
    upfrontStatus === "success" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    statusUpper === "PENDING_MANDATE";

  const rawUpfrontPid =
    purchase.upfrontPayment?.paymentId ||
    purchase.razorpayPaymentId ||
    purchase.paymentId ||
    "";
  const upfrontPaidDateStr = formatScheduleDate(purchase.upfrontPayment?.paidAt || baseDate);

  // Build timeline items
  const scheduleItems = [
    {
      id: "upfront",
      title: "Upfront Down Payment",
      amount: upfrontPaid,
      rawPaymentId: isUpfrontCaptured ? rawUpfrontPid : null,
      dateLabel: isUpfrontCaptured ? `Paid on ${upfrontPaidDateStr}` : "Down payment pending",
      badgeText: isUpfrontCaptured ? "Completed" : (upfrontStatus === "failed" ? "Failed" : "Pending"),
      badgeVariant: isUpfrontCaptured ? "completed" : (upfrontStatus === "failed" ? "failed" : "upcoming"),
      state: isUpfrontCaptured ? "completed" : (upfrontStatus === "failed" ? "failed" : "upcoming"),
    },
  ];

  // Recurring installments (new model stores in purchase.mandate.installments)
  const storedInstallments =
    Array.isArray(purchase.mandate?.installments) && purchase.mandate.installments.length > 0
      ? purchase.mandate.installments
      : Array.isArray(pricing.installments) && pricing.installments.length > 0
      ? pricing.installments
      : null;

  const rawCycles = Number(purchase.mandate?.totalCycles ?? pricing.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  const paidCycles = Number(purchase.mandate?.paidCycles ?? purchase.paidCycles ?? purchase.mandate?.paidCount ?? 0);
  const cyclesCount = storedInstallments ? storedInstallments.length : (rawCycles > 0 ? rawCycles : 3);
  const emiAmount = Number(
    purchase.mandate?.emiAmount ??
      pricing.emiAmount ??
      (cyclesCount > 0 && remainingBalance > 0
        ? remainingBalance / cyclesCount
        : 0)
  );

  const now = new Date();

  if (storedInstallments) {
    storedInstallments.forEach((inst, idx) => {
      const cycleIndex = inst.cycleIndex || idx + 1;
      const rawDue = inst.dueDate || inst.scheduledDate;
      const instDueDate = rawDue ? (rawDue.toDate ? rawDue.toDate() : new Date(rawDue)) : null;
      const dueDateStr = formatScheduleDate(rawDue);
      const instStatusUpper = String(inst.status || "").toUpperCase();
      const isPaid =
        instStatusUpper === "PAID" ||
        instStatusUpper === "COMPLETED" ||
        (paidCycles > 0 && cycleIndex <= paidCycles);
      const isFailed = instStatusUpper === "FAILED";
      const isRetrying = instStatusUpper === "RETRYING";
      const isProcessing = instStatusUpper === "PROCESSING";
      const isOverdue = !isPaid && !isFailed && !isRetrying && instDueDate && instDueDate < now;

      let badgeText = "Upcoming";
      let badgeVariant = "upcoming";
      let state = "upcoming";
      let dateLabel = `Due on ${dueDateStr}`;
      let rawPaymentId = null;

      if (isPaid) {
        badgeText = "Completed";
        badgeVariant = "completed";
        state = "completed";
        rawPaymentId = inst.paymentId || null;
        const paidDateStr = formatScheduleDate(inst.paidAt || rawDue);
        dateLabel = `Paid on ${paidDateStr}`;
      } else if (isFailed) {
        badgeText = "Payment Failed";
        badgeVariant = "failed";
        state = "failed";
        dateLabel = inst.failureReason ? `Failed: ${inst.failureReason}` : `Payment failed on ${dueDateStr}`;
      } else if (isRetrying) {
        badgeText = "Retrying";
        badgeVariant = "retrying";
        state = "retrying";
        dateLabel = `Auto-debit retry pending • Due on ${dueDateStr}`;
      } else if (isProcessing) {
        badgeText = "Processing";
        badgeVariant = "processing";
        state = "processing";
        dateLabel = `Debit in progress • Due on ${dueDateStr}`;
      } else if (isOverdue) {
        badgeText = "Overdue";
        badgeVariant = "overdue";
        state = "overdue";
        dateLabel = `Overdue since ${dueDateStr}`;
      }

      scheduleItems.push({
        id: `installment-${cycleIndex}`,
        title: `Installment ${cycleIndex}`,
        amount: Number(inst.amount || emiAmount),
        rawPaymentId,
        dateLabel,
        badgeText,
        badgeVariant,
        state,
      });
    });
  } else {
    // Fallback: Synthesize from mandate paidCycles if stored installments absent
    const fallbackBillingDay = Number(pricing.billingDay || 9);
    for (let i = 1; i <= cyclesCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      const maxDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      dueDate.setDate(Math.min(fallbackBillingDay, maxDay));
      const dueDateStr = formatScheduleDate(dueDate);
      const isCompleted = Boolean(paidCycles > 0 && i <= paidCycles);
      const isOverdue = !isCompleted && dueDate < now;

      let badgeText = "Upcoming";
      let badgeVariant = "upcoming";
      let state = "upcoming";
      let dateLabel = `Due on ${dueDateStr}`;

      if (isCompleted) {
        badgeText = "Completed";
        badgeVariant = "completed";
        state = "completed";
        dateLabel = `Paid on ${dueDateStr}`;
      } else if (isOverdue) {
        badgeText = "Overdue";
        badgeVariant = "overdue";
        state = "overdue";
        dateLabel = `Overdue since ${dueDateStr}`;
      }

      scheduleItems.push({
        id: `installment-${i}`,
        title: `Installment ${i}`,
        amount: emiAmount,
        rawPaymentId: null,
        dateLabel,
        badgeText,
        badgeVariant,
        state,
      });
    }
  }

  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderNodeIcon = (state) => {
    switch (state) {
      case "completed":
        return (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5C3E] text-white shadow-xs">
            <span className="material-symbols-outlined text-base sm:text-lg font-bold">
              check
            </span>
          </div>
        );
      case "failed":
        return (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs">
            <span className="material-symbols-outlined text-base sm:text-lg">
              close
            </span>
          </div>
        );
      case "retrying":
      case "processing":
        return (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
            <span className="material-symbols-outlined text-base sm:text-lg">
              sync
            </span>
          </div>
        );
      case "overdue":
        return (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-50 text-rose-600 shadow-xs">
            <span className="font-heading text-xs font-bold">!</span>
          </div>
        );
      default:
        return (
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-xs">
            <span className="h-2 w-2 rounded-full bg-gray-300" />
          </div>
        );
    }
  };

  const renderBadge = (badgeVariant, badgeText) => {
    switch (badgeVariant) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 sm:px-3 py-0.5 font-heading text-[10px] sm:text-[11px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            {badgeText}
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 sm:px-3 py-0.5 font-heading text-[10px] sm:text-[11px] font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            {badgeText}
          </span>
        );
      case "retrying":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-0.5 font-heading text-[10px] sm:text-[11px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {badgeText}
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 sm:px-3 py-0.5 font-heading text-[10px] sm:text-[11px] font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            {badgeText}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 sm:px-3 py-0.5 font-heading text-[10px] sm:text-[11px] font-semibold text-slate-600">
            {badgeText}
          </span>
        );
    }
  };

  const hasMoreThanFour = scheduleItems.length > 4;
  const visibleItems = isExpanded || !hasMoreThanFour ? scheduleItems : scheduleItems.slice(0, 4);

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-6 md:p-7 shadow-xs text-left">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-gray-100 mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0F5C3E]">
            <span className="material-symbols-outlined text-xl">timeline</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
              Installment Schedule
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
              {cyclesCount} payment milestones & verified gateway records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-heading text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {cyclesCount} Cycles
          </span>
          {hasMoreThanFour && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
              aria-label={isExpanded ? "Collapse installments" : "Expand installments"}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-0">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          return (
            <div
              key={item.id}
              className="relative flex items-start gap-3.5 sm:gap-4 pb-6 sm:pb-7 last:pb-1"
            >
              {/* Continuous vertical connector line spanning from this node directly into the next node */}
              {!isLast && (
                <span
                  className="absolute left-4 top-4 h-full border-l-2 border-gray-200 -translate-x-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Node Icon */}
              <div className="relative z-10 shrink-0">
                {renderNodeIcon(item.state)}
              </div>

              {/* Center & Right Content */}
              <div className="flex flex-1 flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-3 pt-0.5 min-w-0">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <h4 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {item.title}
                    </h4>
                    {/* Badge on mobile next to title */}
                    <div className="sm:hidden">
                      {renderBadge(item.badgeVariant, item.badgeText)}
                    </div>
                  </div>

                  <p className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-snug tabular-nums">
                    {formatCurrency(item.amount)}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-normal">
                    <span>{item.dateLabel}</span>

                    {item.rawPaymentId && (
                      <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200/80">
                        <span>ID: {item.rawPaymentId.slice(0, 14)}...</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.rawPaymentId)}
                          className="text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                          title="Copy full payment ID"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {copiedPid === item.rawPaymentId ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge on tablet/desktop */}
                <div className="hidden sm:block shrink-0 pt-0.5">
                  {renderBadge(item.badgeVariant, item.badgeText)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Icon-only expand button below truncated list */}
      {hasMoreThanFour && !isExpanded && (
        <div className="pt-2 flex justify-center border-t border-gray-100/60 mt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-2xs transition-all cursor-pointer group"
            aria-label="Expand all installments"
            title="Expand"
          >
            <ChevronDown className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
          </button>
        </div>
      )}
    </div>
  );
}
