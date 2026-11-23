import React from "react";
import { ShoppingBag, CreditCard, CalendarClock } from "lucide-react";

/**
 * Top navigation tabs component for the unified Transactions page.
 * Allows switching between Purchases, Payments, and Upcoming EMI Payments.
 */
export default function TransactionsNavTabs({
  activeTab = "purchases",
  onTabChange = () => {},
  counts = {},
}) {
  const tabs = [
    {
      id: "purchases",
      label: "Purchase",
      pluralLabel: "Purchases",
      icon: ShoppingBag,
      count: counts.purchases,
      description: "Customer orders & plan subscriptions",
    },
    {
      id: "payments",
      label: "Payments",
      pluralLabel: "Payments",
      icon: CreditCard,
      count: counts.payments,
      description: "Gateway charges & settlements",
    },
    {
      id: "upcoming-emi",
      label: "Upcoming EMI's",
      pluralLabel: "Upcoming EMI's",
      icon: CalendarClock,
      count: counts.upcomingEmi,
      description: "AutoPay cycles & scheduled debits",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-1 bg-slate-100/90 rounded-xl sm:rounded-2xl border border-slate-200/80 mb-3.5 sm:mb-6 font-primary select-none">
      <div
        className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none py-0.5"
        role="tablist"
        aria-label="Transactions View Selector"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-[#0f5c3e] shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <TabIcon
                size={15}
                className={isActive ? "text-[#0f5c3e]" : "text-slate-400"}
              />
              <span>{tab.label}</span>

              {tab.count !== undefined && tab.count !== null && (
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.2 rounded-full font-bold transition-colors ${
                    isActive
                      ? "bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
