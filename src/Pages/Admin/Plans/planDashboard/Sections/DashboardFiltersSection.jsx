export default function DashboardFiltersSection({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  onClear,
}) {
  const hasActiveFilters = Boolean(searchQuery || statusFilter !== "all" || paymentFilter !== "all");

  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search service, plan, or category..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#266C51]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#266C51]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#266C51]"
          >
            <option value="all">All Payment Types</option>
            <option value="BOTH">Full & EMI</option>
            <option value="EMI">EMI Only</option>
            <option value="FULL">Full Payment Only</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

