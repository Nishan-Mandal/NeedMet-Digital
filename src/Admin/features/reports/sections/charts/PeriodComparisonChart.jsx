import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Repeat } from "lucide-react";

export default function PeriodComparisonChart({ metrics = null, rangeConfig = null, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="h-44 bg-slate-100/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  const fin = metrics?.financials || {};
  const counts = metrics?.counts || {};
  const growth = metrics?.growth || {};

  const items = [
    {
      title: "Gross Sales",
      current: `₹${(fin.grossSales || 0).toLocaleString("en-IN")}`,
      trend: growth.grossSales,
    },
    {
      title: "Net Revenue",
      current: `₹${(fin.netRevenue || 0).toLocaleString("en-IN")}`,
      trend: growth.netRevenue,
    },
    {
      title: "Cash Collected",
      current: `₹${(fin.collectedRevenue || 0).toLocaleString("en-IN")}`,
      trend: growth.collectedRevenue,
    },
    {
      title: "Total Orders",
      current: (counts.totalOrders || 0).toLocaleString("en-IN"),
      trend: growth.orders,
    },
    {
      title: "Average Order Value",
      current: `₹${(fin.averageOrderValue || 0).toLocaleString("en-IN")}`,
      trend: growth.aov,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3 font-primary">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <Repeat size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Period-over-Period Performance
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparison against the equivalent immediately preceding window
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          vs Prior Window
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {items.map((item, idx) => {
          const t = item.trend || { direction: "neutral", formatted: "0%" };
          const isUp = t.direction === "up";
          const isDown = t.direction === "down";

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1"
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                {item.title}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block font-heading">
                {item.current}
              </span>
              <div className="flex items-center gap-1 text-xs pt-0.5">
                <span
                  className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    isUp
                      ? "text-emerald-700 bg-emerald-100/70"
                      : isDown
                      ? "text-rose-700 bg-rose-100/70"
                      : "text-slate-600 bg-slate-200/70"
                  }`}
                >
                  {isUp && <ArrowUpRight size={11} />}
                  {isDown && <ArrowDownRight size={11} />}
                  {!isUp && !isDown && <Minus size={11} />}
                  {t.formatted}
                </span>
                <span className="text-[10px] text-slate-400">vs prev</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

