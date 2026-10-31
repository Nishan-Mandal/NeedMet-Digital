import React from "react";

export default function MandateActionAlert({
  upfrontPaid,
  totalCycles,
  emiAmount,
  checkoutLoading,
  onResumeMandate,
}) {
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/95 p-4 sm:p-5 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-950 shadow-2xs">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-heading text-sm sm:text-base font-bold text-amber-950">
              Down Payment Received • E-Mandate Setup Required
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed max-w-xl">
              Your down payment of{" "}
              <strong className="font-heading">
                ₹{Number(upfrontPaid || 0).toLocaleString("en-IN")}
              </strong>{" "}
              is verified. Please authorize your E-Mandate to activate ongoing service deliverables and schedule recurring installment payments ({totalCycles} cycles of ₹{Number(emiAmount || 0).toLocaleString("en-IN")}/mo).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResumeMandate}
          disabled={checkoutLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F5C3E] hover:bg-[#157a53] px-5 py-2.5 font-heading text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition cursor-pointer disabled:opacity-60 shrink-0"
        >
          <span className="material-symbols-outlined text-base">
            {checkoutLoading ? "progress_activity" : "verified_user"}
          </span>
          {checkoutLoading ? "Preparing Gateway..." : "Complete E-Mandate Setup"}
        </button>
      </div>
    </div>
  );
}

