import React from "react";
import { DURATION_PRESETS } from "../../../utils/planForm.utils";

export default function VariantHeader({
  variantsCount = 0,
  onAddPresetVariant,
  onAddCustomVariant,
  isExpanded = true,
  onToggleExpand,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-left group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#0f5c3e] text-lg sm:text-base">
                calendar_month
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0f5c3e] transition">
                Duration Tiers & Pricing
              </h2>
              <span className="rounded-full bg-[#e8f5ee] border border-[#d1fae5]/70 px-2 py-0.5 text-[10px] font-bold text-[#0f5c3e]">
                {variantsCount} Tier{variantsCount === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs sm:text-[11px] text-slate-500">
              Duration options (1M, 3M, 6M, 1Y), pricing, and EMI schedules.
            </p>
          </div>
        </button>

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="sm:hidden inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition cursor-pointer shrink-0 ml-2"
            title={isExpanded ? "Collapse section" : "Expand section"}
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            <span className="material-symbols-outlined text-base">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        )}
      </div>

      {/* QUICK PRESET BUTTONS + Desktop expand/collapse */}
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-0.5">
            + Add:
          </span>
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onAddPresetVariant(preset.key)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#0f5c3e] hover:bg-[#e8f5ee]/40 shadow-2xs hover:shadow-xs transition cursor-pointer"
              title={`Add ${preset.duration} tier`}
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>{preset.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onAddCustomVariant}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0f5c3e] hover:text-[#0f5c3e] shadow-2xs hover:shadow-xs transition cursor-pointer"
            title="Add custom duration tier"
          >
            <span className="material-symbols-outlined text-xs">more_time</span>
            <span>Custom</span>
          </button>
        </div>

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="hidden sm:inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition cursor-pointer shrink-0"
            title={isExpanded ? "Collapse section" : "Expand section"}
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            <span className="material-symbols-outlined text-base">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
