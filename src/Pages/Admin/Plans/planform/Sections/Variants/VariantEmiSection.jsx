import React from "react";

export default function VariantEmiSection({
  activeVariant = {},
  activeIndex = 0,
  activeCalc = {},
  onUpdateVariant,
}) {
  if (activeVariant.paymentOptions !== "BOTH" && activeVariant.paymentOptions !== "EMI") {
    return null;
  }

  const upfrontVal =
    activeVariant.upfrontValue !== undefined && activeVariant.upfrontValue !== null
      ? activeVariant.upfrontValue
      : "";
  const cyclesVal =
    activeVariant.totalCycles !== undefined && activeVariant.totalCycles !== null
      ? activeVariant.totalCycles
      : "";

  return (
    <div className="space-y-2 pt-1 border-t border-gray-100">
      <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
        <span className="material-symbols-outlined text-[#266C51] text-sm">event_repeat</span>
        <span>Monthly EMI & Down Payment Schedule</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-gray-600">Down Payment Mode</label>
          <select
            value={activeVariant.upfrontType || "percentage"}
            onChange={(e) => onUpdateVariant(activeIndex, "upfrontType", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#266C51]"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-gray-600">
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
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#266C51]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-gray-600">Monthly EMI Cycles</label>
          <input
            type="text"
            inputMode="numeric"
            value={cyclesVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "totalCycles", numeric);
            }}
            placeholder="e.g. 3"
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#266C51]"
          />
        </div>
      </div>

      {/* Minimal horizontal EMI summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs">
        <span className="text-gray-600">
          Down Payment:{" "}
          <strong className="text-emerald-700 font-bold">
            ₹{Number(activeCalc.upfrontAmount || 0).toLocaleString("en-IN")}
          </strong>
        </span>
        <span className="text-gray-300 hidden sm:inline">•</span>
        <span className="text-gray-600">
          Balance:{" "}
          <strong className="text-gray-800 font-bold">
            ₹{Number(activeCalc.remainingAmount || 0).toLocaleString("en-IN")}
          </strong>
        </span>
        <span className="text-gray-300 hidden sm:inline">•</span>
        <span className="text-gray-600">
          EMI:{" "}
          <strong className="text-[#266C51] font-bold">
            ₹{Number(activeCalc.emiAmount || 0).toLocaleString("en-IN")}/mo
          </strong>{" "}
          ({activeCalc.cycles || 1} mos)
        </span>
      </div>
    </div>
  );
}

