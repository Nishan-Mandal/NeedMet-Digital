import { Tag, X, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import {
  getCouponStatus,
  getCouponStatusBadge,
  formatCouponDiscount,
  formatCouponDate,
  getCouponDaysRemaining,
} from "../../../utils/coupon.utils";

export default function CouponDetailsModal({
  coupon,
  onClose,
}) {
  if (!coupon) return null;

  const status = getCouponStatus(coupon);
  const badge = getCouponStatusBadge(coupon);
  const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);
  const limit = Number(coupon.usageLimit ?? 100);
  const percentUsed = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const daysRemaining = getCouponDaysRemaining(coupon);

  const createdAtFormatted = formatCouponDate(coupon.createdAt, true);
  const updatedAtFormatted = formatCouponDate(coupon.updatedAt, true);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f5c3e]/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Tag size={18} className="text-[#0f5c3e]" />
              Coupon Details
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{coupon.code}</div>
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
              <span className="text-slate-500 block text-[11px] font-medium">Discount:</span>
              <span className="text-lg font-bold text-[#0f5c3e] font-heading">
                {formatCouponDiscount(coupon)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Operational Status:</span>
              <span className={`inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wide px-2 py-0.5 rounded-full border shadow-2xs ${badge.bg} ${badge.text} ${badge.border} mt-0.5`}>
                {badge.label}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Discount Type:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {coupon.discountType === "fixed" ? "Fixed Flat (₹)" : "Percentage (%)"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Admin Status:</span>
              <span className="font-semibold capitalize text-slate-800">
                {coupon.status || "active"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Min Order Amount:</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Max Discount Cap:</span>
              <span className="font-semibold text-slate-800">
                {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
                  ? `₹${Number(coupon.maxDiscountAmount).toLocaleString("en-IN")}`
                  : "No Cap (Unlimited)"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Expiration Date:</span>
              <span className="text-slate-800 font-semibold">
                {coupon.expiresAt ? formatCouponDate(coupon.expiresAt, false) : "No Expiry"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Validity Countdown:</span>
              {status === "expired" ? (
                <span className="text-red-600 font-bold">Expired</span>
              ) : daysRemaining !== null && daysRemaining <= 1 ? (
                <span className="text-amber-700 font-bold">Expires today</span>
              ) : daysRemaining !== null ? (
                <span className="text-[#0f5c3e] font-bold">Expires in {daysRemaining} days</span>
              ) : (
                <span className="text-slate-600 font-semibold">Never expires</span>
              )}
            </div>
          </div>

          {/* Usage & Redemptions Progress */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Usage & Redemptions
              </span>
              <span className="font-mono font-bold text-slate-800">
                {used} / {limit} ({percentUsed}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentUsed >= 100
                    ? "bg-purple-600"
                    : percentUsed >= 80
                    ? "bg-amber-500"
                    : "bg-[#0f5c3e]"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>{limit - used > 0 ? `${limit - used} redemptions left` : "Limit reached"}</span>
              <span>Total capacity: {limit}</span>
            </div>
          </div>

          {/* Audit Timestamps */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-1.5 text-slate-700">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-1">
              Audit Information
            </span>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Created At:</span>
              <span className="font-medium text-slate-800">{createdAtFormatted}</span>
            </div>
            {coupon.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Updated:</span>
                <span className="font-medium text-slate-800">{updatedAtFormatted}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Deletion Status:</span>
              <span className={used === 0 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                {used === 0 ? "Eligible for deletion (0 redemptions)" : "Locked against deletion (in use)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

