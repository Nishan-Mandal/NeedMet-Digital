import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, ExternalLink, User, Copy, Check } from "lucide-react";

export default function TopCustomersSalesSection({ customers = [], loading = false }) {
  const [search, setSearch] = useState("");
  const [copiedUid, setCopiedUid] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse h-48" />
    );
  }

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUid(text);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const filtered = (customers || []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (c.user?.userName || c.userName || "").toLowerCase();
    const uid = (c.user?.userId || c.userId || "").toLowerCase();
    const phone = (c.user?.phone || c.phone || "").toLowerCase();
    return name.includes(q) || uid.includes(q) || phone.includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 font-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Customer Purchasing Intelligence
            </h3>
            <p className="text-[11px] text-slate-500">
              Customer lifetime value (LTV), repeat buyers, and outstanding commitments
            </p>
          </div>
        </div>

        {/* Customer Search */}
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or UID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0f5c3e]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No customer records found matching the search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-[#f7faf8] text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">UID</th>
                <th className="py-2.5 px-3">Buyer Status</th>
                <th className="py-2.5 px-3">Purchases</th>
                <th className="py-2.5 px-3">Total Spent (LTV)</th>
                <th className="py-2.5 px-3">Outstanding EMI</th>
                <th className="py-2.5 px-3">Last Purchase</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 15).map((c, idx) => (
                <tr key={c.userId || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
                        <User size={13} />
                      </div>
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[140px]" title={c.user?.userName || c.userName}>
                        {c.user?.userName || c.userName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 max-w-[120px] truncate" title={c.user?.userId || c.userId}>
                        {c.user?.userId || c.userId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.user?.userId || c.userId)}
                        className="p-1 text-slate-400 hover:text-[#0f5c3e] rounded"
                        title="Copy UID"
                      >
                        {copiedUid === c.userId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {c.isRepeatCustomer ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Repeat Buyer
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        New Buyer
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-800 text-xs">
                    {c.confirmedPurchases}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-extrabold text-[#0f5c3e] text-sm font-heading">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {c.outstandingAmount > 0 ? (
                      <span className="font-bold text-amber-700 font-mono text-xs">
                        ₹{c.outstandingAmount.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">₹0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-xs">
                    {c.lastPurchaseDate
                      ? new Date(c.lastPurchaseDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/transactions?tab=purchases&search=${encodeURIComponent(c.userId)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f5c3e] hover:underline"
                    >
                      <span>Orders</span>
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

