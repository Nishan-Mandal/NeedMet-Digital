import React from "react";
import {
  VariantHeader,
  VariantTabs,
  VariantIdentitySection,
  VariantPricingSection,
  VariantEmiSection,
  VariantFeaturesSection,
} from "./Variants";

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
    <div className="rounded-xl border border-gray-200/70 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3 text-left">
      {/* 1. Section Header & Quick Tier Presets */}
      <VariantHeader
        variantsCount={variants.length}
        onAddPresetVariant={onAddPresetVariant}
        onAddCustomVariant={onAddCustomVariant}
      />

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
    </div>
  );
}
