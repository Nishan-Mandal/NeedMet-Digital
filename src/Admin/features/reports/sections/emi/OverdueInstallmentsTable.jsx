import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Calendar, ExternalLink, User } from "lucide-react";

export default function OverdueInstallmentsTable({ overdue = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse h-40" />
    );
  }

  const list = (overdue || []).slice(0, 10);
  const nowMs = Date.now();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3 font-primary">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Overdue Installments (Delinquency)
            </h3>
            <p className="text-[11px] text-slate-500">
              Installments whose scheduled due date has passed without successful debit confirmation
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          list.length > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200"
        }`}>
          {list.length} {list.length === 1 ? "delinquent cycle" : "delinquent cycles"}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Great job! Zero overdue installments recorded in the portfolio.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-[#f7faf8] text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Plan / Service</th>
                <th className="py-2.5 px-3">Cycle</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Delay</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item, idx) => {
                const daysLate = item.dueMs ? Math.max(1, Math.floor((nowMs - item.dueMs) / (1000 * 60 * 60 * 24))) : 1;

                return (
                  <tr key={`${item.purchaseId}-${item.cycleIndex}-${idx}`} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                          <User size={11} />
                        </div>
                        <span className="truncate max-w-[140px]" title={item.user?.userName || item.userName}>
                          {item.user?.userName || item.userName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800 truncate max-w-[160px]" title={item.planTitle}>
                        {item.planTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {item.serviceTitle}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-700">
                      Cycle #{item.cycleIndex}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        <span>
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Past Due"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        {daysLate} {daysLate === 1 ? "day late" : "days late"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-extrabold text-rose-700 font-heading">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/transactions?tab=purchases&search=${encodeURIComponent(item.purchaseId)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:underline"
                      >
                        <span>Inspect Order</span>
                        <ExternalLink size={10} />
                      </Link>
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

