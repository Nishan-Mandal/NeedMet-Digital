import SearchBar from "./SearchBar";
import CategoryTabs from "./CategoryTabs";
import SortButton from "./SortButton";

export default function FilterBar({
  categories = [],
  activeCategory = "All",
  onCategoryChange,
  searchQuery = "",
  onSearchChange,
  onSort,
  sortBy = "default",
  totalCount,
}) {
  const isFiltered = activeCategory !== "All" || Boolean(searchQuery?.trim());

  return (
    <section className="space-y-3.5 py-4 scroll-mt-28">
      {/* Top Row: Responsive Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex-1 max-w-xl">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search services (e.g. SEO, Website, Marketing)..."
            totalCount={totalCount}
          />
        </div>

        {onSort && (
          <div className="shrink-0 self-end sm:self-auto">
            <SortButton value={sortBy} onChange={onSort} />
          </div>
        )}
      </div>

      {/* Category Pills Strip */}
      {categories && categories.length > 0 && (
        <div className="pt-0.5">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}

      {/* Active Search & Filter Status Feedback Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100/80 px-3 py-1.5 text-xs text-gray-700 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="material-symbols-outlined text-sm text-[#0f5c3e]">
              filter_list
            </span>
            <span>
              Showing {typeof totalCount === "number" ? <strong className="text-gray-900">{totalCount}</strong> : ""}{" "}
              {totalCount === 1 ? "service" : "services"}
            </span>

            {searchQuery?.trim() && (
              <span>
                matching <strong className="text-[#0f5c3e]">"{searchQuery.trim()}"</strong>
              </span>
            )}

            {activeCategory !== "All" && (
              <span>
                in <strong className="text-[#0f5c3e]">{activeCategory}</strong>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSearchChange) onSearchChange("");
              if (onCategoryChange) onCategoryChange("All");
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            <span>Reset</span>
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      )}
    </section>
  );
}
