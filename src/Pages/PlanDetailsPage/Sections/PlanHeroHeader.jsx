import React from "react";
import { deriveDurationDays } from "../utils/planDetails.utils";

export default function PlanHeroHeader({
  purchase,
  isEmi,
  statusConfig,
  purchaseRef,
  formatDate,
}) {
  if (!purchase) return null;

  const durationDays = deriveDurationDays(purchase);

  const serviceName =
    purchase.serviceName ||
    purchase.title ||
    purchase.serviceTitle ||
    purchase.service?.title ||
    purchase.display?.serviceTitle ||
    purchase.category ||
    "NeedMet Digital Service";

  const planName =
    purchase.planName ||
    purchase.planTitle ||
    purchase.display?.planName ||
    "Selected Tier";

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 md:p-7 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Service Name (Main Title) */}
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight leading-tight break-words">
            {serviceName}
          </h1>

          {/* Plan Name in Small */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 font-heading text-xs sm:text-sm font-semibold text-slate-700">
              {planName}
            </span>
            {durationDays > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {durationDays} Days Execution
                </span>
              </>
            )}
            {isEmi && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs sm:text-sm font-semibold text-[#0F5C3E]">
                  Monthly EMI
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-3.5 py-1 font-heading text-xs font-bold tracking-wide ${statusConfig.badgeClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}

