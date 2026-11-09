export default function ClonePlanModal({
  service,
  onClose,
  onConfirm,
}) {
  if (!service) return null;

  const childPlansCount = (service.plans || service.variants || []).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 text-left border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] border border-[#d1fae5]/70 text-[#0f5c3e] shadow-2xs">
            <span className="material-symbols-outlined text-xl">content_copy</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Clone Plan?</h3>
            <p className="text-xs text-slate-500">Create a new plan starting from this configuration.</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          You are about to clone <strong className="text-slate-900 font-semibold">"{service.name}"</strong>
          {childPlansCount > 0 ? ` (${childPlansCount} duration ${childPlansCount === 1 ? "tier" : "tiers"})` : ""}.
          The plan creation form will be prefilled with all its settings. You can edit any field before saving it as a completely new plan without affecting the original.
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs hover:shadow-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f5c3e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md hover:bg-[#0c4a32] transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            <span>Confirm & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
