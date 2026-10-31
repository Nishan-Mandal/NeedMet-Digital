export default function PlanDatesNotesSection({
  formData,
  creatorInfo,
  onChange,
}) {
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3 text-left h-full flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="pb-2.5 border-b border-gray-100 space-y-0.5">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#266C51] text-base">
              event_available
            </span>
            Availability & Dates
          </h2>
          <p className="text-[11px] text-gray-500">
            Storefront window and service kickoff timelines.
          </p>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700">
              Availability Start
            </label>
            <input
              type="date"
              name="availabilityStart"
              value={formData.availabilityStart || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700">
              Availability Expiry
            </label>
            <input
              type="date"
              name="availabilityEnd"
              value={formData.availabilityEnd || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-gray-700">
              Service Kickoff Date
            </label>
            <input
              type="date"
              name="serviceStart"
              value={formData.serviceStart || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#266C51] focus:outline-none focus:ring-1 focus:ring-[#266C51]"
            />
          </div>
        </div>
      </div>

      {/* Creator Attribution (single flat row, no nested box) */}
      {creatorInfo && (
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-gray-400">
          <span>
            By: <span className="font-medium text-gray-600">{creatorInfo.creatorEmail || creatorInfo.createdBy || "Admin"}</span>
          </span>
          {creatorInfo.updatedBy && (
            <span>
              Updated: <span className="font-medium text-gray-600">{creatorInfo.updatedBy}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
