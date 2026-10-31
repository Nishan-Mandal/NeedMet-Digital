import React from "react";

export default function PlanHeroHeader({
  purchase,
  isEmi,
  statusConfig,
  purchaseRef,
  formatDate,
}) {
  if (!purchase) return null;

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 md:p-7 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2.5 min-w-0 flex-1">
          {/* Category & Badge Row */}
          {/* <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 font-heading text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {purchase.serviceName || purchase.category || "NeedMet Digital"}
            </span>
            <span className="text-gray-300">•</span>
            <span className="rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {purchase.planType || `${purchase.durationDays || 30} Days Plan`}
            </span>
            <span className="text-gray-300">•</span>
            <span className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-0.5 font-heading text-[11px] font-semibold text-[#0F5C3E]">
              {isEmi ? "Monthly EMI Subscription" : "Full Payment"}
            </span>
          </div> */}

         <div className="flex items-center justify-between">
           {/* Title */}
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-black tracking-tight leading-tight break-words">
            {purchase.planName || purchase.planTitle || "Service Plan"}
          </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-3.5 py-1 font-heading text-xs font-bold tracking-wide ${statusConfig.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>
         
         </div>
        </div>
      </div>
    </div>
  );
}

