import React, { useState } from "react";
import { parseBulkFeatures } from "../../../utils/planForm.utils";

const FEATURE_ICONS = [
  "check_circle",
  "verified",
  "star",
  "analytics",
  "trending_up",
  "videocam",
  "smart_display",
  "brush",
  "code",
  "campaign",
  "support_agent",
  "shield",
  "palette",
  "image",
];

export default function VariantFeaturesSection({
  activeVariant = {},
  activeIndex = 0,
  variants = [],
  onAddVariantFeature,
  onUpdateVariantFeature,
  onRemoveVariantFeature,
  onApplyVariantBulkFeatures,
  onCopyFeatures,
}) {
  const [featureModeMap, setFeatureModeMap] = useState({});
  const [bulkTextMap, setBulkTextMap] = useState({});

  const isBulkMode = featureModeMap[activeIndex] === "bulk";
  const bulkText =
    bulkTextMap[activeIndex] !== undefined
      ? bulkTextMap[activeIndex]
      : (activeVariant.features || [])
          .map((f) => (f.desc ? `${f.title}: ${f.desc}` : f.title))
          .join("\n");

  const handleBulkChange = (txt) => {
    setBulkTextMap((p) => ({ ...p, [activeIndex]: txt }));
  };

  const handleApplyBulk = () => {
    const parsed = parseBulkFeatures(bulkText);
    onApplyVariantBulkFeatures(activeIndex, parsed);
    setFeatureModeMap((p) => ({ ...p, [activeIndex]: "structured" }));
  };

  const toggleFeatureMode = () => {
    if (!isBulkMode) {
      setBulkTextMap((p) => ({
        ...p,
        [activeIndex]: (activeVariant.features || [])
          .map((f) => (f.desc ? `${f.title}: ${f.desc}` : f.title))
          .join("\n"),
      }));
      setFeatureModeMap((p) => ({ ...p, [activeIndex]: "bulk" }));
    } else {
      setFeatureModeMap((p) => ({ ...p, [activeIndex]: "structured" }));
    }
  };

  return (
    <div className="border-t border-slate-100 pt-3 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#0f5c3e] text-base">checklist</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            Deliverables for {activeVariant.name || activeVariant.duration || `Tier ${activeIndex + 1}`}
          </span>
          <span className="rounded-md bg-[#e8f5ee] px-2 py-0.5 text-xs font-bold text-[#0f5c3e]">
            {(activeVariant.features || []).length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variants.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Copy:</span>
              <select
                onChange={(e) => {
                  if (e.target.value !== "") {
                    onCopyFeatures(activeIndex, Number(e.target.value));
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="rounded-lg border border-slate-200 hover:border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f5c3e] shadow-2xs"
              >
                <option value="" disabled>From tier...</option>
                {variants.map((v, i) => (
                  i !== activeIndex && (
                    <option key={i} value={i}>
                      {v.name || v.duration || `Tier ${i + 1}`} ({(v.features || []).length})
                    </option>
                  )
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={toggleFeatureMode}
            className="text-xs font-semibold text-[#0f5c3e] hover:underline cursor-pointer py-1 px-1"
          >
            {isBulkMode ? "List View" : "Bulk Paste"}
          </button>

          {!isBulkMode && (
            <button
              type="button"
              onClick={() => onAddVariantFeature(activeIndex)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0f5c3e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0c4a32] transition cursor-pointer shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* List Mode / Bulk Mode */}
      {isBulkMode ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            One deliverable per line. Format: <code className="text-[#0f5c3e] font-semibold">Title: Description</code>
          </p>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => handleBulkChange(e.target.value)}
            placeholder="Weekly Reports: Delivered every week.&#10;Social Calendar: 30-day planned posts."
            className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] p-2.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs transition"
          />
          <button
            type="button"
            onClick={handleApplyBulk}
            className="rounded-xl bg-[#0f5c3e] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0c4a32] transition cursor-pointer shadow-sm hover:shadow-md"
          >
            Apply Deliverables
          </button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-1.5">
          {(activeVariant.features || []).map((feat, fIdx) => (
            <div
              key={fIdx}
              className="p-2 sm:p-0 rounded-xl sm:rounded-none border border-slate-200/60 sm:border-0 bg-slate-50/80 sm:bg-transparent shadow-2xs sm:shadow-none space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-1.5"
            >
              {/* Row 1 on mobile: Icon Select + Title + Delete Button */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {/* Compact Icon */}
                <select
                  value={feat.icon || "check_circle"}
                  onChange={(e) => onUpdateVariantFeature(activeIndex, fIdx, "icon", e.target.value)}
                  className="w-20 sm:w-16 rounded-xl sm:rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0f5c3e] shadow-2xs shrink-0"
                >
                  {FEATURE_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>

                {/* Title */}
                <input
                  type="text"
                  value={feat.title || ""}
                  onChange={(e) => onUpdateVariantFeature(activeIndex, fIdx, "title", e.target.value)}
                  placeholder="Deliverable title"
                  required
                  className="flex-1 sm:w-56 rounded-xl sm:rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs"
                />

                {/* Delete button (mobile only here) */}
                <button
                  type="button"
                  onClick={() => onRemoveVariantFeature(activeIndex, fIdx)}
                  className="sm:hidden rounded-lg p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0 border border-slate-200 bg-white shadow-2xs"
                  title="Remove deliverable"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Description */}
              <input
                type="text"
                value={feat.desc || ""}
                onChange={(e) => onUpdateVariantFeature(activeIndex, fIdx, "desc", e.target.value)}
                placeholder="Scope details (optional)"
                className="w-full sm:flex-1 sm:min-w-0 rounded-xl sm:rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs"
              />

              {/* Delete button (desktop only) */}
              <button
                type="button"
                onClick={() => onRemoveVariantFeature(activeIndex, fIdx)}
                className="hidden sm:inline-flex rounded-lg p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                title="Remove deliverable"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ))}

          {(activeVariant.features || []).length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200/70 py-3.5 text-center bg-[#f7faf8]">
              <p className="text-xs text-slate-400">No deliverables added yet for this tier.</p>
              <button
                type="button"
                onClick={() => onAddVariantFeature(activeIndex)}
                className="mt-1.5 inline-flex items-center gap-1 rounded-xl bg-[#0f5c3e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0c4a32] transition cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Deliverable</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
