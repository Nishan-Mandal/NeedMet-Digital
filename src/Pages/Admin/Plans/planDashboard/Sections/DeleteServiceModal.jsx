export default function DeleteServiceModal({
  service,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!service) return null;

  const childPlansCount = (service.plans || service.variants || []).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        className="relative max-w-md w-full rounded-2xl bg-white p-5 shadow-2xl space-y-4 text-left border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-xl">delete_forever</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Service?</h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <strong className="text-gray-900 font-semibold">"{service.name}"</strong>?
          All associated duration plans ({childPlansCount} {childPlansCount === 1 ? "tier" : "tiers"}) will be removed from both the storefront and admin catalog.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {isDeleting ? "progress_activity" : "delete"}
            </span>
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

