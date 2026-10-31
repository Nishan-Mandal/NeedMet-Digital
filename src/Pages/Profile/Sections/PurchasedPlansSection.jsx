import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PurchasedPlanCard from "../PurchasedPlanCard";
import {
  isPurchaseActive,
  isPurchasePendingMandate,
  isPurchaseCompleted,
  isPurchaseProcessing,
  filterPurchases,
} from "../utils/profile.utils";

export default function PurchasedPlansSection({
  purchases = [],
  loading = false,
  planFilter = "all",
  onFilterChange,
  highlightedPurchaseId = null,
  sectionRef,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeCount = useMemo(
    () => purchases.filter(isPurchaseActive).length,
    [purchases]
  );
  const pendingMandateCount = useMemo(
    () => purchases.filter(isPurchasePendingMandate).length,
    [purchases]
  );
  const pendingCount = useMemo(
    () => purchases.filter(isPurchaseProcessing).length,
    [purchases]
  );
  const completedCount = useMemo(
    () => purchases.filter(isPurchaseCompleted).length,
    [purchases]
  );

  const displayedPurchases = useMemo(
    () => filterPurchases(purchases, planFilter, searchQuery),
    [purchases, planFilter, searchQuery]
  );

  return (
    <div ref={sectionRef} className="space-y-4 sm:space-y-5 text-left">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              Purchased Plans
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-emerald-800">
              {purchases.length}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your active subscriptions, installment schedules, and service access.
          </p>
        </div>

        {/* Filter Pills & Search - Responsive flex/wrap row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
          {/* Horizontally touch-scrollable filter pills on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 rounded-xl bg-white border border-border/50 shadow-2xs max-w-full">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                planFilter === "all"
                  ? "bg-primary text-white shadow-2xs"
                  : "text-text-secondary hover:text-gray-900"
              }`}
            >
              All ({purchases.length})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("active")}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                planFilter === "active"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-text-secondary hover:text-gray-900"
              }`}
            >
              Active ({activeCount})
            </button>

            {pendingMandateCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange("pending_mandate")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                  planFilter === "pending_mandate"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-amber-800 hover:text-amber-950 font-bold"
                }`}
              >
                Action Required ({pendingMandateCount})
              </button>
            )}

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange("pending")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                  planFilter === "pending"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-text-secondary hover:text-gray-900"
                }`}
              >
                Pending ({pendingCount})
              </button>
            )}

            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange("completed")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                  planFilter === "completed"
                    ? "bg-gray-800 text-white shadow-2xs"
                    : "text-text-secondary hover:text-gray-900"
                }`}
              >
                Completed ({completedCount})
              </button>
            )}
          </div>

          {purchases.length > 2 && (
            <div className="relative w-full sm:w-44 md:w-48 shrink-0">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plans..."
                className="w-full rounded-xl border border-border/50 bg-white pl-7 pr-7 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plans Responsive Grid / States */}
      {loading ? (
        <div className="rounded-2xl border border-border/30 bg-white p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-xs text-text-secondary">Refreshing plans...</p>
        </div>
      ) : displayedPurchases.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedPurchases.map((purchase) => {
            const purchaseId = purchase.id || purchase.purchaseId;
            const isHighlighted = highlightedPurchaseId === purchaseId;

            return (
              <div
                key={purchaseId}
                className={`h-full ${
                  isHighlighted ? "ring-2 ring-primary rounded-2xl sm:rounded-3xl" : ""
                }`}
              >
                <PurchasedPlanCard purchase={purchase} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white/70 p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">
              {planFilter === "all" ? "No purchased plans yet" : "No plans match this filter"}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {planFilter === "all"
                ? "You haven't enrolled in any service plans yet. Explore our digital marketing and development services today."
                : "Try switching to another filter or view all your plans."}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            Explore Plans
          </Link>
        </div>
      )}
    </div>
  );
}
