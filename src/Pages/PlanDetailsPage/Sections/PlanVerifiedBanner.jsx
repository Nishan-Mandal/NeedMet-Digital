import React from "react";

export default function PlanVerifiedBanner({ onDismiss }) {
  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-4 sm:p-5 shadow-xs text-left flex items-start justify-between gap-3 animate-in fade-in duration-300">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <span className="material-symbols-outlined text-2xl">verified</span>
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <h3 className="font-heading text-sm sm:text-base font-bold text-emerald-950">
            Service Plan Active & Execution Underway
          </h3>
          <p className="text-xs text-emerald-900/90 leading-relaxed">
            All required down payments and billing authorizations are verified. Your deliverables are actively managed by our specialists.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-emerald-600 hover:text-emerald-950 transition cursor-pointer shrink-0"
        aria-label="Dismiss banner"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

