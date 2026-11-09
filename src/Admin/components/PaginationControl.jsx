import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable server-side pagination control for Admin and User tables.
 */
export default function PaginationControl({
  currentPage = 1,
  pageSize = 10,
  hasPreviousPage = false,
  hasNextPage = false,
  onPreviousPage,
  onNextPage,
  totalItems = null,
  currentCount = 0,
  loading = false,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange = null,
}) {
  const startItem = (currentPage - 1) * pageSize + (currentCount > 0 ? 1 : 0);
  const endItem = (currentPage - 1) * pageSize + currentCount;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200/80 rounded-b-2xl">
      {/* Items info */}
      <div className="text-xs text-slate-500 font-medium">
        {totalItems !== null ? (
          <span>
            Showing <strong className="text-slate-800">{startItem}</strong> to{" "}
            <strong className="text-slate-800">{endItem}</strong> of{" "}
            <strong className="text-slate-800">{totalItems}</strong> items
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-800">{currentPage}</strong> (Showing{" "}
            <strong className="text-slate-800">{currentCount}</strong> items)
          </span>
        )}
      </div>

      {/* Navigation Buttons & Optional Page Size */}
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-2xs focus:border-[#0f5c3e] focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage || loading}
            className="flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 rounded-lg">
            {currentPage}
          </span>

          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage || loading}
            className="flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

