import React from "react";

export default function MandateAlertBanner({
  pendingCount = 0,
  onActionClick,
}) {
  if (pendingCount <= 0) return null;

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50/60 p-3.5 sm:p-4.5 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/90 text-amber-950 shadow-2xs">
            <span className="material-symbols-outlined text-lg sm:text-xl">notifications_active</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-amber-950">
              Complete your E-Mandate setup
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed mt-0.5">
              You have{" "}
              <strong className="font-bold text-amber-950">
                {pendingCount} purchased plan{pendingCount > 1 ? "s" : ""}
              </strong>{" "}
              with verified down payment requiring E-Mandate authorization before activation. Complete setup below to activate recurring payments.
            </p>
          </div>
        </div>

        {onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            <span>Resolve Now</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
