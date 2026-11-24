import React, { useState } from "react";
import { Package, Search, ChevronRight } from "lucide-react";

export default function PlanPerformanceSection({ plans = [], loading = false }) {
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse h-48" />
    );
  }

  const filtered = (plans || []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.planTitle?.toLowerCase().includes(q) ||
      p.serviceTitle?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 font-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
            <Package size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Plan Performance Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">
              Historical revenue, units sold, and full vs EMI ratio per plan
            </p>
          </div>
        </div>

        {/* Plan Search Filter */}
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plan or service..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0f5c3e]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No plans match the search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-[#f7faf8] text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Plan / Service</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3">Full vs EMI</th>
                <th className="py-2.5 px-3">Active Subscriptions</th>
                <th className="py-2.5 px-3">Gross Revenue</th>
                <th className="py-2.5 px-3 text-right">Avg Revenue / Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const avg = item.unitsSold > 0 ? Math.round(item.grossRevenue / item.unitsSold) : 0;

                return (
                  <tr key={item.planId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm truncate max-w-[200px]" title={item.planTitle}>
                        {item.planTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {item.serviceTitle}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-extrabold text-slate-900 text-xs">
                      {item.unitsSold}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-blue-700">{item.fullPaymentCount} Full</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-purple-700">{item.emiCount} EMI</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f5c3e] bg-[#e8f5ee] px-2 py-0.5 rounded-full border border-[#d1fae5]">
                        {item.activeCount} active
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-extrabold text-[#0f5c3e] text-sm font-heading">
                      ₹{item.grossRevenue.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-700">
                      ₹{avg.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

