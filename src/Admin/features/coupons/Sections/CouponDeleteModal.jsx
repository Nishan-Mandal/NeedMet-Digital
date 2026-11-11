import { Trash2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { canDeleteCoupon, formatCouponDiscount } from "../../../utils/coupon.utils";

export default function CouponDeleteModal({
  isOpen = false,
  coupon,
  onClose,
  onConfirm,
  actionLoading = false,
}) {
  if (!isOpen || !coupon) return null;

  const isDeletable = canDeleteCoupon(coupon);
  const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5 text-red-600">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200/60 shadow-2xs">
              <Trash2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">
                Delete Coupon
              </h2>
              <span className="text-xs text-red-600 font-mono font-bold">{coupon.code}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isDeletable
              ? "Are you sure you want to delete this coupon? This action will permanently remove it from the system and cannot be undone."
              : "This coupon cannot be deleted because it has already been redeemed."}
          </p>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Coupon Code:</span>
              <span className="font-mono font-bold text-slate-800">{coupon.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Discount:</span>
              <span className="font-bold text-[#0f5c3e]">{formatCouponDiscount(coupon)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Redemptions:</span>
              <span className="font-semibold text-slate-800">
                {used} / {coupon.usageLimit || "∞"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="font-medium capitalize text-slate-700">{coupon.status || "active"}</span>
            </div>
          </div>

          {!isDeletable ? (
            <div className="flex items-start gap-2 text-[11px] text-red-700 bg-red-50 p-3 rounded-xl border border-red-200/60">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <span className="font-bold block">Deletion Restricted</span>
                <span>
                  Coupons that have been used at least once ({used} redemption{used > 1 ? "s" : ""}) cannot be deleted to preserve financial audit history. You can deactivate this coupon instead.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
              <AlertTriangle size={14} className="shrink-0" />
              <span>This coupon has 0 redemptions and is eligible for permanent removal.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={actionLoading || !isDeletable}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {actionLoading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

