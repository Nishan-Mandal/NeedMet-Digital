import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, ChevronDown, Check, ArrowUp, ArrowDown } from "lucide-react";

/**
 * SortDropdown — reusable custom sort control.
 *
 * Props:
 *  - sortOptions: Array<{ value, label, icon? }>
 *  - activeSort: string — currently selected sort value
 *  - sortDir: "asc" | "desc" — current sort direction
 *  - onSortChange: (value: string, dir: "asc" | "desc") => void
 *  - className?: string
 */
export default function SortDropdown({
  sortOptions = [],
  activeSort,
  sortDir = "desc",
  onSortChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!sortOptions || sortOptions.length === 0) return null;

  const activeOption = sortOptions.find((o) => {
    const v = typeof o === "object" && o !== null ? o.value : o;
    return v === activeSort;
  });

  const activeLabel = activeOption
    ? typeof activeOption === "object"
      ? activeOption.label
      : activeOption
    : "Sort";

  const isActive = Boolean(activeSort && activeSort !== "");

  const handleOptionClick = (e, value) => {
    e.preventDefault();
    e.stopPropagation();
    if (value === activeSort) {
      // Toggle direction
      onSortChange && onSortChange(value, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange && onSortChange(value, "desc");
    }
    setOpen(false);
  };

  const DirIcon = sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left min-w-0 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Sort records"
        className={`flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl md:rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 h-[34px] md:h-auto ${
          isActive
            ? "bg-[#0f5c3e] text-white border-[#0f5c3e] font-bold shadow-xs"
            : open
            ? "bg-slate-50 border-slate-300 text-slate-800 shadow-xs"
            : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-2xs hover:shadow-xs active:scale-95"
        }`}
      >
        {isActive ? (
          <DirIcon size={13} className="text-white shrink-0" />
        ) : (
          <ArrowUpDown size={13} className="text-slate-500 shrink-0" />
        )}
        <span className="max-w-[80px] truncate hidden sm:inline">
          {isActive ? activeLabel : "Sort"}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} hidden sm:block ${
            isActive ? "text-white" : "text-slate-500"
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute top-full mt-1.5 right-0 z-50 min-w-[180px] max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 font-primary"
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sort by
            </span>
          </div>
          {sortOptions.map((option) => {
            const isObj = typeof option === "object" && option !== null;
            const value = isObj ? option.value : option;
            const label = isObj ? option.label : option;
            const OptionIcon = isObj ? option.icon : null;
            const isSelected = activeSort === value;

            return (
              <button
                key={value}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={(e) => handleOptionClick(e, value)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs cursor-pointer transition-colors duration-100 text-left ${
                  isSelected
                    ? "bg-[#e8f5ee] text-[#0f5c3e] font-bold"
                    : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
              >
                <div className="flex items-center gap-2">
                
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelected && (
                    <>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#0f5c3e]/10 text-[#0f5c3e] border border-[#0f5c3e]/20`}
                      >
                        {sortDir === "asc" ? "A→Z" : "Z→A"}
                      </span>
                      
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
