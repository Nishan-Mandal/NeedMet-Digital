import { ShieldAlert } from "lucide-react";

export default function CashCodeRevokeModal({
  isOpen = false,
  codeItem,
  onClose,
  onSubmit,
  reason,
  setReason,
  actionLoading = false,
}) {
  if (!isOpen || !codeItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f5c3e]/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200/60 shadow-2xs">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900">Revoke Cash Code</h2>
            <div className="text-xs text-red-600 font-mono font-bold">
              Code: {codeItem.code}
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs mb-4">
          Revoking this cash code immediately invalidates it and prevents any further redemption. This action is permanently logged.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Reason for Revocation *
            </label>
            <textarea
              required
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fraudulent activity, issued by error, merchant dispute"
              className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 shadow-2xs transition"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm hover:shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? "Revoking..." : "Confirm Revoke"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
