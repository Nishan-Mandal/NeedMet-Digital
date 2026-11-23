import { Search, RefreshCw, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import FilterDropdown from "../../components/common/FilterDropdown";
import SortDropdown from "../../components/common/SortDropdown";

/**
 * ActionHeader — unified filter / search / sort toolbar for all admin list pages.
 *
 * Filter behaviour:
 *   • ≤ 3 filters  → all rendered as inline pills
 *   • > 3 filters  → first 3 as inline pills, rest collapse into the "More filters" dropdown
 *
 * Sort props (all optional — omit to hide the sort control):
 *   • sortOptions:  Array<{ value, label, icon? }>
 *   • activeSort:   string
 *   • sortDir:      "asc" | "desc"
 *   • onSortChange: (value, dir) => void
 */
export default function ActionHeader({
  // ── Filter ──────────────────────────────────────────────────────────
  filters = [],
  activeFilter,
  onFilterChange,
  /** Max number of filters shown as inline pills before the rest collapse into the dropdown. */
  inlinePillLimit = 3,

  // ── Sort ────────────────────────────────────────────────────────────
  sortOptions = [],
  activeSort,
  sortDir = "desc",
  onSortChange,

  // ── Search ──────────────────────────────────────────────────────────
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,

  // ── Actions ─────────────────────────────────────────────────────────
  onRefresh,
  refreshing = false,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onActionClick,
  actionTo,

  // ── Misc ────────────────────────────────────────────────────────────
  children,
  className = "",
}) {
  const showSearch = typeof onSearchChange === "function";
  const hasAction = Boolean(actionLabel && (actionTo || onActionClick));
  const hasSort = sortOptions.length > 0 && typeof onSortChange === "function";

  // Decide whether to use the smart dropdown or pure inline pills
  const useDropdown = filters.length > inlinePillLimit;
  const inlineCount = useDropdown ? inlinePillLimit : filters.length;

  // ─────────────────── Render helpers ───────────────────────────────

  const renderFilters = (isMobile = false) => {
    if (!filters || filters.length === 0) return null;

    // On mobile (< 768px), if there are more filters than inline limit (> 3),
    // collapse into the single dropdown (inlineCount = 0) so the mobile toolbar
    // is compact (~140px) and never blows out the phone viewport width.
    // If <= 3, keep them inline as they fit within mobile width.
    const effectiveInlineCount =
      isMobile && filters.length > inlinePillLimit ? 0 : inlineCount;

    return (
      <FilterDropdown
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        inlineCount={effectiveInlineCount}
      />
    );
  };

  const renderSortControl = () => {
    if (!hasSort) return null;
    return (
      <SortDropdown
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortDir={sortDir}
        onSortChange={onSortChange}
      />
    );
  };

  const renderSearchInput = (widthClass = "w-full") => {
    if (!showSearch) return null;
    return (
      <div className={`relative ${widthClass} min-w-0`}>
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full min-w-0 bg-white border border-slate-200 hover:border-slate-300 rounded-xl md:rounded-full pl-9 pr-9 py-1.5 md:py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 transition shadow-2xs h-9 md:h-auto"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  };

  const renderRefreshButton = () => {
    if (!onRefresh) return null;
    return (
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="h-9 w-9 md:h-9 md:w-9 md:p-2.5 flex items-center justify-center rounded-xl md:rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0f5c3e] border border-slate-200 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs active:scale-95"
        title="Refresh records"
        aria-label="Refresh records"
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin text-[#0f5c3e]" : "text-slate-600 hover:text-[#0f5c3e]"}
        />
      </button>
    );
  };

  const renderActionButton = (isMobile = false) => {
    if (!hasAction) return null;
    const baseClasses = isMobile
      ? "w-full h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white font-bold text-xs shadow-sm hover:shadow-md transition active:scale-[0.98] cursor-pointer min-w-0"
      : "flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition cursor-pointer shrink-0";

    if (actionTo) {
      return (
        <Link to={actionTo} className={baseClasses}>
          <ActionIcon size={16} className="shrink-0" />
          <span className="truncate">{actionLabel}</span>
        </Link>
      );
    }
    if (actionLabel && onActionClick) {
      return (
        <button type="button" onClick={onActionClick} className={baseClasses}>
          <ActionIcon size={16} className="shrink-0" />
          <span className="truncate">{actionLabel}</span>
        </button>
      );
    }
    return null;
  };

  // ─────────────────── Layout ───────────────────────────────────────

  return (
    <div className={`w-full font-primary relative z-30 ${className}`}>
      {/* ─────────────────────────────────────────────────────────── */}
      {/* DESKTOP (≥ 768 px): single horizontal toolbar row          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex md:items-center justify-between gap-3 w-full">
        {/* Left: filter pills + dropdown (overflow-visible to prevent clipping) */}
        <div className="flex items-center gap-1.5 shrink-0 relative z-30">
          {renderFilters(false)}
        </div>

        {/* Right: sort · search · extra slot · refresh · action */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-30">
          {renderSortControl()}
          {renderSearchInput("w-60 lg:w-72")}
          {children}
          {renderRefreshButton()}
          {renderActionButton(false)}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MOBILE (< 768 px): stacked thumb-friendly rows             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2.5 w-full min-w-0">
        {/* Row 1: Search + Refresh */}
        {(showSearch || onRefresh) && (
          <div className="flex items-center gap-2 w-full min-w-0">
            {showSearch ? (
              <div className="flex-1 min-w-0">{renderSearchInput("w-full")}</div>
            ) : null}
            {renderRefreshButton()}
          </div>
        )}

        {/* Row 2: Filter pills / dropdown + Sort control (overflow-visible) */}
        {(filters.length > 0 || hasSort) && (
          <div className="relative w-full z-30 min-w-0">
            <div className="flex items-center gap-2 flex-wrap py-0.5 w-full min-w-0">
              <div className="min-w-0">
                {renderFilters(true)}
              </div>
              {hasSort && (
                <div className="shrink-1">
                  {renderSortControl()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Primary action + extra children */}
        {(hasAction || children) && (
          <div className="w-full min-w-0">
            {hasAction && children ? (
              <div className="grid grid-cols-2 gap-2 w-full items-center min-w-0">
                <div className="min-w-0 w-full [&>select]:w-full [&>select]:h-10 [&>select]:rounded-xl [&>select]:px-3 [&>select]:py-0 [&>select]:text-xs [&>select]:font-semibold [&>select]:border-slate-200 [&>select]:shadow-2xs">
                  {children}
                </div>
                <div className="min-w-0 w-full">{renderActionButton(true)}</div>
              </div>
            ) : hasAction ? (
              <div className="w-full min-w-0">{renderActionButton(true)}</div>
            ) : (
              <div className="w-full min-w-0 [&>select]:w-full [&>select]:h-10 [&>select]:rounded-xl [&>select]:px-3 [&>select]:py-0 [&>select]:text-xs [&>select]:font-semibold [&>select]:border-slate-200 [&>select]:shadow-2xs">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Named alias for convenience
export { ActionHeader as FilterSearchHeader };
