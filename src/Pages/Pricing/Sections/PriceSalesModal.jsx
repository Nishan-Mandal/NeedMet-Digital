import React from "react";
import { formatCurrency, formatPlanDuration } from "../../../utils/Formatters";

export default function PriceSalesModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  pricing,
  paymentMethod,
  saleBy,
  setSaleBy,
  service,
}) {
  if (!isOpen) return null;

  const isEmi = pricing?.isEmi;
  const payableToday = isEmi ? pricing?.upfrontAmount : pricing?.grand;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
            <h3 className="text-xl font-bold text-gray-900">Order & Payment Details</h3>
          </div>
          <p className="text-xs text-gray-500">
            Review your order summary and provide executive details before proceeding.
          </p>
        </div>

        {/* Plan & Price Summary Box */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 space-y-3 mb-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
            <div>
              <p className="font-bold text-gray-900 text-sm">{currentPlan?.name || "Service Plan"}</p>
              <p className="text-xs text-gray-500">{service?.title || service?.name || "NeedMate Service"}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {formatPlanDuration(currentPlan)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Plan Base Price</span>
              <span className="font-medium text-gray-900">{formatCurrency(pricing?.total)}</span>
            </div>

            {pricing?.couponDiscount > 0 && (
              <div className="flex justify-between font-medium text-emerald-700">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_offer</span>
                  Coupon Discount
                </span>
                <span>-{formatCurrency(pricing.couponDiscount)}</span>
              </div>
            )}

            {isEmi && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Total Plan Price</span>
                  <span className="font-medium text-gray-900">{formatCurrency(pricing?.grand)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Monthly Auto-Pay</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(pricing?.emiAmount)} / mo
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Payable Amount Highlight */}
          <div className="pt-2 border-t border-gray-200/60 flex items-baseline justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-800">
                {isEmi ? "Down Payment Payable Today" : "Total Amount Payable"}
              </span>
              <span className="text-[11px] text-gray-500">
                {isEmi ? "Step 1 of 2: Upfront down payment" : "Full one-time payment"}
              </span>
            </div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(payableToday)}
            </span>
          </div>
        </div>

        {/* SalesMan Name Input Section */}
        <div className="mb-5">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">person</span>
            Salesman Name
          </label>
          <input
            type="text"
            value={saleBy || ""}
            onChange={(e) => setSaleBy && setSaleBy(e.target.value)}
            placeholder="Enter salesman / agent name (optional)"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            If you were assisted by an executive, please mention their name.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-3.5 px-4 font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              {isEmi ? "lock_clock" : "lock"}
            </span>
            <span>Proceed to Pay {formatCurrency(payableToday)}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-2.5 font-medium text-xs text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel & Review Order
          </button>
        </div>
      </div>
    </div>
  );
}
