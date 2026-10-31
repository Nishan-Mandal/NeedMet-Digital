export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search services...",
  className = "",
  totalCount,
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search Icon */}
      <span className="material-symbols-outlined absolute left-3.5 text-xl text-[#0f5c3e] transition-colors pointer-events-none select-none">
        search
      </span>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200/90 bg-white py-2.5 sm:py-3 pl-11 pr-10 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 shadow-2xs transition-all duration-200 hover:border-emerald-300 focus:border-[#0f5c3e] focus:outline-none focus:ring-2 focus:ring-[#0f5c3e]/15"
      />

      {/* Clear Button (when text is typed) */}
      {value ? (
        <button
          type="button"
          onClick={() => onChange && onChange("")}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition cursor-pointer"
          title="Clear search"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      ) : null}
    </div>
  );
}
