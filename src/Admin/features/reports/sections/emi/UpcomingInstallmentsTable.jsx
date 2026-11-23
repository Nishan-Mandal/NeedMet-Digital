import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, ExternalLink, User } from "lucide-react";

export default function UpcomingInstallmentsTable({ upcoming = [], onInspectOrder, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse h-40" />
    );
  }

  const list = (upcoming || []).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3 font-primary">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Clock size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Upcoming Installments
            </h3>
            <p className="text-[11px] text-slate-500">
              Scheduled AutoPay debit cycles due next
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {list.length} {list.length === 1 ? "installment" : "installments"}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No upcoming installments scheduled for this window.
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
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item, idx) => (
                <tr key={`${item.purchaseId}-${item.cycleIndex}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
                        <User size={11} />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate max-w-[140px] block leading-tight" title={item.user?.userName || item.userName}>
                          {item.user?.userName || item.userName}
                        </span>
                        {(item.user?.phone || item.customerPhone || item.phone) ? (
                          <a
                            href={`tel:${item.user?.phone || item.customerPhone || item.phone}`}
                            className="text-[10px] text-slate-500 hover:text-[#0f5c3e] font-normal block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.user?.phone || item.customerPhone || item.phone}
                          </a>
                        ) : null}
                      </div>
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
                          : "Scheduled"}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-extrabold text-[#0f5c3e] font-heading">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/transactions?tab=purchases&search=${encodeURIComponent(item.purchaseId)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f5c3e] hover:underline"
                    >
                      <span>View Order</span>
                      <ExternalLink size={10} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

