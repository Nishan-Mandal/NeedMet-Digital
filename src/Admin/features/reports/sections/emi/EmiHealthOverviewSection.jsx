import React from "react";
import { ShieldCheck, AlertCircle, Clock, Calendar, CheckCircle2 } from "lucide-react";

export default function EmiHealthOverviewSection({ metrics = null, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse h-32" />
    );
  }

  const fin = metrics?.financials || {};
  const counts = metrics?.counts || {};
  const rates = metrics?.rates || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 font-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              EMI & Mandate Portfolio Health
            </h3>
            <p className="text-[11px] text-slate-500">
              Recurring subscription compliance, collection rates, and delinquency tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Mandate Auth Rate: {rates.mandateSuccessRate ?? 100}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* 1. Outstanding EMI */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Outstanding
          </span>
          <span className="text-base font-extrabold text-slate-900 block font-heading">
            ₹{(fin.outstandingEmi || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-400 block">Future scheduled cash flow</span>
        </div>

        {/* 2. Overdue Amount */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          fin.overdueEmi > 0 ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-100"
        }`}>
          <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block flex items-center gap-1">
            <AlertCircle size={11} className="text-rose-600" /> Overdue Delinquency
          </span>
          <span className="text-base font-extrabold text-rose-700 block font-heading">
            ₹{(fin.overdueEmi || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-rose-600 block">
            {counts.overdueInstallmentsCount || 0} cycles past due date
          </span>
        </div>

        {/* 3. Upcoming 30 Days */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Clock size={11} className="text-slate-500" /> Due in 30 Days
          </span>
          <span className="text-base font-extrabold text-[#0f5c3e] block font-heading">
            ₹{(counts.upcomingEmiAmount || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {counts.upcomingInstallmentsCount || 0} cycles scheduled
          </span>
        </div>

        {/* 4. Mandate Authorization */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-600" /> Active Mandates
          </span>
          <span className="text-base font-extrabold text-slate-900 block font-heading">
            {rates.mandateSuccessRate ?? 100}%
          </span>
          <span className="text-[10px] text-slate-400 block">Razorpay AutoPay active</span>
        </div>
      </div>
    </div>
  );
}

