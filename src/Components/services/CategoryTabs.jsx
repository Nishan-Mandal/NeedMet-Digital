export default function CategoryTabs({
  categories = [],
  activeCategory = "All",
  onCategoryChange,
  className = "",
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-semibold ${className}`}
    >
      {categories.map((cat) => {
        const name = typeof cat === "object" ? cat.name || cat.title : cat;
        const key = typeof cat === "object" ? cat.id || cat.name : cat;
        const isSelected = activeCategory === name;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onCategoryChange && onCategoryChange(name)}
            className={`shrink-0 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all cursor-pointer select-none ${
              isSelected
                ? "bg-[#0f5c3e] text-white shadow-2xs font-bold"
                : "bg-white text-gray-600 border border-gray-200/90 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
