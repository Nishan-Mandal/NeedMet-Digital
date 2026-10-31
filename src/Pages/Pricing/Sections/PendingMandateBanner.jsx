export default function PendingMandateBanner({
  onResume,
  isLoading = false,
}) {
  return (
    <div className="rounded-3xl border-2 border-emerald-500/80 bg-emerald-50 p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow-sm shrink-0">
          <span className="material-symbols-outlined text-2xl">verified</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-emerald-950">Down Payment Verified!</h3>
            <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
              Step 1 Complete
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-1 max-w-xl">
            Your upfront down payment is secured. Complete Step 2 by authorizing your monthly Auto-Pay recurring mandate to immediately activate your plan access.
          </p>
        </div>
      </div>
      <button
        onClick={onResume}
        disabled={isLoading}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 transition active:scale-95 disabled:opacity-75"
      >
        <span className="material-symbols-outlined text-lg">autorenew</span>
        Complete Auto-Pay Mandate Setup
      </button>
    </div>
  );
}
