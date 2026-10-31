import React from "react";

export default function VariantPricingSection({
  activeVariant = {},
  activeIndex = 0,
  activeCalc = {},
  onUpdateVariant,
}) {
  const priceVal =
    activeVariant.price !== undefined && activeVariant.price !== null
      ? activeVariant.price
      : "";
  const discountVal =
    activeVariant.discountAmount !== undefined && activeVariant.discountAmount !== null
      ? activeVariant.discountAmount
      : "";

  return (
    <div className="border-t border-gray-100 pt-2.5 space-y-2.5">
      <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
        <span className="material-symbols-outlined text-[#266C51] text-sm">payments</span>
        <span>Pricing & Payment Modes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">Base Price (₹) *</label>
          <input
            type="text"
            inputMode="numeric"
            value={priceVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "price", numeric);
            }}
            placeholder="e.g. 3999"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#266C51]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">Discount (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            value={discountVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "discountAmount", numeric);
            }}
            placeholder="e.g. 500"
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#266C51]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">Payable Price</label>
          <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 border border-emerald-200/70 px-2 py-1">
            <span className="text-xs font-black text-emerald-800">
              ₹{Number(activeCalc.finalPrice || 0).toLocaleString("en-IN")}
            </span>
            {activeCalc.discountPercent > 0 && (
              <span className="rounded bg-emerald-200 px-1 py-0.2 text-[9px] font-bold text-emerald-900">
                {activeCalc.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">Payment Modes</label>
          <select
            value={activeVariant.paymentOptions || "BOTH"}
            onChange={(e) => onUpdateVariant(activeIndex, "paymentOptions", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#266C51]"
          >
            <option value="BOTH">Full & Monthly EMI</option>
            <option value="EMI">EMI Only</option>
            <option value="FULL">Full Payment Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}

