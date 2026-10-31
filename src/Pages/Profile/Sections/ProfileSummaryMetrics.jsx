import React, { useMemo } from "react";
import {
  isPurchaseActive,
  isPurchasePendingMandate,
} from "../utils/profile.utils";

export default function ProfileSummaryMetrics({
  purchases = [],
  activeFilter = "all",
  onSelectFilter,
}) {
  const activeCount = useMemo(
    () => purchases.filter(isPurchaseActive).length,
    [purchases]
  );
  const pendingMandateCount = useMemo(
    () => purchases.filter(isPurchasePendingMandate).length,
    [purchases]
  );
  const metrics = [
    {
      id: "all",
      label: "Total Plans",
      count: purchases.length,
      icon: "inventory_2",
      iconColor: "text-gray-400",
      labelColor: "text-text-secondary",
      valueColor: "text-gray-900",
      activeClass: "bg-primary/5 border-primary ring-1 ring-primary/30 shadow-2xs",
    },
    {
      id: "active",
      label: "Active Plans",
      count: activeCount,
      icon: "verified",
      iconColor: "text-emerald-600",
      labelColor: "text-emerald-800",
      valueColor: "text-emerald-700",
      activeClass: "bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500/30 shadow-2xs",
     
    },
    {
      id: "pending_mandate",
      label: "Action Required",
      count: pendingMandateCount,
      icon: "pending_actions",
      iconColor: pendingMandateCount > 0 ? "text-amber-700" : "text-gray-400",
      labelColor: pendingMandateCount > 0 ? "text-amber-900" : "text-text-secondary",
      valueColor: pendingMandateCount > 0 ? "text-amber-900" : "text-gray-900",
      activeClass:
        pendingMandateCount > 0
          ? "bg-amber-100/60 border-amber-500 ring-1 ring-amber-500/30 shadow-2xs"
          : "bg-gray-100 border-gray-400",
      idleClass:
        pendingMandateCount > 0
          ? "bg-amber-50/70 border-amber-300 hover:bg-amber-50"
          : "bg-white border-border/50 hover:border-gray-300",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {metrics.map((metric) => {
        const isSelected = activeFilter === metric.id;
        const cardBgBorder = isSelected
          ? metric.activeClass
          : metric.idleClass || "bg-white border-border/50 hover:border-gray-300";

        return (
          <button
            key={metric.id}
            type="button"
            onClick={() => onSelectFilter(metric.id)}
            className={`rounded-xl border p-2.5 sm:p-3 md:p-3.5 text-left transition-all cursor-pointer ${cardBgBorder}`}
          >
            {/* Layout: stacked on mobile (<md), inline on desktop (md+) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2">
              <div className="flex items-center justify-between md:justify-start gap-1.5 sm:gap-2 min-w-0">
                <span className={`material-symbols-outlined text-base sm:text-lg shrink-0 ${metric.iconColor}`}>
                  {metric.icon}
                </span>
                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate hidden md:inline ${metric.labelColor}`}>
                  {metric.label}
                </span>
                {/* Mobile: count shown on top right row */}
                <div className="flex items-center gap-1 md:hidden shrink-0">
                  <p className={`text-base font-bold ${metric.valueColor}`}>
                    {metric.count}
                  </p>
                  {metric.hasPulse && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Mobile: label shown clearly on second line */}
              <span className={`text-[10px] xs:text-[11px] font-bold uppercase tracking-wider line-clamp-1 md:hidden ${metric.labelColor}`}>
                {metric.label}
              </span>

              {/* Desktop: count shown on right */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <p className={`text-lg sm:text-xl font-bold ${metric.valueColor}`}>
                  {metric.count}
                </p>
                {metric.hasPulse && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
