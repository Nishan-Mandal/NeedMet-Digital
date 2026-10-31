export default function SortButton({
  value = "default",
  onChange,
  options = [
    { value: "default", label: "Sort: Default" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "title", label: "Name: A to Z" },
  ],
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#0f5c3e] pointer-events-none select-none">
        tune
      </span>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="h-10 sm:h-11 w-full sm:w-auto appearance-none rounded-xl border border-gray-200/90 bg-white pl-9 pr-8 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs outline-none transition-all hover:border-emerald-300 focus:border-[#0f5c3e] focus:ring-2 focus:ring-[#0f5c3e]/15 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-gray-400 pointer-events-none select-none">
        expand_more
      </span>
    </div>
  );
}
