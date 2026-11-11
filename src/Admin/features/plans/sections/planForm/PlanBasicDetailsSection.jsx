import ToggleButton from "../../../../../Components/common/ToggleButton";

const CATEGORIES = [
  "Digital Marketing",
  "Social Media",
  "Website Development",
  "Branding",
  "SEO",
  "Content Creation",
  "General",
];

export default function PlanBasicDetailsSection({
  formData,
  onChange,
  onTagSelect,
  isExpanded = true,
  onToggleExpand,
}) {
  const serviceTitle = formData.title || formData.name || "";
  const autoSlug =
    (formData.id || serviceTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "service-slug";

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-left group cursor-pointer"
        >
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-[#0f5c3e] transition">
              <span className="material-symbols-outlined text-[#0f5c3e] text-lg sm:text-base">
                design_services
              </span>
              Service Identity & Basic Info
            </h2>
            <p className="text-xs sm:text-[11px] text-slate-500 font-medium">
              Primary title, category, and storefront visibility.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <ToggleButton
            name="isActive"
            checked={Boolean(formData.isActive)}
            onChange={onChange}
            label="Active"
            size="sm"
          />
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title={isExpanded ? "Collapse section" : "Expand section"}
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              <span className="material-symbols-outlined text-base">
                {isExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div
          onClick={onToggleExpand}
          className="flex items-center justify-between text-xs text-slate-700 bg-slate-50/80 rounded-xl p-3 cursor-pointer hover:bg-slate-100/70 transition border border-slate-200/60 shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-900 truncate">
              {serviceTitle || "Untitled Service"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 truncate font-semibold">{formData.category || "General"}</span>
            {(formData.badge || formData.tag) && (
              <span className="rounded bg-[#e8f5ee] text-[#0f5c3e] px-1.5 py-0.2 text-[10px] font-bold shadow-2xs">
                {formData.badge || formData.tag}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#0f5c3e] font-bold shrink-0 ml-2">Tap to expand</span>
        </div>
      )}

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Service Title */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-slate-800">
              Service Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={serviceTitle}
              onChange={onChange}
              placeholder="e.g. Social Media Marketing & Management"
              required
              className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs focus:outline-none transition"
            />
          </div>

          {/* Category */}
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-bold text-slate-800">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category || "Digital Marketing"}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs focus:outline-none transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Card Badge */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Storefront Badge</span>
              <span className="text-[10px] text-slate-500 font-medium">Optional</span>
            </label>
            <input
              type="text"
              name="badge"
              value={formData.badge || formData.tag || ""}
              onChange={onChange}
              placeholder="e.g. Popular, Best Value, Trending"
              className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs focus:outline-none transition"
            />
          </div>

          {/* Route URL Preview */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Storefront Route</span>
              <span className="text-[10px] text-slate-500 font-medium">Auto-generated</span>
            </label>
            <div className="flex items-center rounded-xl bg-slate-50/80 border border-slate-200/60 px-3 py-2 text-sm text-slate-600 font-mono truncate shadow-2xs">
              <span className="text-slate-400 mr-0.5">/service/</span>
              <span className="text-[#0f5c3e] font-bold truncate">{autoSlug}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-4">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Service Overview</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Summary displayed on cards and details page
              </span>
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description || ""}
              onChange={onChange}
              placeholder="Comprehensive end-to-end service management designed to drive high-impact results..."
              className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] focus:bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f5c3e] focus:ring-1 focus:ring-[#0f5c3e]/20 shadow-2xs focus:outline-none transition leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
