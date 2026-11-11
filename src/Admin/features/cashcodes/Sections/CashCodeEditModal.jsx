import { useState, useEffect } from "react";
import { Coins, X, Calendar, Hash } from "lucide-react";
import { getDaysRemaining } from "../../../utils/cashCode.utils";

export default function CashCodeEditModal({
  isOpen = false,
  codeItem,
  onClose,
  onSubmit,
  actionLoading = false,
}) {
  const [formData, setFormData] = useState({
    code: "",
    amount: 500,
    validityDays: 30,
  });

  useEffect(() => {
    if (codeItem) {
      const days = getDaysRemaining(codeItem);
      setFormData({
        code: codeItem.code || "",
        amount: Number(codeItem.amount || 0),
        validityDays: days && days > 0 ? days : 30,
      });
    }
  }, [codeItem]);

  if (!isOpen || !codeItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      code: formData.code.toUpperCase().trim(),
      amount: Number(formData.amount),
      validityDays: parseInt(formData.validityDays, 10),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f5c3e]/20 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] border border-[#d1fae5]/70 flex items-center justify-center text-[#0f5c3e] shadow-2xs">
              <Coins size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">
                Edit Cash Code
              </h2>
              <span className="text-xs text-slate-500 font-mono font-semibold">{codeItem.code}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Hash size={13} className="text-[#0f5c3e]" />
              Cash Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase().trim() })
              }
              className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-4 py-2.5 text-base text-[#0f5c3e] font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
            />
          </div>

          {/* Amount & Validity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Coins size={13} className="text-[#0f5c3e]" />
                  Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#0f5c3e]" />
                  Validity (Days) *
                </span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.validityDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validityDays: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full bg-[#f8faf9] border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 focus:bg-white shadow-2xs transition"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white text-sm font-bold shadow-sm hover:shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

