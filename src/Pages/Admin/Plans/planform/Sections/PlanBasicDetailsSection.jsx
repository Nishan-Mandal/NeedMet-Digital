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
}) {
  const serviceTitle = formData.title || formData.name || "";
  const autoSlug =
    (formData.id || serviceTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "service-slug";

  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
        <div className="space-y-0.5">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#266C51] text-base">
              design_services
            </span>
            Service Identity
          </h2>
          <p className="text-[11px] text-gray-500">
            Primary title, category, and storefront visibility.
          </p>
        </div>
        <ToggleButton
          name="isActive"
          checked={Boolean(formData.isActive)}
          onChange={onChange}
          label="Active on Storefront"
          size="sm"
        />
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Service Title */}
        <div className="space-y-1 sm:col-span-3">
          <label className="text-[11px] font-bold text-gray-700">
            Service Title *
          </label>
          <input
            type="text"
            name="title"
            value={serviceTitle}
            onChange={onChange}
            placeholder="e.g. Social Media Marketing & Management"
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
          />
        </div>

        {/* Category */}
        <div className="space-y-1 sm:col-span-1">
          <label className="text-[11px] font-bold text-gray-700">
            Category *
          </label>
          <select
            name="category"
            value={formData.category || "Digital Marketing"}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:text-sm text-gray-900 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Card Badge */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
            <span>Storefront Badge</span>
            <span className="text-[10px] text-gray-400 font-normal">Optional tag</span>
          </label>
          <input
            type="text"
            name="badge"
            value={formData.badge || formData.tag || ""}
            onChange={onChange}
            placeholder="e.g. Popular, Best Value, Trending"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
          />
        </div>

        {/* Route URL Preview */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
            <span>Storefront Route</span>
            <span className="text-[10px] text-gray-400 font-normal">Auto-generated</span>
          </label>
          <div className="flex items-center rounded-lg bg-gray-50 border border-gray-200/80 px-2.5 py-1.5 text-xs text-gray-500 font-mono truncate">
            <span className="text-gray-400 mr-0.5">/service/</span>
            <span className="text-[#266C51] font-semibold truncate">{autoSlug}</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1 sm:col-span-4">
          <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
            <span>Service Overview</span>
            <span className="text-[10px] text-gray-400 font-normal">
              Summary displayed on cards and detail page
            </span>
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description || ""}
            onChange={onChange}
            placeholder="Comprehensive end-to-end service management designed to drive high-impact results..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
          />
        </div>
      </div>
    </div>
  );
}
