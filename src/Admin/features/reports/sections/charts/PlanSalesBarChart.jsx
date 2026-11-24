import React from "react";
import { Award, Package } from "lucide-react";

export default function PlanSalesBarChart({ plans = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="h-44 bg-slate-100/60 rounded-xl animate-pulse" />
      </div>
    );
  }

  const topPlans = (plans || []).slice(0, 5);
  const maxRevenue = Math.max(...topPlans.map((p) => p.grossRevenue), 1000);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5 font-primary">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <Award size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Top Selling Plans
            </h3>
            <p className="text-[11px] text-slate-500">
              Ranked by total gross booking volume in the selected window
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Top {topPlans.length} Plans
        </span>
      </div>

      {topPlans.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No plan sales recorded in this period.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {topPlans.map((plan, idx) => {
            const widthPct = Math.max(5, Math.round((plan.grossRevenue / maxRevenue) * 100));

            return (
              <div key={plan.planId || idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[240px]">
                    <span className="font-bold text-[#0f5c3e] bg-[#e8f5ee] px-1.5 py-0.2 rounded text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate" title={plan.planTitle}>
                      {plan.planTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                      ({plan.serviceTitle})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900 font-heading">
                      ₹{plan.grossRevenue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({plan.unitsSold} {plan.unitsSold === 1 ? "sale" : "sales"})
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="h-full bg-[#0f5c3e] rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

