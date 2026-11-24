import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionsPaginationSection({
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 font-primary">
      <div className="text-xs text-slate-500 text-center sm:text-left">
        Showing page <span className="text-slate-800 font-bold">{page}</span> of{" "}
        <span className="text-slate-800 font-bold">{totalPages}</span> ({totalCount} transactions)
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-[#0f5c3e] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer text-xs font-semibold flex items-center gap-1 active:scale-95"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
          <span>Previous</span>
        </button>

        <span className="px-2.5 py-1 text-xs font-bold text-[#0f5c3e] bg-[#e8f5ee] rounded-lg border border-[#d1fae5] shadow-2xs">
          {page} / {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-[#0f5c3e] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer text-xs font-semibold flex items-center gap-1 active:scale-95"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
