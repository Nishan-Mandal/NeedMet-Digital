import React from "react";

export default function LocationPermissionModal({ isOpen, onClose, onRetry, errorMessage }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="text-center">
          {/* Icon Badge */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
            <span className="material-symbols-outlined text-3xl">
              location_on
            </span>
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900">
            Location Access Mandatory
          </h3>
          <p className="mb-4 text-xs text-gray-600 leading-relaxed">
            Taking your device location is <strong>strictly required</strong> to process an EMI upfront down payment for compliance and fraud prevention.
          </p>

          {/* Error / Instruction Box */}
          <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-left text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <span className="material-symbols-outlined text-base">info</span>
              <span>How to enable location:</span>
            </div>
            <p className="text-amber-800">
              {errorMessage || "Click the tune/padlock icon near your browser URL bar, set Location to 'Allow', and then retry."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="w-full rounded-xl bg-primary py-3 px-4 font-semibold text-white shadow-md transition hover:bg-primary-dark active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">my_location</span>
                <span>Allow Location & Retry</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-200 py-2.5 font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
