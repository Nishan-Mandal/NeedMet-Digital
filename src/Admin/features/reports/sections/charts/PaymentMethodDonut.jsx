import React from "react";
import { PieChart, CreditCard, Smartphone, Landmark, Banknote } from "lucide-react";

export default function PaymentMethodDonut({ rawPayments = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="h-44 bg-slate-100/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  // 1. Group by Payment Type (Full vs EMI Upfront vs EMI Recurring)
  const typeCounts = {
    FULL: { count: 0, amount: 0, label: "Full Payment", color: "#0f5c3e" },
    EMI_UPFRONT: { count: 0, amount: 0, label: "EMI Upfront", color: "#0d9488" },
    EMI_RECURRING: { count: 0, amount: 0, label: "EMI Recurring", color: "#8b5cf6" },
  };

  // 2. Group by Gateway Method (UPI vs Card vs Netbanking)
  const methodCounts = {
    upi: { count: 0, amount: 0, label: "UPI", icon: Smartphone },
    card: { count: 0, amount: 0, label: "Card", icon: CreditCard },
    netbanking: { count: 0, amount: 0, label: "NetBanking", icon: Landmark },
  };

  let totalSuccessAmount = 0;

  rawPayments.forEach((p) => {
    if (p.status !== "SUCCESS") return;
    const amt = Number(p.amount) || 0;
    totalSuccessAmount += amt;

    const t = p.paymentType || "FULL";
    if (typeCounts[t]) {
      typeCounts[t].count += 1;
      typeCounts[t].amount += amt;
    }

    const m = (p.method || "upi").toLowerCase();
    if (methodCounts[m]) {
      methodCounts[m].count += 1;
      methodCounts[m].amount += amt;
    } else {
      methodCounts.upi.count += 1;
      methodCounts.upi.amount += amt;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5 font-primary">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <PieChart size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Payment Methods & Channels
            </h3>
            <p className="text-[11px] text-slate-500">
              Distribution of cleared receipts by payment type and gateway instrument
            </p>
          </div>
        </div>
      </div>

      {/* Progress Split Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Channel Split</span>
          <span>₹{totalSuccessAmount.toLocaleString("en-IN")} total cleared</span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
          {Object.entries(typeCounts).map(([k, item]) => {
            const pct = totalSuccessAmount > 0 ? (item.amount / totalSuccessAmount) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={k}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-300"
                title={`${item.label}: ${Math.round(pct)}% (₹${item.amount.toLocaleString()})`}
              />
            );
          })}
        </div>
      </div>

      {/* Type Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {Object.entries(typeCounts).map(([k, item]) => {
          const pct = totalSuccessAmount > 0 ? Math.round((item.amount / totalSuccessAmount) * 100) : 0;
          return (
            <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
                <span className="text-[10px] text-slate-400 ml-auto">{pct}%</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 block font-heading">
                ₹{item.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {item.count} {item.count === 1 ? "receipt" : "receipts"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Method Split (UPI vs Card vs Netbanking) */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Gateway Instrument Split
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {Object.entries(methodCounts).map(([k, item]) => {
            const Icon = item.icon;
            const pct = totalSuccessAmount > 0 ? Math.round((item.amount / totalSuccessAmount) * 100) : 0;
            return (
              <div key={k} className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <Icon size={14} className="mx-auto text-slate-500 mb-1" />
                <span className="font-semibold text-slate-700 block text-xs">{item.label}</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {pct}% <span className="text-[10px] text-slate-400 font-normal">({item.count})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

