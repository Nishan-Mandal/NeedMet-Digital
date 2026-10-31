import { useState, useRef } from "react";

export default function PlanImageGallerySection({
  images = [],
  pendingFilesMap = {},
  uploadingMap = {},
  isUploadingImages = false,
  uploadErrorsMap = {},
  onRetryUpload,
  onFilesSelected,
  onRemoveImage,
  onSetPrimaryImage,
  onPreviewImage,
  imageErrorMap = {},
  onImageError,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const activeUploadCount = Object.keys(uploadingMap).length;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isUploadingImages) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploadingImages) return;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#266C51] text-base">
              perm_media
            </span>
            Service Media & Gallery
          </h2>
          <p className="text-[11px] text-gray-500">
            First image serves as the main storefront cover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeUploadCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Uploading {activeUploadCount} image{activeUploadCount > 1 ? "s" : ""}...
            </span>
          )}
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
            {images.length} {images.length === 1 ? "Image" : "Images"}
          </span>
        </div>
      </div>

      {/* Compact Dropzone with Active Upload State */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploadingImages && fileInputRef.current?.click()}
        className={`group flex items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-3 text-center transition-all ${
          isUploadingImages
            ? "border-emerald-400 bg-emerald-50/40 cursor-wait"
            : isDragging
            ? "border-[#266C51] bg-emerald-50/60 cursor-pointer"
            : "border-gray-300 bg-gray-50/50 hover:border-[#266C51] hover:bg-emerald-50/30 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isUploadingImages}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0 ${
            isUploadingImages
              ? "bg-emerald-100 text-[#266C51]"
              : "bg-emerald-50 text-[#266C51] group-hover:bg-emerald-100"
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isUploadingImages ? "animate-spin text-emerald-600" : ""
            }`}
          >
            {isUploadingImages ? "progress_activity" : "cloud_upload"}
          </span>
        </div>

        <div className="text-left text-xs">
          {isUploadingImages ? (
            <div>
              <span className="font-bold text-emerald-900">
                Uploading {activeUploadCount} file{activeUploadCount > 1 ? "s" : ""}...
              </span>
              <span className="text-[11px] text-emerald-700 block">
                Optimizing & storing securely to cloud storage
              </span>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-gray-800">
                Drag & drop images here, or{" "}
              </span>
              <span className="font-bold text-[#266C51] underline underline-offset-2">
                browse
              </span>
              <span className="text-[11px] text-gray-400 block sm:inline sm:ml-2">
                PNG, JPG, WebP up to 10MB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Flat Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 pt-1">
          {images.map((imgUrl, idx) => {
            const isPrimary = idx === 0;
            const hasError = imageErrorMap[imgUrl];
            const isBlob = imgUrl.startsWith("blob:");
            const isUploading = uploadingMap[imgUrl] !== undefined;
            const progress = uploadingMap[imgUrl] || 0;
            const uploadError = uploadErrorsMap[imgUrl];

            const displayName = isBlob
              ? pendingFilesMap[imgUrl]?.name || `Image ${idx + 1}`
              : imgUrl.split("/").pop()?.split("?")[0] || `Image ${idx + 1}`;

            return (
              <div
                key={`${imgUrl}-${idx}`}
                className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all ${
                  isUploading
                    ? "border-emerald-400 ring-2 ring-emerald-300/50 shadow-xs"
                    : uploadError
                    ? "border-red-400 ring-2 ring-red-300/40"
                    : isPrimary
                    ? "border-[#266C51] ring-2 ring-[#266C51]/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {/* Media Image */}
                {!hasError ? (
                  <img
                    src={imgUrl}
                    alt={`Media ${idx + 1}`}
                    onError={() => onImageError && onImageError(imgUrl)}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 bg-red-50 text-red-500">
                    <span className="material-symbols-outlined text-xl">
                      broken_image
                    </span>
                    <span className="text-[10px]">Failed</span>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 1. UPLOADING LOADER OVERLAY (Active state)                */}
                {/* ========================================================= */}
                {isUploading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[2px] p-2 text-white text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                      {progress > 0 && (
                        <span className="absolute text-[9px] font-bold text-emerald-200">
                          {progress}%
                        </span>
                      )}
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-emerald-100 tracking-wide">
                      Uploading...
                    </span>
                    {/* Linear Progress Bar */}
                    <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(12, progress)}%` }}
                      />
                    </div>
                    {/* Cancel action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveImage(idx);
                      }}
                      title="Cancel upload"
                      className="mt-1.5 text-[9px] text-gray-300 hover:text-white underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 2. UPLOAD ERROR OVERLAY (Retry / Remove options)          */}
                {/* ========================================================= */}
                {uploadError && !isUploading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-[2px] p-2 text-white text-center">
                    <span className="material-symbols-outlined text-red-300 text-lg">
                      warning
                    </span>
                    <span className="text-[10px] font-bold text-red-200 leading-tight">
                      Upload Failed
                    </span>
                    <div className="mt-2 flex items-center gap-1.5">
                      {onRetryUpload && pendingFilesMap[imgUrl] && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRetryUpload(imgUrl);
                          }}
                          className="rounded bg-white px-2 py-0.5 text-[9px] font-bold text-gray-900 shadow hover:bg-gray-100 cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveImage(idx);
                        }}
                        className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white shadow hover:bg-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 3. NORMAL STATE (Controls & Badges)                       */}
                {/* ========================================================= */}
                {!isUploading && !uploadError && (
                  <>
                    {/* Primary Cover Badge or "Make Cover" Button */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      {isPrimary ? (
                        <span className="flex items-center gap-1 rounded bg-[#266C51] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          <span className="material-symbols-outlined text-[10px]">
                            star
                          </span>
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSetPrimaryImage(idx);
                          }}
                          title="Set as main cover image"
                          className="flex items-center gap-1 rounded bg-black/60 hover:bg-[#266C51] px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[10px] text-amber-300">
                            star
                          </span>
                          Cover
                        </button>
                      )}
                    </div>

                    {/* Preview Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPreviewImage(imgUrl);
                      }}
                      title="Expand preview"
                      className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">
                        visibility
                      </span>
                    </button>

                    {/* Center Delete Button (Hover Overlay) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100 pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveImage(idx);
                        }}
                        title="Remove image"
                        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-transform duration-150 transform scale-75 group-hover:scale-100 hover:bg-red-700 hover:scale-105 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Bottom Filename / Display Label */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[9px] text-white font-medium truncate pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="truncate block" title={displayName}>
                        {displayName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
