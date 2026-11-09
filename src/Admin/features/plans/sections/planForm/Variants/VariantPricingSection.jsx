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
    <div className="border-t border-slate-100 pt-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
        <span className="material-symbols-outlined text-[#0f5c3e] text-base">payments</span>
        <span>Pricing Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Base Price (₹) *</label>
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
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Discount (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            value={discountVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "discountAmount", numeric);
            }}
            placeholder="e.g. 500"
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Payable Price</label>
          <div className="flex items-center justify-between rounded-xl bg-[#e8f5ee] border border-[#a7f3d0]/70 px-3 py-2 min-h-[38px] shadow-2xs">
            <span className="text-sm font-bold text-[#0f5c3e]">
              ₹{Number(activeCalc.finalPrice || 0).toLocaleString("en-IN")}
            </span>
            {activeCalc.discountPercent > 0 && (
              <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900 shadow-2xs">
                {activeCalc.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Payment Modes</label>
          <select
            value={activeVariant.paymentOptions || "BOTH"}
            onChange={(e) => onUpdateVariant(activeIndex, "paymentOptions", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition cursor-pointer"
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
