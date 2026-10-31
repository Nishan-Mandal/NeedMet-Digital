import { formatCurrency, formatPlanDuration } from "../../../utils/Formatters";

export default function PriceBreakdown({ plan, pricing }) {
  const isEmi = pricing?.isEmi;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-gray-700">
        <span className="text-gray-500">Plan</span>
        <span className="font-semibold text-gray-900">{plan.name}</span>
      </div>

      <div className="flex justify-between text-gray-700">
        <span className="text-gray-500">Duration</span>
        <span className="font-medium text-gray-900">{formatPlanDuration(plan)}</span>
      </div>

      <div className="flex justify-between text-gray-700">
        <span className="text-gray-500">Plan Price</span>
        <span className="font-medium text-gray-900">{formatCurrency(pricing.total)}</span>
      </div>

      {pricing.couponDiscount > 0 && (
        <div className="flex justify-between font-medium text-emerald-700">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">local_offer</span>
            Coupon Discount
          </span>
          <span>-{formatCurrency(pricing.couponDiscount)}</span>
        </div>
      )}

      {/* EMI-Specific Breakdown Card */}
      {isEmi ? (
        <div className="mt-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              <span className="material-symbols-outlined text-xs">payments</span>
              {pricing.upfrontDisplay || "15%"} Down Payment Model
            </span>
            <span className="text-xs text-gray-500">Total Plan: {formatCurrency(pricing.grand)}</span>
          </div>

          <div className="border-t border-emerald-100 pt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="block text-xs font-medium text-gray-600">Payable Today ({pricing.upfrontDisplay || "15%"} Upfront)</span>
                <span className="text-xs text-emerald-700 font-medium">Step 1: One-time payment</span>
              </div>
              <span className="text-xl font-bold text-emerald-900">
                {formatCurrency(pricing.upfrontAmount)}
              </span>
            </div>

            <div className="flex items-baseline justify-between border-t border-emerald-100/60 pt-2">
              <div>
                <span className="block text-xs font-medium text-gray-600">Monthly Auto-Pay</span>
                <span className="text-xs text-gray-500">Step 2: Recurring mandate</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(pricing.emiAmount)}
                  <span className="text-xs font-normal text-gray-500"> / mo</span>
                </span>
                <span className="block text-[11px] text-gray-500">
                  ({pricing.totalCycles} cycles, starts +30 days)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Total Due Today</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(pricing.grand)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}