import React from "react";
import { Clock } from "lucide-react";

/**
 * Reusable Transactions Table Component for NeedMet Admin.
 *
 * Provides consistent styling across Purchases, Payments, and Upcoming EMI tabs:
 * - Signature #0f5c3e emerald header
 * - Rounded-2xl card container with subtle shadow & hover transition
 * - Desktop table with sticky responsive columns and row hover
 * - Mobile card view (< lg)
 * - Cohesive loading and empty states
 */
export default function TransactionsTable({
  columns = [],
  data = [],
  loading = false,
  loadingMessage = "Loading records from database...",
  emptyTitle = "No records found",
  emptyDescription = "No data matched the current query or filter.",
  emptyIcon: EmptyIcon = Clock,
  toolbar = null,
  renderRow = null,
  renderMobileCard = null,
  keyExtractor = (item, index) => item.id || index,
  groupDividers = null, // Array of { id, label, count, totalVolume, items, ... }
  renderGroupDivider = null,
  onRowClick = null,
}) {
  // ── 1. Loading State ──
  if (loading) {
    return (
      <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/60 shadow-xs text-slate-400 text-sm animate-pulse font-primary">
        <div className="inline-block w-8 h-8 border-2 border-[#0f5c3e] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-semibold text-slate-700">{loadingMessage}</p>
      </div>
    );
  }

  // ── 2. Empty State ──
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-12 text-center font-primary">
        <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] text-[#0f5c3e] border border-[#d1fae5]/70 mx-auto flex items-center justify-center mb-4">
          <EmptyIcon size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-primary select-none">
      {/* ── Toolbar Slot (Showing count, actions, expand/collapse, toggles) ── */}
      {toolbar && (
        <div className="px-1">{toolbar}</div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP VIEW (>= lg): Full Emerald Table Layout ──────── */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-sm transition-shadow duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 border-collapse">
            <thead className="bg-[#0f5c3e] text-[11px] font-bold uppercase tracking-wider text-white border-b border-[#0f5c3e]">
              <tr>
                {columns.map((col, idx) => {
                  const alignClass =
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left";

                  return (
                    <th
                      key={col.key || idx}
                      className={`px-4 py-3.5 text-white whitespace-nowrap font-bold tracking-wider ${alignClass} ${col.headerClassName || ""}`}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Option A: Grouped Rows by Period/Category */}
              {groupDividers && Array.isArray(groupDividers) ? (
                groupDividers.map((group) => (
                  <React.Fragment key={group.id}>
                    {/* Group Banner Divider */}
                    {renderGroupDivider ? (
                      renderGroupDivider(group, columns.length)
                    ) : (
                      <tr className="bg-slate-50/90 border-y border-slate-200/70 select-none">
                        <td colSpan={columns.length} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#0f5c3e]" />
                              <span className="font-bold text-slate-800 text-xs tracking-tight">
                                {group.label}
                              </span>
                              {group.count !== undefined && (
                                <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                                  {group.count}
                                </span>
                              )}
                            </div>
                            {group.totalVolume !== undefined && (
                              <span className="font-bold text-xs text-[#0f5c3e] font-heading">
                                Total: ₹{group.totalVolume.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Group Items */}
                    {(group.items || []).map((row, rowIdx) => {
                      if (renderRow) {
                        return renderRow(row, rowIdx, group);
                      }

                      return (
                        <tr
                          key={keyExtractor(row, rowIdx)}
                          onClick={() => onRowClick && onRowClick(row)}
                          className={`hover:bg-slate-50/80 transition-colors duration-150 ${onRowClick ? "cursor-pointer" : ""}`}
                        >
                          {columns.map((col, cIdx) => (
                            <td
                              key={col.key || cIdx}
                              className={`px-4 py-4 align-middle whitespace-nowrap ${col.className || ""}`}
                            >
                              {col.render ? col.render(row, rowIdx) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                /* Option B: Standard Flat Rows */
                data.map((row, rowIdx) => {
                  if (renderRow) {
                    return renderRow(row, rowIdx);
                  }

                  return (
                    <tr
                      key={keyExtractor(row, rowIdx)}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`hover:bg-slate-50/80 transition-colors duration-150 ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {columns.map((col, cIdx) => (
                        <td
                          key={col.key || cIdx}
                          className={`px-4 py-4 align-middle whitespace-nowrap ${col.className || ""}`}
                        >
                          {col.render ? col.render(row, rowIdx) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── MOBILE CARD VIEW (< lg): Consistent Compact Card List ─ */}
      {/* ────────────────────────────────────────────────────────── */}
      {renderMobileCard && (
        <div className="lg:hidden space-y-2 sm:space-y-3">
          {data.map((item, index) => renderMobileCard(item, index))}
        </div>
      )}
    </div>
  );
}
