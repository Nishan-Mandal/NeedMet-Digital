import React from "react";

export default function VariantTabs({
  variants = [],
  activeIndex = 0,
  variantCalculations = [],
  onSelectVariantIndex,
  onRemoveVariant,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50/80 rounded-xl border border-slate-200/60 shadow-2xs">
      {variants.map((v, idx) => {
        const isSelected = idx === activeIndex;
        const calc = variantCalculations[idx] || {};
        const rawPrice = Number(v.price) || 0;
        const displayPrice = calc.finalPrice !== undefined ? calc.finalPrice : rawPrice;

        return (
          <div
            key={v.id || idx}
            onClick={() => onSelectVariantIndex(idx)}
            className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition cursor-pointer text-xs ${
              isSelected
                ? "bg-[#0f5c3e] text-white shadow-xs font-bold"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold shadow-2xs"
            }`}
          >
            <span>{v.name || v.duration || `Tier ${idx + 1}`}</span>
            <span
              className={`text-[11px] ${
                isSelected ? "text-emerald-100 font-semibold" : "text-slate-500 font-normal"
              }`}
            >
              ₹{Number(displayPrice || 0).toLocaleString("en-IN")}
            </span>
            {v.tag && (
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#e8f5ee] text-[#0f5c3e]"
                }`}
              >
                {v.tag}
              </span>
            )}
            {variants.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVariant(idx);
                }}
                className={`rounded p-0.5 transition cursor-pointer -mr-0.5 ${
                  isSelected
                    ? "hover:bg-red-500 hover:text-white text-emerald-200"
                    : "text-slate-600 hover:text-red-600 hover:bg-red-50"
                }`}
                title="Remove this tier"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

