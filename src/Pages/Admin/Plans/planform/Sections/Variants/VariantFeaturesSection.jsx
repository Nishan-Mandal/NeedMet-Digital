import React, { useState } from "react";
import { parseBulkFeatures } from "../../utils/planForm.utils";

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
    <div className="border-t border-gray-100 pt-2.5 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#266C51] text-sm">checklist</span>
          <span className="text-xs font-bold text-gray-900">
            Deliverables for {activeVariant.name || activeVariant.duration || `Tier ${activeIndex + 1}`}
          </span>
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
            {(activeVariant.features || []).length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {variants.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">Copy:</span>
              <select
                onChange={(e) => {
                  if (e.target.value !== "") {
                    onCopyFeatures(activeIndex, Number(e.target.value));
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-700"
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
            className="text-[11px] font-semibold text-[#266C51] hover:underline cursor-pointer"
          >
            {isBulkMode ? "List View" : "Bulk Paste"}
          </button>

          {!isBulkMode && (
            <button
              type="button"
              onClick={() => onAddVariantFeature(activeIndex)}
              className="inline-flex items-center gap-0.5 rounded-md bg-[#266C51] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-[#1f5741] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* List Mode / Bulk Mode */}
      {isBulkMode ? (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-400">
            One deliverable per line. Format: <code className="text-[#266C51] font-semibold">Title: Description</code>
          </p>
          <textarea
            rows={3}
            value={bulkText}
            onChange={(e) => handleBulkChange(e.target.value)}
            placeholder="Weekly Reports: Delivered every week.&#10;Social Calendar: 30-day planned posts."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 font-mono text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#266C51]"
          />
          <button
            type="button"
            onClick={handleApplyBulk}
            className="rounded-md bg-[#266C51] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1f5741] transition cursor-pointer"
          >
            Apply Deliverables
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {(activeVariant.features || []).map((feat, fIdx) => (
            <div
              key={fIdx}
              className="flex items-center gap-1.5 py-0.5"
            >
              {/* Compact Icon */}
              <select
                value={feat.icon || "check_circle"}
                onChange={(e) => onUpdateVariantFeature(activeIndex, fIdx, "icon", e.target.value)}
                className="w-16 rounded-md border border-gray-200 bg-white px-1 py-1 text-xs text-gray-700 focus:outline-none"
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
                className="w-44 sm:w-60 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#266C51]"
              />

              {/* Description */}
              <input
                type="text"
                value={feat.desc || ""}
                onChange={(e) => onUpdateVariantFeature(activeIndex, fIdx, "desc", e.target.value)}
                placeholder="Scope details (optional)"
                className="flex-1 min-w-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none focus:border-[#266C51]"
              />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onRemoveVariantFeature(activeIndex, fIdx)}
                className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
                title="Remove deliverable"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          ))}

          {(activeVariant.features || []).length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 py-3 text-center">
              <p className="text-xs text-gray-400">No deliverables added yet for this tier.</p>
              <button
                type="button"
                onClick={() => onAddVariantFeature(activeIndex)}
                className="mt-1 inline-flex items-center gap-0.5 rounded-md bg-[#266C51] px-2 py-0.5 text-xs font-semibold text-white hover:bg-[#1f5741] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>Add Deliverable</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

