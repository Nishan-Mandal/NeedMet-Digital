import { Tag, X, Percent, IndianRupee, Calendar, Hash } from "lucide-react";

export default function CouponFormModal({
  isOpen = false,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingCoupon = null,
  actionLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f5c3e]/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] border border-[#d1fae5]/70 flex items-center justify-center text-[#0f5c3e] shadow-2xs">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              {editingCoupon && (
                <span className="text-xs text-[#0f5c3e] font-mono font-bold">
                  {editingCoupon.code}
                </span>
              )}
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

        <form onSubmit={onSubmit} className="space-y-4">
          {/* 1. Coupon Code */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WELCOME50, DIWALI2026"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                })
              }
              className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-4 py-2 text-sm text-[#0f5c3e] font-mono uppercase tracking-wider font-bold focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
            />
          </div>

          {/* 2. Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs cursor-pointer transition"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.discountValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
                  placeholder={formData.discountType === "percentage" ? "10" : "500"}
                />
                <div className="absolute left-2.5 top-2.5 text-slate-600">
                  {formData.discountType === "percentage" ? (
                    <Percent size={15} />
                  ) : (
                    <IndianRupee size={15} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Min Order Amount & Max Discount Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
                placeholder="0 for none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscountAmount ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscountAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
                placeholder="0 for no cap"
              />
            </div>
          </div>

          {/* 4. Usage Limit & Expiration Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Max Redemptions <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
                  placeholder="100"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-600">
                  <Hash size={15} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Expiration Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.expiresAt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-600">
                  <Calendar size={15} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Status Toggle (when editing) */}
          {editingCoupon && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Lifecycle Status
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs cursor-pointer transition"
              >
                <option value="active">Active (Available for customer use)</option>
                <option value="inactive">Inactive (Temporarily disabled)</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white text-sm font-bold shadow-sm hover:shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading
                ? "Saving..."
                : editingCoupon
                ? "Save Changes"
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
