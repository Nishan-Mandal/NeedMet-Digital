import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import usePlanForm from "./hooks/usePlanForm";

import PlanBasicDetailsSection from "./Sections/PlanBasicDetailsSection";
import PlanImageGallerySection from "./Sections/PlanImageGallerySection";
import PlanVariantsSection from "./Sections/PlanVariantsSection";
import PlanDatesNotesSection from "./Sections/PlanDatesNotesSection";
import ImagePreviewModal from "./Sections/ImagePreviewModal";

export default function PlanForm() {
  const { planId } = useParams();
  const isEditMode = Boolean(planId);
  const { currentUser, isAdmin, isStaff, authLoading } = useAuth();
  const navigate = useNavigate();

  // Security guard: redirect if not admin/staff
  useEffect(() => {
    if (!authLoading && (!currentUser || (!isAdmin && !isStaff))) {
      navigate("/login?redirect=/admin/plans");
    }
  }, [currentUser, isAdmin, isStaff, authLoading, navigate]);

  const {
    formData,
    setFormData,
    loading,
    submitting,
    error,
    setError,
    imageErrorMap,
    previewModalUrl,
    pendingFilesMap,
    uploadingMap,
    isUploadingImages,
    uploadErrorsMap,
    handleRetryUpload,
    handleFilesSelected,
    setImageErrorMap,
    setPreviewModalUrl,
    handleChange,
    handleSetPrimaryImage,
    handleAddImage,
    handleRemoveImage,
    creatorInfo,
    variantCalculations,
    // Duration Variants API
    handleAddCustomVariant,
    handleDuplicateVariant,
    handleAddPresetVariant,
    setSelectedVariantIndex,
    handleAddVariantFeature,
    handleUpdateVariantFeature,
    handleUpdateVariant,
    handleRemoveVariant,
    handleCopyFeatures,
    handleSubmit,
    handleApplyVariantBulkFeatures,
    handleRemoveVariantFeature,
  } = usePlanForm({ planId, isEditMode, currentUser, navigate });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#266C51] border-t-transparent" />
          <p className="text-xs font-semibold text-text-secondary">
            Loading service data...
          </p>
        </div>
      </div>
    );
  }

  const durationPlanCount = (formData.plans || formData.variants || []).length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 text-left">
      <div className="mx-auto max-w-6xl space-y-3.5 sm:space-y-4">

        {/* COMPACT TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
          <div className="space-y-1">
            <Link
              to="/admin/plans"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Services
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {isEditMode ? "Edit Service & Plans" : "Create New Service"}
              </h1>
              {(formData.badge || formData.tag) && (
                <span className="rounded-md bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                  {formData.badge || formData.tag}
                </span>
              )}
              <span className="rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.2 text-[10px] font-bold">
                {durationPlanCount} Duration Plan{durationPlanCount === 1 ? "" : "s"}
              </span>
              <span
                className={`rounded-md px-2 py-0.2 text-[10px] font-bold ${
                  formData.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    : "bg-amber-50 text-amber-700 border border-amber-200/80"
                }`}
              >
                {formData.isActive ? "Storefront Active" : "Draft / Inactive"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Configure service details, duration tiers (1M, 3M, 6M, etc.), EMI schedules, and deliverables.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 border border-red-200 text-xs font-semibold text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-red-600">error</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* 1. Identity (Col 3) + Availability (Col 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
            <div className="lg:col-span-3">
              <PlanBasicDetailsSection
                formData={formData}
                onChange={handleChange}
                onTagSelect={(badge) => setFormData((p) => ({ ...p, badge, tag: badge }))}
              />
            </div>
            <div className="lg:col-span-2">
              <PlanDatesNotesSection
                formData={formData}
                creatorInfo={creatorInfo}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 2. Media & Image Gallery */}
          <PlanImageGallerySection
            images={formData.images}
            pendingFilesMap={pendingFilesMap}
            uploadingMap={uploadingMap}
            isUploadingImages={isUploadingImages}
            uploadErrorsMap={uploadErrorsMap}
            onRetryUpload={handleRetryUpload}
            onFilesSelected={handleFilesSelected}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            onSetPrimaryImage={handleSetPrimaryImage}
            onPreviewImage={setPreviewModalUrl}
            imageErrorMap={imageErrorMap}
            onImageError={(imgUrl) =>
              setImageErrorMap((p) => ({ ...p, [imgUrl]: true }))
            }
          />

          {/* 3. Duration Plans & Deliverables */}
          <PlanVariantsSection
            variants={formData.plans || formData.variants || []}
            selectedVariantIndex={formData.selectedVariantIndex}
            onSelectVariantIndex={setSelectedVariantIndex}
            onAddPresetVariant={handleAddPresetVariant}
            onAddCustomVariant={handleAddCustomVariant}
            onDuplicateVariant={handleDuplicateVariant}
            onRemoveVariant={handleRemoveVariant}
            onUpdateVariant={handleUpdateVariant}
            variantCalculations={variantCalculations}
            onAddVariantFeature={handleAddVariantFeature}
            onUpdateVariantFeature={handleUpdateVariantFeature}
            onRemoveVariantFeature={handleRemoveVariantFeature}
            onApplyVariantBulkFeatures={handleApplyVariantBulkFeatures}
            onCopyFeatures={handleCopyFeatures}
          />

          {/* Compact Bottom Actions Bar */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-200/60 pt-3 pb-6">
            <Link
              to="/admin/plans"
              className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || isUploadingImages}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#266C51] px-5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1f5741] transition disabled:opacity-50 cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-base ${
                  submitting || isUploadingImages ? "animate-spin" : ""
                }`}
              >
                {submitting || isUploadingImages ? "progress_activity" : "save"}
              </span>
              {submitting
                ? "Saving Service..."
                : isUploadingImages
                ? "Uploading Images..."
                : isEditMode
                ? "Update Service & Plans"
                : "Publish Service & Plans"}
            </button>
          </div>
        </form>

        {/* LIGHTBOX IMAGE PREVIEW MODAL (for image gallery clicks) */}
        <ImagePreviewModal
          url={previewModalUrl}
          onClose={() => setPreviewModalUrl(null)}
        />

      </div>
    </div>
  );
}
