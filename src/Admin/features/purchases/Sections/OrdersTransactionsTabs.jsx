import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, CreditCard, CalendarClock } from "lucide-react";

export default function OrdersTransactionsTabs({ active = "purchases", metrics = {} }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || active;

  const isPurchases = currentTab === "purchases" || currentTab === "orders";
  const isPayments = currentTab === "payments" || currentTab === "transactions";
  const isUpcomingEmi = currentTab === "upcoming-emi" || currentTab === "emi";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none py-0.5">
        {/* Tab 1: Purchases */}
        <Link
          to="/admin/transactions?tab=purchases"
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            isPurchases
              ? "bg-white text-[#0f5c3e] shadow-xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <ShoppingBag
            size={16}
            className={isPurchases ? "text-[#0f5c3e]" : "text-slate-400"}
          />
          <span>Purchase</span>
          {metrics.totalPurchases !== undefined && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isPurchases
                  ? "bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]"
                  : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {metrics.totalPurchases}
            </span>
          )}
        </Link>

        {/* Tab 2: Payments */}
        <Link
          to="/admin/transactions?tab=payments"
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            isPayments
              ? "bg-white text-[#0f5c3e] shadow-xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <CreditCard size={16} className={isPayments ? "text-[#0f5c3e]" : "text-slate-400"} />
          <span>Payments</span>
          {metrics.totalTransactions !== undefined && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isPayments ? "bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]" : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {metrics.totalTransactions}
            </span>
          )}
        </Link>

        {/* Tab 3: Upcoming EMI Payments */}
        <Link
          to="/admin/transactions?tab=upcoming-emi"
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            isUpcomingEmi
              ? "bg-white text-[#0f5c3e] shadow-xs border border-slate-200/60 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <CalendarClock size={16} className={isUpcomingEmi ? "text-[#0f5c3e]" : "text-slate-400"} />
          <span>Upcoming EMI payments</span>
          {metrics.totalUpcomingEmi !== undefined && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isUpcomingEmi ? "bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]" : "bg-slate-200/60 text-slate-600"
              }`}
            >
              {metrics.totalUpcomingEmi}
            </span>
          )}
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 text-xs text-slate-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Firestore Financial Ledger</span>
      </div>
    </div>
  );
}
