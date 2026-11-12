import React from "react";
import { CheckCircle2, Clock, XCircle, RotateCcw, CreditCard, ShieldCheck } from "lucide-react";

export default function SalesConversionSummary({ metrics = null, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  const counts = metrics?.counts || {};
  const rates = metrics?.rates || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-primary">
      {/* 1. Orders Fulfillment Health */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Order Lifecycle Pipeline</h3>
              <p className="text-[11px] text-slate-500">Distribution of customer checkout requests</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            {counts.totalOrders + counts.pendingOrders + counts.cancelledOrders} total
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block tracking-wider">
              Confirmed
            </span>
            <span className="text-base font-extrabold text-[#0f5c3e] mt-0.5 block">
              {counts.totalOrders || 0}
            </span>
            <span className="text-[10px] text-slate-400">Active / Done</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] text-amber-800 font-bold uppercase block tracking-wider">
              Pending
            </span>
            <span className="text-base font-extrabold text-amber-700 mt-0.5 block">
              {counts.pendingOrders || 0}
            </span>
            <span className="text-[10px] text-slate-400">Payment/Mandate</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[10px] text-rose-800 font-bold uppercase block tracking-wider">
              Cancelled
            </span>
            <span className="text-base font-extrabold text-rose-700 mt-0.5 block">
              {counts.cancelledOrders || 0}
            </span>
            <span className="text-[10px] text-slate-400">Abandoned / Exp</span>
          </div>
        </div>
      </div>

      {/* 2. Gateway Transaction Health */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <CreditCard size={16} />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Gateway Success Health</h3>
              <p className="text-[11px] text-slate-500">Razorpay API transaction fulfillment rate</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-0.5 rounded-full border border-[#d1fae5]">
              {rates.paymentSuccessRate ?? 100}% Success
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider flex items-center justify-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-600" /> Success
            </span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {counts.successfulPayments || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider flex items-center justify-center gap-1">
              <Clock size={10} className="text-amber-600" /> Pending
            </span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {counts.pendingPayments || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider flex items-center justify-center gap-1">
              <XCircle size={10} className="text-rose-600" /> Failed
            </span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {counts.failedPayments || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider flex items-center justify-center gap-1">
              <RotateCcw size={10} className="text-purple-600" /> Refund
            </span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {counts.refundedPayments || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

