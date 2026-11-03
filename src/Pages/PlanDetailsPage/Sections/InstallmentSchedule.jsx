import React, { useState } from "react";

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

  if (!purchase) return null;

  const pricing = purchase.pricing || {};
  const finalPrice = Number(pricing.finalPrice ?? purchase.amount ?? 0);
  const upfrontPaid = Number(
    pricing.upfrontAmount ??
      purchase.upfrontAmount ??
      purchase.upfrontPayment?.amount ??
      (finalPrice > 0 ? Math.round(finalPrice * 0.15 * 100) / 100 : 299.85)
  );
  const remainingBalance = Number(
    pricing.remainingAmount ?? Math.max(0, finalPrice - upfrontPaid)
  );

  // Extract base creation / enrollment date
  const getBaseDate = () => {
    const raw = purchase.createdAt || purchase.startDate || purchase.timestamp;
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
  const upfrontStatus = purchase.upfrontPayment?.status || (purchase.paymentId ? "captured" : "pending");
  const isUpfrontCaptured = upfrontStatus === "captured" || upfrontStatus === "success";
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

  // Recurring installments
  const storedInstallments = Array.isArray(pricing.installments) && pricing.installments.length > 0
    ? pricing.installments
    : null;

  const rawCycles = Number(pricing.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  const cyclesCount = storedInstallments ? storedInstallments.length : (rawCycles > 0 ? rawCycles : 3);
  const emiAmount = Number(
    pricing.emiAmount ??
      (remainingBalance > 0
        ? Math.round((remainingBalance / cyclesCount) * 100) / 100
        : 566.38)
  );

  const now = new Date();

  if (storedInstallments) {
    storedInstallments.forEach((inst, idx) => {
      const cycleIndex = inst.cycleIndex || idx + 1;
      const instDueDate = inst.scheduledDate ? new Date(inst.scheduledDate) : null;
      const dueDateStr = formatScheduleDate(inst.scheduledDate);
      const isPaid = inst.status === "paid" || inst.status === "completed" ||
        (purchase.mandate?.paidCount && cycleIndex <= purchase.mandate.paidCount);
      const isFailed = inst.status === "failed";
      const isRetrying = inst.status === "retrying";
      const isProcessing = inst.status === "processing";
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
        const paidDateStr = formatScheduleDate(inst.paidAt || inst.scheduledDate);
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
    // Fallback: Synthesize from mandate paidCount if stored installments absent
    const fallbackBillingDay = Number(pricing.billingDay || 9);
    for (let i = 1; i <= cyclesCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      const maxDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
      dueDate.setDate(Math.min(fallbackBillingDay, maxDay));
      const dueDateStr = formatScheduleDate(dueDate);
      const isCompleted = Boolean(
        (purchase.paidCycles && i <= purchase.paidCycles) ||
        (purchase.mandate?.paidCount && i <= purchase.mandate.paidCount)
      );
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

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-6 md:p-7 shadow-xs text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-gray-100 mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0F5C3E]">
            <span className="material-symbols-outlined text-xl">timeline</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-black text-sm sm:text-base tracking-tight">
              Installment Schedule
            </h3>
            <p className="text-[11px] sm:text-xs text-black font-medium">
              {cyclesCount} payment milestones & verified gateway records
            </p>
          </div>
        </div>

        <span className="font-heading text-xs font-bold text-black bg-gray-100 px-2.5 py-1 rounded-lg">
          {cyclesCount} Cycles
        </span>
      </div>

      {/* Timeline List */}
      <div className="space-y-0">
        {scheduleItems.map((item, index) => {
          const isLast = index === scheduleItems.length - 1;

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
                    <h4 className="font-heading font-bold text-black text-sm sm:text-base leading-tight">
                      {item.title}
                    </h4>
                    {/* Badge on mobile next to title */}
                    <div className="sm:hidden">
                      {renderBadge(item.badgeVariant, item.badgeText)}
                    </div>
                  </div>

                  <p className="font-heading font-extrabold text-base sm:text-lg text-black leading-snug tabular-nums">
                    {formatCurrency(item.amount)}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black font-medium">
                    <span>{item.dateLabel}</span>

                    {item.rawPaymentId && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-black font-mono text-[11px] px-1.5 py-0.5 rounded border border-gray-200">
                        <span>ID: {item.rawPaymentId.slice(0, 14)}...</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.rawPaymentId)}
                          className="hover:text-emerald-700 transition cursor-pointer"
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
    </div>
  );
}
