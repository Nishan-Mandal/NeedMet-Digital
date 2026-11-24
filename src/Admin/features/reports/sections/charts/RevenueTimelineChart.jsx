import React, { useState } from "react";
import { TrendingUp, Info } from "lucide-react";

export default function RevenueTimelineChart({ buckets = [], loading = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="h-64 bg-slate-100/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!buckets || buckets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
        No sales data available for the selected period.
      </div>
    );
  }

  // Find max value across all buckets to compute relative bar/point heights
  const maxVal = Math.max(
    ...buckets.map((b) => Math.max(b.grossSales, b.cashCollected, b.netRevenue, 1000))
  );

  const activeBucket = hoveredIndex !== null ? buckets[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 font-primary">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Revenue & Cash Flow Timeline
            </h3>
            <p className="text-[11px] text-slate-500">
              Gross Bookings (contract value) vs Cash Collected (actual receipts)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#0f5c3e]" />
            <span className="text-slate-600 font-medium text-[11px]">Gross Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-500" />
            <span className="text-slate-600 font-medium text-[11px]">Cash Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-400" />
            <span className="text-slate-600 font-medium text-[11px]">Net Revenue</span>
          </div>
        </div>
      </div>

      {/* Active Hover Banner or Helper */}
      <div className="h-10 flex items-center justify-between px-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
        {activeBucket ? (
          <>
            <span className="font-bold text-slate-800">{activeBucket.label}</span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#0f5c3e] font-bold">
                Gross: ₹{activeBucket.grossSales.toLocaleString("en-IN")}
              </span>
              <span className="text-teal-700 font-bold">
                Collected: ₹{activeBucket.cashCollected.toLocaleString("en-IN")}
              </span>
              <span className="text-purple-700 font-bold">
                Net: ₹{activeBucket.netRevenue.toLocaleString("en-IN")}
              </span>
              <span className="text-slate-500">
                ({activeBucket.ordersCount} orders)
              </span>
            </div>
          </>
        ) : (
          <span className="text-slate-400 text-xs flex items-center gap-1.5">
            <Info size={13} />
            Hover over any bar to view exact revenue and order metrics for that interval
          </span>
        )}
      </div>

      {/* SVG / Bar Chart Representation */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[500px] h-48 flex items-end gap-1.5 sm:gap-2 pt-6 px-1">
          {buckets.map((b, idx) => {
            const grossHeight = Math.max(4, Math.round((b.grossSales / maxVal) * 100));
            const cashHeight = Math.max(4, Math.round((b.cashCollected / maxVal) * 100));
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={b.key}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all duration-150 rounded-lg p-1 ${
                  isHovered ? "bg-[#e8f5ee]/40" : "hover:bg-slate-50"
                }`}
              >
                {/* Dual Bars */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-36">
                  {/* Gross Sales Bar */}
                  <div
                    style={{ height: `${grossHeight}%` }}
                    className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                      isHovered ? "bg-[#0b462f]" : "bg-[#0f5c3e]"
                    }`}
                    title={`Gross: ₹${b.grossSales.toLocaleString()}`}
                  />
                  {/* Cash Collected Bar */}
                  <div
                    style={{ height: `${cashHeight}%` }}
                    className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                      isHovered ? "bg-teal-600" : "bg-teal-500"
                    }`}
                    title={`Cash: ₹${b.cashCollected.toLocaleString()}`}
                  />
                </div>

                {/* X-Axis Label */}
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[55px] mt-2 block">
                  {b.shortLabel || b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

