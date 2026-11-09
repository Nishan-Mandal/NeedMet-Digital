import React from "react";
import { calculateAuthoritativeFinancials } from "../../Profile/utils/profile.utils";
import {
  deriveDurationDays,
  getSafeDate,
  extractDateFromId,
  formatPlanDate,
  formatCurrency,
} from "../utils/planDetails.utils";

/**
 * PlanFinancialOverview Component
 *
 * Renders the financial overview with:
 * - For EMI Plans: KPI Stat Cards (Total, Paid, Remaining Balance), Payment Progress Bar,
 *   and installment breakdown.
 * - For Full Payment Plans: Streamlined full payment confirmation card without partial installment
 *   progress bars or confusing remaining balances.
 */
export default function PlanFinancialOverview({ purchase }) {
  if (!purchase) return null;

  const durationDays = deriveDurationDays(purchase);
  const financials = calculateAuthoritativeFinancials(purchase);
  const { isEmi, planTotal, upfrontPaid, verifiedPaid, remainingBalance, paidPercent } = financials;

  const isFullPaid =
    !isEmi &&
    (financials.isFullPaidCompleted ||
      financials.isUpfrontPaid ||
      purchase.status === "completed" ||
      purchase.status === "active" ||
      purchase.planAccessStatus === "active");
  const rawCycles = Number(purchase.pricing?.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  const totalCycles = rawCycles > 0 ? rawCycles : (durationDays > 30 ? Math.round(durationDays / 30) : 3);
  const emiAmount = Number(
    purchase.pricing?.emiAmount ??
      (totalCycles > 0 && remainingBalance > 0
        ? Math.round((remainingBalance / totalCycles) * 100) / 100
        : 566.38)
  );

  const baseDate = getSafeDate(
    purchase.createdAt || purchase.startDate,
    extractDateFromId(purchase.id || purchase.orderId) || new Date()
  );
  const purchasedOnStr = formatPlanDate(baseDate);

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs text-left space-y-4 sm:space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0F5C3E]">
            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
              {isEmi ? "Financial Overview" : "Payment Overview"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
              {isEmi
                ? "Investment breakdown & installment terms"
                : "Verified transaction summary"}
            </p>
          </div>
        </div>

        {isEmi ? (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 font-heading text-xs font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {paidPercent}% Settled
          </span>
        ) : isFullPaid ? (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 font-heading text-xs font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid in Full
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 font-heading text-xs font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Payment Incomplete
          </span>
        )}
      </div>

      {/* KPI Highlight Grid & Progress Bar (ONLY FOR EMI PLANS) */}
      {isEmi ? (
        <>
          {/* KPI Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Total Investment */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Total Investment
              </span>
              <span className="font-heading font-bold text-base sm:text-lg md:text-xl text-slate-900 tracking-tight tabular-nums block">
                {formatCurrency(planTotal)}
              </span>
            </div>

            {/* Verified Paid */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 sm:p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800 block uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Verified Paid
              </span>
              <span className="font-heading font-bold text-base sm:text-lg md:text-xl text-[#0F5C3E] tracking-tight tabular-nums block">
                {formatCurrency(verifiedPaid)}
              </span>
            </div>

            {/* Remaining Balance */}
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Remaining Balance
              </span>
              <span className="font-heading font-bold text-base sm:text-lg md:text-xl text-slate-900 tracking-tight tabular-nums block">
                {remainingBalance > 0 ? formatCurrency(remainingBalance) : "₹0 (Paid)"}
              </span>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 font-medium">Payment Completion</span>
              <span className="font-heading text-emerald-800 font-bold tracking-tight">
                {formatCurrency(verifiedPaid)} of {formatCurrency(planTotal)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-[#10b981] transition-all duration-500"
                style={{ width: `${Math.max(6, paidPercent)}%` }}
              />
            </div>
          </div>
        </>
      ) : isFullPaid ? (
        /* Full Payment Summary Card (Settled) */
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-emerald-50/30 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-950 tracking-tight tabular-nums">
                {formatCurrency(planTotal || verifiedPaid)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-sm">verified</span>
                100% Settled
              </span>
            </div>
          </div>

          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#0F5C3E]">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
        </div>
      ) : (
        /* Full Payment Summary Card (Pending / Unpaid) */
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-amber-50/30 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
              Payment Status
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-950 tracking-tight tabular-nums">
                {formatCurrency(verifiedPaid)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-sm">pending</span>
                Payment Incomplete / Cancelled
              </span>
            </div>
          </div>

          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <span className="material-symbols-outlined text-2xl">hourglass_top</span>
          </div>
        </div>
      )}

      {/* Structured Details Breakdown Rows */}
      <div className="divide-y divide-gray-100 border-t border-gray-100 pt-1 space-y-0 text-xs sm:text-sm">
        {/* Payment Amount */}
        <div className="flex items-center justify-between py-2.5 gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium min-w-0">
            <span className="material-symbols-outlined text-slate-500 text-lg shrink-0">
              payments
            </span>
            <span className="truncate">
              {isEmi ? "Upfront Down Payment" : "Total Amount Paid"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-heading font-bold text-emerald-800 shrink-0 text-right tabular-nums">
            <span>{formatCurrency(isEmi ? upfrontPaid : (planTotal || verifiedPaid))}</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">
              check_circle
            </span>
          </div>
        </div>

        {/* Installment Plan (ONLY if EMI) */}
        {isEmi && (
          <div className="flex items-center justify-between py-2.5 gap-3">
            <div className="flex items-center gap-2 text-slate-600 font-medium min-w-0">
              <span className="material-symbols-outlined text-slate-500 text-lg shrink-0">
                calendar_month
              </span>
              <span className="truncate">Monthly Installments</span>
            </div>
            <div className="font-heading font-bold text-slate-900 shrink-0 text-right tabular-nums">
              {totalCycles} × {formatCurrency(emiAmount)}/mo
            </div>
          </div>
        )}

        {/* Delivery Window */}
        <div className="flex items-center justify-between py-2.5 gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium min-w-0">
            <span className="material-symbols-outlined text-slate-500 text-lg shrink-0">
              schedule
            </span>
            <span className="truncate">Delivery Period</span>
          </div>
          <div className="font-heading font-bold text-slate-900 shrink-0 text-right">
            {durationDays} Days Execution
          </div>
        </div>

        {/* Enrolled Date */}
        <div className="flex items-center justify-between py-2.5 gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium min-w-0">
            <span className="material-symbols-outlined text-slate-500 text-lg shrink-0">
              event
            </span>
            <span className="truncate">Enrolled On</span>
          </div>
          <div className="font-heading font-semibold text-slate-900 shrink-0 text-right">
            {purchasedOnStr}
          </div>
        </div>
      </div>
    </div>
  );
}
