import { Search, RefreshCw, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ActionHeader({
  filters = [],
  activeFilter,
  onFilterChange,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onRefresh,
  refreshing = false,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onActionClick,
  actionTo,
  children,
  className = "",
}) {
  const showSearch = typeof onSearchChange === "function";
  const hasAction = Boolean(actionLabel && (actionTo || onActionClick));

  const handleSearchInput = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // Helper to render filter pills
  const renderFilterTabs = (isMobile = false) => {
    if (!filters || filters.length === 0) return null;

    return filters.map((filter) => {
      const isObj = typeof filter === "object" && filter !== null;
      const value = isObj ? filter.value : filter;
      const label = isObj ? filter.label : filter;
      const count = isObj ? filter.count : undefined;
      const isSelected = activeFilter === value;

      return (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange && onFilterChange(value)}
          className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl md:rounded-full text-xs capitalize transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            isSelected
              ? "bg-[#0f5c3e] text-white border border-[#0f5c3e] font-bold shadow-xs active:scale-95"
              : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 font-semibold shadow-2xs hover:shadow-xs active:scale-95"
          }`}
        >
          <span>{label}</span>
          {count !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? "bg-white/20 text-white font-bold"
                  : "bg-slate-100 text-slate-600 font-bold border border-slate-200/60"
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    });
  };

  // Helper to render search input
  const renderSearchInput = (widthClass = "w-full") => {
    if (!showSearch) return null;

    return (
      <div className={`relative ${widthClass}`}>
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearchInput}
          className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl md:rounded-full pl-9 pr-9 py-2 md:py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 transition shadow-2xs h-10 md:h-auto"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClearSearch}
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

  // Helper to render refresh button
  const renderRefreshButton = () => {
    if (!onRefresh) return null;

    return (
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="h-10 w-10 md:h-9 md:w-9 md:p-2.5 flex items-center justify-center rounded-xl md:rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0f5c3e] border border-slate-200 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs active:scale-95"
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

  // Helper to render primary action button
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

  return (
    <div className={`w-full font-primary ${className}`}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP VIEW (>= 768px): Unified Horizontal Toolbar ── */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex md:items-center justify-between gap-3 w-full">
        {/* Left Side: Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
          {renderFilterTabs(false)}
        </div>

        {/* Right Side: Search + Extra Children + Refresh + Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {renderSearchInput("w-60 lg:w-72")}
          {children}
          {renderRefreshButton()}
          {renderActionButton(false)}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── MOBILE VIEW (< 768px): Structured Thumb-Friendly Stack ─ */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2.5 w-full">
        {/* 1. Top Row: Search Input + Refresh Icon Button */}
        {(showSearch || onRefresh) && (
          <div className="flex items-center gap-2 w-full">
            {showSearch ? (
              <div className="flex-1 min-w-0">
                {renderSearchInput("w-full")}
              </div>
            ) : null}
            {renderRefreshButton()}
          </div>
        )}

        {/* 2. Middle Row: Edge-to-Edge Filter Tabs Strip */}
        {filters.length > 0 && (
          <div className="relative w-full">
            <div className="-mx-4 px-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 scroll-smooth touch-pan-x">
              {renderFilterTabs(true)}
            </div>
          </div>
        )}

        {/* 3. Bottom Row: Primary Action & Extra Controls */}
        {(hasAction || children) && (
          <div className="w-full">
            {hasAction && children ? (
              <div className="grid grid-cols-2 gap-2 w-full items-center">
                <div className="min-w-0 w-full [&>select]:w-full [&>select]:h-10 [&>select]:rounded-xl [&>select]:px-3 [&>select]:py-0 [&>select]:text-xs [&>select]:font-semibold [&>select]:border-slate-200 [&>select]:shadow-2xs">
                  {children}
                </div>
                <div className="min-w-0 w-full">
                  {renderActionButton(true)}
                </div>
              </div>
            ) : hasAction ? (
              <div className="w-full">
                {renderActionButton(true)}
              </div>
            ) : (
              <div className="w-full [&>select]:w-full [&>select]:h-10 [&>select]:rounded-xl [&>select]:px-3 [&>select]:py-0 [&>select]:text-xs [&>select]:font-semibold [&>select]:border-slate-200 [&>select]:shadow-2xs">
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
