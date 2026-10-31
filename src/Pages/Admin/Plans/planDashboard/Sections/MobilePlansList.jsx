import { Link } from "react-router-dom";
import {
  formatDate,
  getServiceCoverImage,
  calculatePriceRange,
  formatPlanDuration,
  getSafeDurationDays,
  formatPlanTitle,
  getServicePaymentModeSummary,
  formatEmiScheduleSummary,
} from "../utils/dashboard.utils";
import ServiceActionMenu from "./ServiceActionMenu";

export default function MobilePlansList({
  plans = [],
  expandedServiceIds,
  onToggleExpand,
  onToggleStatus,
  onDeleteClick,
  actionInProgress,
}) {
  return (
    <div className="block lg:hidden p-2.5 sm:p-3 space-y-3 bg-gray-50/50">
      {plans.map((plan) => {
        const isPublished = plan.status === "published";
        const isDraft = plan.status === "draft";
        const isArchived = plan.status === "archived";
        const subPlans = plan.plans || plan.variants || [];
        const isExpanded = expandedServiceIds?.has(plan.id);

        const coverImg = getServiceCoverImage(plan);
        const { minPrice, maxPrice, isRange } = calculatePriceRange(plan);
        const paymentSummary = getServicePaymentModeSummary(plan);

        return (
          <div
            key={plan.id}
            className="rounded-2xl border border-gray-200/90 bg-white p-3.5 shadow-2xs space-y-3 transition hover:border-gray-300"
          >
            {/* TOP HEADER: Cover, Category, Title, Price, Status, & THREE-DOT ACTION MENU */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={plan.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#266C51] border border-emerald-100 shadow-2xs">
                    <span className="material-symbols-outlined text-xl">design_services</span>
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-0.5">
                  {/* Badges row: Category, Storefront Tag, & Live Status */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#266C51]">
                      {plan.category || "Service"}
                    </span>
                    {(plan.badge || plan.tag) && (
                      <span className="rounded bg-emerald-100/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                        {plan.badge || plan.tag}
                      </span>
                    )}
                    {isPublished && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Live
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                        Draft
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center rounded bg-gray-100 border border-gray-200 px-1.5 py-0.2 text-[9px] font-bold text-gray-600">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Service Title */}
                  <h3 className="font-bold text-gray-900 text-sm truncate" title={plan.name}>
                    {plan.name}
                  </h3>

                  {/* Price Range */}
                  <p className="text-xs font-bold text-[#266C51]">
                    {isRange ? (
                      <span>
                        ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span>₹{minPrice.toLocaleString("en-IN")}</span>
                    )}
                    {paymentSummary.isEmiEligible ? (
                      <span className="ml-1.5 text-[10px] text-emerald-700 font-semibold">
                        ({paymentSummary.label})
                      </span>
                    ) : (
                      <span className="ml-1.5 text-[10px] text-gray-500 font-normal">
                        ({paymentSummary.label})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* THREE-DOT ACTIONS DROPDOWN (Replacing direct action buttons) */}
              <div className="shrink-0 -mr-1 -mt-1">
                <ServiceActionMenu
                  plan={plan}
                  onToggleStatus={onToggleStatus}
                  onDeleteClick={onDeleteClick}
                  actionInProgress={actionInProgress}
                  align="right"
                />
              </div>
            </div>

            {/* MIDDLE: DURATION PLANS AREA (Phone-Optimized) */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 space-y-2">
              {/* Header Bar with Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                  <span className="material-symbols-outlined text-sm text-[#266C51]">
                    calendar_month
                  </span>
                  <span>Duration Options</span>
                  <span className="rounded-full bg-white border border-gray-200/90 px-1.5 py-0.2 text-[10px] font-bold text-gray-600">
                    {subPlans.length}
                  </span>
                </div>

                {subPlans.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(plan.id)}
                    className="inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-bold text-[#266C51] hover:bg-emerald-100/50 transition cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Details" : "View Tiers"}</span>
                    <span className="material-symbols-outlined text-sm">
                      {isExpanded ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                )}
              </div>

              {/* Collapsed View: Sleek Duration + Price Chips */}
              {subPlans.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {subPlans.map((sub, sIdx) => {
                    const finalP = sub.finalPrice || sub.price || 0;
                    return (
                      <div
                        key={sub.id || sIdx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs shadow-2xs"
                      >
                        <span className="font-semibold text-gray-800">
                          {formatPlanDuration(sub)}
                        </span>
                        <span className="h-2.5 w-[1px] bg-gray-200" />
                        <span className="font-bold text-[#266C51]">
                          ₹{finalP.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  Single tier default plan configured.
                </p>
              )}

              {/* Expanded View: Dedicated Tier Breakdown Cards */}
              {isExpanded && subPlans.length > 0 && (
                <div className="pt-2 border-t border-gray-200/70 space-y-2 animate-in fade-in duration-200">
                  {subPlans.map((sub, sIdx) => {
                    const finalP = sub.finalPrice || sub.price || 0;
                    const originalP = sub.price || 0;
                    const hasDiscount = sub.discountAmount > 0;
                    const safeDays = getSafeDurationDays(sub);
                    const safeDur = formatPlanDuration(sub);
                    const safeTitle = formatPlanTitle(sub);

                    return (
                      <div
                        key={sub.id || sIdx}
                        className="rounded-xl border border-gray-200/90 bg-white p-2.5 space-y-1.5 shadow-2xs"
                      >
                        {/* Tier Header: Name + Badge + Price */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-gray-900 text-xs truncate">
                              {safeTitle}
                            </span>
                            {sub.tag && (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                                {sub.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-[#266C51] text-xs">
                              ₹{finalP.toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                              <span className="ml-1 text-[10px] text-gray-400 line-through">
                                ₹{originalP.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tier Details: Schedule, Payment Mode, EMI & Deliverables */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-[10px] text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-gray-400">
                              schedule
                            </span>
                            <span>{safeDays} Days ({safeDur})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-gray-400">
                              payments
                            </span>
                            <span>
                              {sub.paymentOptions === "BOTH"
                                ? "Full & EMI"
                                : sub.paymentOptions === "EMI"
                                ? "EMI Only"
                                : "Full Payment"}
                            </span>
                          </div>

                          {(() => {
                            const emiInfo = formatEmiScheduleSummary(sub);
                            if (!emiInfo.isEmi) return null;
                            return (
                              <div className="col-span-2 text-emerald-700 font-medium">
                                ↳ {emiInfo.text}
                              </div>
                            );
                          })()}

                          {(sub.features || []).length > 0 && (
                            <div className="col-span-2 text-gray-500">
                              ✓ {(sub.features || []).length} deliverables included
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CARD FOOTER: Last updated & Quick Storefront Link */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs text-gray-400">
              <span className="text-[10px]">
                Updated {formatDate(plan.updatedAt || plan.createdAt)}
              </span>

              <Link
                to={`/service/${plan.serviceId || plan.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#266C51] hover:underline"
              >
                <span>Storefront</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
