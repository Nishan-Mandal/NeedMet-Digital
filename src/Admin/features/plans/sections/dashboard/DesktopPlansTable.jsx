import { Fragment } from "react";
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
} from "../../utils/dashboard.utils";

export default function DesktopPlansTable({
  plans = [],
  expandedServiceIds,
  onToggleExpand,
  onToggleStatus,
  onDeleteClick,
  onCloneClick,
  actionInProgress,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-gray-700">
        <thead className="bg-[#0f5c3e] text-[11px] font-bold uppercase tracking-wider text-white border-b border-[#0f5c3e]">
          <tr>
            <th className="px-4 py-3.5 text-white">Service Details</th>
            <th className="px-4 py-3.5 text-white">Duration Plans under Service</th>
            <th className="px-4 py-3.5 text-white">Pricing Range</th>
            <th className="px-4 py-3.5 text-white">Storefront Status</th>
            <th className="px-4 py-3.5 text-white">Updated</th>
            <th className="px-4 py-3.5 text-right text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {plans.map((plan) => {
            const isPublished = plan.status === "published";
            const isDraft = plan.status === "draft";
            const isArchived = plan.status === "archived";
            const subPlans = plan.plans || plan.variants || [];
            const isExpanded = expandedServiceIds?.has(plan.id);

            const { minPrice, maxPrice, isRange } = calculatePriceRange(plan);
            const coverImg = getServiceCoverImage(plan);
            const paymentSummary = getServicePaymentModeSummary(plan);

            return (
              <Fragment key={plan.id}>
                <tr className="hover:bg-slate-50/80 transition duration-150">
                  {/* Service Details */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={plan.name}
                          className="h-11 w-11 rounded-lg object-cover shrink-0 border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0f5c3e] border border-emerald-100">
                          <span className="material-symbols-outlined text-xl">design_services</span>
                        </div>
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {plan.category || "Service"}
                          </span>
                          {(plan.badge || plan.tag) && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                              {plan.badge || plan.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm truncate max-w-[200px]" title={plan.name}>
                          {plan.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 line-clamp-1 max-w-[240px]">
                          {plan.description || "No overview provided."}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Duration Plans under Service */}
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      {subPlans.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {subPlans.slice(0, 3).map((sub, idx) => (
                            <span
                              key={sub.id || idx}
                              className="inline-flex items-center gap-1 rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-800"
                            >
                              <span>{formatPlanDuration(sub)}</span>
                              <span className="text-[#0f5c3e] font-bold">
                                ₹{(sub.finalPrice || sub.price || 0).toLocaleString("en-IN")}
                              </span>
                            </span>
                          ))}
                          {subPlans.length > 3 && (
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                              +{subPlans.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Single Plan (1 Tier)</span>
                      )}

                      {subPlans.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onToggleExpand(plan.id)}
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0f5c3e] hover:underline cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Plan Details" : `View All ${subPlans.length} Plans`}</span>
                          <span className="material-symbols-outlined text-sm">
                            {isExpanded ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Pricing Range */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 text-xs">
                        {isRange ? (
                          <span>
                            ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span>₹{minPrice.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                      <div className="text-[10px]">
                        {paymentSummary.isEmiEligible ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                            {paymentSummary.label}
                          </span>
                        ) : (
                          <span className="text-gray-500">{paymentSummary.label}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Storefront Status */}
                  <td className="px-4 py-3">
                    {isPublished && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Published
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        Draft
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        Archived
                      </span>
                    )}
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-3 text-[11px] text-gray-500">
                    <div>{formatDate(plan.updatedAt || plan.createdAt)}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[90px]">
                      {plan.creatorEmail || "Admin"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        to={`/service/${plan.serviceId || plan.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1.5 text-slate-700 bg-white border border-slate-300/80 shadow-2xs hover:bg-[#e8f5ee] hover:text-[#0f5c3e] hover:border-[#0f5c3e]/40 transition"
                        title="View on Storefront"
                      >
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                      </Link>

                      <Link
                        to={`/admin/plans/edit/${plan.id}`}
                        className="rounded-lg p-1.5 text-slate-700 bg-white border border-slate-300/80 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition"
                        title="Edit Service & Plans"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => onCloneClick?.(plan)}
                        className="rounded-lg p-1.5 text-slate-700 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-[#e8f5ee] hover:text-[#0f5c3e] transition cursor-pointer"
                        title="Clone Plan"
                        aria-label={`Clone ${plan.name}`}
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(plan)}
                        disabled={actionInProgress === plan.id}
                        className={`rounded-lg p-1.5 border transition cursor-pointer shadow-2xs ${
                          isPublished
                            ? "bg-amber-50 text-amber-800 border-amber-200/70 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200/70 hover:bg-emerald-100"
                        }`}
                        title={isPublished ? "Soft-Archive Service" : "Publish Service"}
                      >
                        <span className="material-symbols-outlined text-base">
                          {actionInProgress === plan.id
                            ? "progress_activity"
                            : isPublished
                            ? "archive"
                            : "publish"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteClick(plan)}
                        disabled={actionInProgress === plan.id}
                        className="rounded-lg p-1.5 bg-red-50 text-red-700 border border-red-200/70 shadow-2xs hover:bg-red-100 transition cursor-pointer disabled:opacity-40"
                        title="Permanently Delete Service"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* EXPANDED NESTED PLANS SUB-TABLE */}
                {isExpanded && subPlans.length > 0 && (
                  <tr className="bg-slate-50/80 border-y border-slate-100">
                    <td colSpan={6} className="p-3 pl-12">
                      <div className="rounded-xl border border-slate-200/60 bg-white p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                          <span>Duration Plans under "{plan.name}"</span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            {subPlans.length} duration options configured
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="border-b border-gray-100 text-gray-400">
                              <tr>
                                <th className="py-1">Plan Tier</th>
                                <th className="py-1">Duration Days</th>
                                <th className="py-1">Price</th>
                                <th className="py-1">Payment Modes</th>
                                <th className="py-1">EMI Schedule</th>
                                <th className="py-1">Deliverables</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {subPlans.map((sub, sIdx) => (
                                <tr key={sub.id || sIdx}>
                                  <td className="py-1.5 font-bold text-gray-900">
                                    {formatPlanTitle(sub)}
                                    {sub.tag && (
                                      <span className="ml-1 rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                                        {sub.tag}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {getSafeDurationDays(sub)} days
                                  </td>
                                  <td className="py-1.5">
                                    <span className="font-bold text-[#0f5c3e]">
                                      ₹{(sub.finalPrice || sub.price || 0).toLocaleString("en-IN")}
                                    </span>
                                    {sub.discountAmount > 0 && (
                                      <span className="ml-1 text-[10px] text-gray-400 line-through">
                                        ₹{(sub.price || 0).toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {sub.paymentOptions === "BOTH"
                                      ? "Full & EMI"
                                      : sub.paymentOptions === "EMI"
                                      ? "EMI Only"
                                      : "Full Payment Only"}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {(() => {
                                      const emiInfo = formatEmiScheduleSummary(sub);
                                      if (!emiInfo.isEmi) {
                                        return <span className="text-gray-400">—</span>;
                                      }
                                      return (
                                        <span
                                          className="text-emerald-800 font-medium"
                                          title={emiInfo.text}
                                        >
                                          {emiInfo.shortText}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="py-1.5 text-gray-600">
                                    {(sub.features || []).length} items included
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

