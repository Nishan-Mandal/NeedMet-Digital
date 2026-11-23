import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, SlidersHorizontal } from "lucide-react";

/**
 * FilterDropdown — reusable custom dropdown for filter options.
 *
 * Props:
 *  - filters: Array<{ value, label, count? }>
 *  - activeFilter: string — currently selected value
 *  - onFilterChange: (value: string) => void
 *  - placeholder?: string — default label
 *  - inlineCount?: number — number of filters shown as inline pills before dropdown (if 0, all filters are in dropdown)
 *  - className?: string
 */
export default function FilterDropdown({
  filters = [],
  activeFilter,
  onFilterChange,
  placeholder = "Filter",
  inlineCount = 0,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!filters || filters.length === 0) return null;

  // Split into inline pills and dropdown items based on inlineCount
  const hasInline = inlineCount > 0 && inlineCount < filters.length;
  const inlineFilters = hasInline ? filters.slice(0, inlineCount) : [];
  const dropdownFilters = hasInline ? filters.slice(inlineCount) : filters;

  // Find active filter details
  const activeItem = filters.find((f) => {
    const v = typeof f === "object" && f !== null ? f.value : f;
    return v === activeFilter;
  });

  const activeLabel = activeItem
    ? typeof activeItem === "object"
      ? activeItem.label
      : activeItem
    : placeholder;

  // Check if the currently active filter is inside the dropdown list
  const isDropdownActive = dropdownFilters.some((f) => {
    const v = typeof f === "object" && f !== null ? f.value : f;
    return v === activeFilter;
  });

  // Label to display on the dropdown trigger button
  const triggerLabel = hasInline
    ? isDropdownActive
      ? activeLabel
      : "More filters"
    : activeLabel;

  const triggerCount = hasInline
    ? isDropdownActive
      ? activeItem?.count
      : undefined
    : activeItem?.count;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap min-w-0 max-w-full ${className}`}>
      {/* ── 1. Inline Pills (if configured) ── */}
      {inlineFilters.map((filter) => {
        const isObj = typeof filter === "object" && filter !== null;
        const value = isObj ? filter.value : filter;
        const label = isObj ? filter.label : filter;
        const count = isObj ? filter.count : undefined;
        const isSelected = activeFilter === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              onFilterChange && onFilterChange(value);
              setOpen(false);
            }}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl md:rounded-full text-xs capitalize transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              isSelected
                ? "bg-[#0f5c3e] text-white border border-[#0f5c3e] font-bold shadow-xs active:scale-95"
                : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 font-semibold shadow-2xs hover:shadow-xs active:scale-95"
            }`}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 rounded-full ${
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
      })}

      {/* ── 2. Custom Dropdown Trigger & Menu ── */}
      {dropdownFilters.length > 0 && (
        <div ref={dropdownRef} className="relative inline-block text-left min-w-0">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl md:rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              isDropdownActive || (!hasInline && activeItem)
                ? "bg-[#0f5c3e] text-white border-[#0f5c3e] font-bold shadow-xs"
                : open
                ? "bg-slate-50 border-slate-300 text-slate-800 shadow-xs"
                : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-2xs hover:shadow-xs active:scale-95"
            }`}
          >
            <SlidersHorizontal
              size={13}
              className={
                isDropdownActive || (!hasInline && activeItem)
                  ? "text-white"
                  : "text-slate-500"
              }
            />
            <span className="max-w-[130px] sm:max-w-[180px] truncate">{triggerLabel}</span>

            {triggerCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 rounded-full font-bold ${
                  isDropdownActive || (!hasInline && activeItem)
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                {triggerCount}
              </span>
            )}

            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                open ? "rotate-180" : ""
              } ${
                isDropdownActive || (!hasInline && activeItem)
                  ? "text-white"
                  : "text-slate-500"
              }`}
            />
          </button>

          {/* Dropdown Menu Panel */}
          {open && (
            <div
              role="listbox"
              tabIndex={-1}
              className="absolute top-full mt-1.5 left-0 z-50 min-w-[200px] max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 font-primary"
            >
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {hasInline ? "More Filters" : "Select Filter"}
                </span>
              </div>

              {dropdownFilters.map((filter) => {
                const isObj = typeof filter === "object" && filter !== null;
                const value = isObj ? filter.value : filter;
                const label = isObj ? filter.label : filter;
                const count = isObj ? filter.count : undefined;
                const isSelected = activeFilter === value;

                return (
                  <button
                    key={value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onFilterChange && onFilterChange(value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs cursor-pointer transition-colors duration-100 text-left ${
                      isSelected
                        ? "bg-[#e8f5ee] text-[#0f5c3e] font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span className="capitalize truncate">{label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? "bg-[#0f5c3e]/10 text-[#0f5c3e]"
                              : "bg-slate-100 text-slate-500 border border-slate-200/60"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
