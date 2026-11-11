import { History, X } from "lucide-react";
import {
  getCashCodeStatus,
  getCashCodeStatusLabel,
  formatCashCodeDate,
} from "../../../utils/cashCode.utils";

export default function CashCodeAuditModal({
  codeItem,
  onClose,
}) {
  if (!codeItem) return null;

  const status = getCashCodeStatus(codeItem);
  const statusLabel = getCashCodeStatusLabel(codeItem);
  const amountNum = Number(codeItem.amount || 0);

  const createdAtFormatted = formatCashCodeDate(codeItem.createdAt, true);
  const expiresAtFormatted = formatCashCodeDate(codeItem.expiresAt, false);
  const usedAtFormatted = formatCashCodeDate(
    codeItem.usedAt || codeItem.useDate || codeItem.usedDate,
    true
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f5c3e]/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <History size={18} className="text-[#0f5c3e]" />
              Cash Code Details
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{codeItem.code}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Credit Amount:</span>
              <span className="text-lg font-bold text-[#0f5c3e]">₹{amountNum.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Current Status:</span>
              <span className="font-bold text-xs uppercase tracking-wide">
                {status === "revoked" ? (
                  <span className="text-red-600">Revoked</span>
                ) : status === "redeemed" ? (
                  <span className="text-sky-700">Redeemed</span>
                ) : status === "expired" ? (
                  <span className="text-amber-700">Expired</span>
                ) : status === "inactive" ? (
                  <span className="text-slate-500">Inactive</span>
                ) : (
                  <span className="text-emerald-700">Active</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Created By:</span>
              <span className="font-semibold text-slate-800">{codeItem.createdBy || "Admin User"}</span>
            </div>
            {codeItem.createdById && (
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Creator UID:</span>
                <span className="font-mono text-slate-700 truncate block font-medium" title={codeItem.createdById}>
                  {codeItem.createdById}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Issued At:</span>
              <span className="text-slate-800 font-medium">{createdAtFormatted}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Expires At:</span>
              <span className={status === "expired" ? "text-red-600 font-bold" : "text-slate-800 font-medium"}>
                {expiresAtFormatted}
              </span>
            </div>
            {codeItem.isUsed && (
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Used Date:</span>
                <span className="font-bold text-sky-800">{usedAtFormatted}</span>
              </div>
            )}
          </div>

          {/* Transaction References */}
          {(codeItem.purchaseId || codeItem.paymentId) && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Transaction References
              </span>
              {codeItem.purchaseId && (
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Purchase ID:</span>
                  <span className="text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-semibold shadow-2xs">
                    {codeItem.purchaseId}
                  </span>
                </div>
              )}
              {codeItem.paymentId && (
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-semibold shadow-2xs">
                    {codeItem.paymentId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Redemption Details */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-2">
              Redemption Details
            </span>
            {codeItem.isUsed ? (
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Redeemed By (Customer UID):</span>
                  <span className="font-mono font-bold text-slate-800">{codeItem.usedBy || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Used Date (Redeemed At):</span>
                  <span className="font-semibold text-slate-800">{usedAtFormatted}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">This cash code has not been redeemed yet.</p>
            )}
          </div>

          {/* Revocation Note if any */}
          {codeItem.revokeReason && (
            <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/60 text-red-700">
              <span className="font-bold text-[11px] uppercase tracking-wider block mb-1">
                Revocation Reason
              </span>
              <p>{codeItem.revokeReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
