import React from "react";
import ToggleButton from "../../../../../../Components/common/ToggleButton";

const PRESET_TAGS = [
  "Popular",
  "Best Value",
  "Recommended",
  "Trending",
  "Best Seller",
  "Saver",
  "Exclusive",
];

export default function VariantIdentitySection({
  activeVariant = {},
  activeIndex = 0,
  onUpdateVariant,
  onDuplicateVariant,
}) {
  const durationDaysVal =
    activeVariant.durationDays !== undefined && activeVariant.durationDays !== null
      ? activeVariant.durationDays
      : "";

  return (
    <div className="space-y-3">
      {/* Tier Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="font-bold text-slate-900">
            Duration & Validity:{" "}
            <span className="text-[#0f5c3e]">
              {activeVariant.name || activeVariant.duration || `Tier ${activeIndex + 1}`}
            </span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 text-[11px]">
            {activeVariant.duration || "Custom"} ({durationDaysVal || 0} days)
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ToggleButton
            checked={Boolean(activeVariant.isActive)}
            onChange={(e) =>
              onUpdateVariant(activeIndex, "isActive", e.target.checked)
            }
            label="Active"
            size="sm"
          />
          <button
            type="button"
            onClick={() => onDuplicateVariant(activeIndex)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition cursor-pointer"
            title="Duplicate this plan tier"
          >
            <span className="material-symbols-outlined text-xs text-slate-600">content_copy</span>
            <span>Duplicate</span>
          </button>
        </div>
      </div>

      {/* Identification & Duration Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Tier Name *</label>
          <input
            type="text"
            value={activeVariant.name || ""}
            onChange={(e) => onUpdateVariant(activeIndex, "name", e.target.value)}
            placeholder="e.g. Starter-3M"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Duration Label *</label>
          <input
            type="text"
            value={activeVariant.duration || ""}
            onChange={(e) => onUpdateVariant(activeIndex, "duration", e.target.value)}
            placeholder="e.g. 3 Months"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Duration Days *</label>
          <input
            type="text"
            inputMode="numeric"
            value={durationDaysVal}
            onChange={(e) => {
              const numeric = e.target.value.replace(/[^0-9]/g, "");
              onUpdateVariant(activeIndex, "durationDays", numeric);
            }}
            placeholder="e.g. 90"
            required
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Category Tier</label>
          <select
            value={activeVariant.planType || "3 Months"}
            onChange={(e) => onUpdateVariant(activeIndex, "planType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition cursor-pointer"
          >
            <option value="1 Month">1 Month</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months">6 Months</option>
            <option value="1 Year">1 Year</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Badge Tag with Presets */}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-xs font-bold text-slate-800 mr-1">Badge Tag:</span>
          <input
            type="text"
            value={activeVariant.tag || ""}
            onChange={(e) => onUpdateVariant(activeIndex, "tag", e.target.value)}
            placeholder="e.g. Popular"
            className="w-24 rounded-lg border border-slate-200 bg-[#f8faf9] focus:bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs"
          />
          {PRESET_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onUpdateVariant(activeIndex, "tag", t)}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer border ${
                activeVariant.tag === t
                  ? "bg-[#0f5c3e] text-white border-[#0f5c3e] shadow-2xs"
                  : "bg-slate-100 text-slate-700 border-slate-200/60 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
          {activeVariant.tag && (
            <button
              type="button"
              onClick={() => onUpdateVariant(activeIndex, "tag", "")}
              className="text-slate-600 hover:text-slate-900 text-xs px-1.5 py-1 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
