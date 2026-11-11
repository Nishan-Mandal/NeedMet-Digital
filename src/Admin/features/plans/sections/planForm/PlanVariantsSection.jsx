import React from "react";
import VariantHeader from "./Variants/VariantHeader";
import VariantTabs from "./Variants/VariantTabs";
import VariantIdentitySection from "./Variants/VariantIdentitySection";
import VariantPricingSection from "./Variants/VariantPricingSection";
import VariantEmiSection from "./Variants/VariantEmiSection";
import VariantFeaturesSection from "./Variants/VariantFeaturesSection";

export default function PlanVariantsSection({
  variants = [],
  selectedVariantIndex = 0,
  onSelectVariantIndex,
  onAddPresetVariant,
  onAddCustomVariant,
  onDuplicateVariant,
  onRemoveVariant,
  onUpdateVariant,
  variantCalculations = [],
  onAddVariantFeature,
  onUpdateVariantFeature,
  onRemoveVariantFeature,
  onApplyVariantBulkFeatures,
  onCopyFeatures,
  isExpanded = true,
  onToggleExpand,
}) {
  const activeIndex = Math.min(
    Math.max(selectedVariantIndex, 0),
    Math.max(variants.length - 1, 0)
  );
  const activeVariant = variants[activeIndex] || {};
  const activeCalc = variantCalculations[activeIndex] || {
    finalPrice: 0,
    upfrontAmount: 0,
    remainingAmount: 0,
    cycles: 1,
    emiAmount: 0,
    discountPercent: 0,
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3 text-left">
      {/* 1. Section Header & Quick Tier Presets */}
      <VariantHeader
        variantsCount={variants.length}
        onAddPresetVariant={onAddPresetVariant}
        onAddCustomVariant={onAddCustomVariant}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {/* Collapsed State Summary */}
      {!isExpanded && (
        <div
          onClick={onToggleExpand}
          className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-xl p-3 cursor-pointer hover:bg-slate-100/70 transition border border-slate-100"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900">
              {variants.length} Duration Tier{variants.length === 1 ? "" : "s"}:
            </span>
            {variants.map((v, i) => (
              <span
                key={i}
                className="rounded-md bg-white border border-slate-200/60 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs"
              >
                {v.name || v.duration || `Tier ${i + 1}`}
                {v.price ? ` • ₹${Number(v.price).toLocaleString("en-IN")}` : ""}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-[#0f5c3e] font-bold shrink-0 ml-2">Tap to expand</span>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* 2. Plan Selector Tabs Strip */}
          <VariantTabs
            variants={variants}
            activeIndex={activeIndex}
            variantCalculations={variantCalculations}
            onSelectVariantIndex={onSelectVariantIndex}
            onRemoveVariant={onRemoveVariant}
          />

          {/* 3. Active Tier Config Sections */}
          <div className="space-y-3 pt-0.5">
            {/* Tier Identity, Controls & Duration */}
            <VariantIdentitySection
              activeVariant={activeVariant}
              activeIndex={activeIndex}
              onUpdateVariant={onUpdateVariant}
              onDuplicateVariant={onDuplicateVariant}
            />

            {/* Pricing & Payment Modes */}
            <VariantPricingSection
              activeVariant={activeVariant}
              activeIndex={activeIndex}
              activeCalc={activeCalc}
              onUpdateVariant={onUpdateVariant}
            />

            {/* EMI & Down Payment Schedule (for EMI-enabled plans) */}
            <VariantEmiSection
              activeVariant={activeVariant}
              activeIndex={activeIndex}
              activeCalc={activeCalc}
              onUpdateVariant={onUpdateVariant}
            />

            {/* Deliverables & Features */}
            <VariantFeaturesSection
              activeVariant={activeVariant}
              activeIndex={activeIndex}
              variants={variants}
              onAddVariantFeature={onAddVariantFeature}
              onUpdateVariantFeature={onUpdateVariantFeature}
              onRemoveVariantFeature={onRemoveVariantFeature}
              onApplyVariantBulkFeatures={onApplyVariantBulkFeatures}
              onCopyFeatures={onCopyFeatures}
            />
          </div>
        </>
      )}
    </div>
  );
}
