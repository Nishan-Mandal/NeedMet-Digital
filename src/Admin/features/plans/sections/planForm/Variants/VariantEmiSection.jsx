import React from "react";
import { getDefaultMonthlyEmiCycles } from "../../../utils/planForm.utils";

export default function VariantEmiSection({
  activeVariant = {},
  activeIndex = 0,
  activeCalc = {},
  onUpdateVariant,
}) {
  if (activeVariant.paymentOptions !== "BOTH" && activeVariant.paymentOptions !== "EMI") {
    return null;
  }

  const defaultCycles = getDefaultMonthlyEmiCycles(activeVariant);

  const upfrontVal =
    activeVariant.upfrontValue !== undefined && activeVariant.upfrontValue !== null
      ? activeVariant.upfrontValue
      : "";
  const cyclesVal =
    activeVariant.totalCycles !== undefined && activeVariant.totalCycles !== null && activeVariant.totalCycles !== ""
      ? activeVariant.totalCycles
      : defaultCycles;
  const billingDayVal =
    activeVariant.billingDay !== undefined && activeVariant.billingDay !== null && activeVariant.billingDay !== ""
      ? activeVariant.billingDay
      : 9;

  return (
    <div className="space-y-3 pt-2.5 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
        <span className="material-symbols-outlined text-[#0f5c3e] text-base">event_repeat</span>
        <span>Upfront Payment & EMI / Installment Configuration</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Down Payment Mode */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Down Payment Mode</label>
          <select
            value={activeVariant.upfrontType || "percentage"}
            onChange={(e) => onUpdateVariant(activeIndex, "upfrontType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition cursor-pointer"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Flat (₹)</option>
          </select>
        </div>

        {/* Upfront Value */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">
            {activeVariant.upfrontType === "percentage" ? "Upfront Value (%)" : "Upfront Value (₹)"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={upfrontVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "upfrontValue", numeric);
            }}
            placeholder={activeVariant.upfrontType === "percentage" ? "e.g. 15" : "e.g. 1000"}
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        {/* Monthly EMI Cycles */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Monthly EMI Cycles</label>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={cyclesVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "totalCycles", numeric);
            }}
            placeholder={`e.g. ${defaultCycles}`}
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        {/* Billing Day */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Billing Day (1–31)</label>
          <input
            type="number"
            min={1}
            max={31}
            value={billingDayVal}
            onChange={(e) => onUpdateVariant(activeIndex, "billingDay", e.target.value)}
            placeholder="9"
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>
      </div>

      {/* EMI Schedule Summary Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl bg-[#e8f5ee] border border-[#a7f3d0]/70 p-3 text-xs shadow-2xs">
        <span className="text-slate-700">
          Down Payment:{" "}
          <strong className="text-[#0f5c3e] font-bold">
            ₹{Number(activeCalc.upfrontAmount || 0).toLocaleString("en-IN")}
          </strong>
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-slate-700">
          Balance Payable:{" "}
          <strong className="text-slate-900 font-bold">
            ₹{Number(activeCalc.remainingAmount || 0).toLocaleString("en-IN")}
          </strong>
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-slate-700">
          Monthly Installment:{" "}
          <strong className="text-[#0f5c3e] font-bold">
            ₹{Number(activeCalc.emiAmount || 0).toLocaleString("en-IN")}/mo
          </strong>{" "}
          ({activeCalc.cycles || 1} mos, on the {billingDayVal}th)
        </span>
      </div>
    </div>
  );
}
