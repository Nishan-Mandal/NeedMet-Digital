import React from "react";
import { DURATION_PRESETS } from "../../utils/planForm.utils";

export default function VariantHeader({
  variantsCount = 0,
  onAddPresetVariant,
  onAddCustomVariant,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#266C51] text-base">
            calendar_month
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-gray-900">
            Service Plans & Duration Tiers
          </h2>
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
            {variantsCount} Tier{variantsCount === 1 ? "" : "s"}
          </span>
        </div>
        <p className="text-[11px] text-gray-500">
          Duration options (1M, 3M, 6M, 1Y) and pricing under this service.
        </p>
      </div>

      {/* QUICK PRESET BUTTONS */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-0.5">
          + Add:
        </span>
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onAddPresetVariant(preset.key)}
            className="inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 hover:border-[#266C51] hover:text-[#266C51] hover:bg-emerald-50/40 transition cursor-pointer"
            title={`Add ${preset.duration} tier`}
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>{preset.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={onAddCustomVariant}
          className="inline-flex items-center gap-0.5 rounded-md border border-dashed border-gray-300 bg-gray-50/50 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600 hover:border-[#266C51] hover:text-[#266C51] transition cursor-pointer"
          title="Add custom duration tier"
        >
          <span className="material-symbols-outlined text-xs">more_time</span>
          <span>Custom</span>
        </button>
      </div>
    </div>
  );
}

