import { useState, useEffect, useRef } from "react";
import {
  Tag,
  Copy,
  Clock,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Ban,
  Power,
  Calendar,
  Layers,
} from "lucide-react";
import {
  getCouponStatus,
  getCouponStatusBadge,
  formatCouponDiscount,
  formatCouponDate,
  getCouponDaysRemaining,
  canDeleteCoupon,
} from "../../../utils/coupon.utils";
import PaginationControl from "../../../components/PaginationControl";

export default function CouponTableSection({
  loading = false,
  coupons = [],
  searchQuery = "",
  onCopy,
  onOpenDetails,
  onOpenEdit,
  onToggleStatus,
  onOpenDelete,
  currentPage = 1,
  pageSize = 10,
  hasPreviousPage = false,
  hasNextPage = false,
  onPreviousPage,
  onNextPage,
  totalItems = null,
  onPageSizeChange = null,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close mobile 3-dot menu on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm animate-pulse rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <Tag size={36} className="mx-auto mb-3 text-slate-400 animate-spin" />
        <p className="font-semibold text-slate-700">Loading coupons from database...</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#e8f5ee] border border-[#d1fae5]/70 flex items-center justify-center text-[#0f5c3e] shadow-2xs">
          <Tag size={32} />
        </div>
        <h3 className="font-bold text-slate-800 text-base font-heading">
          {searchQuery ? "No matching coupons" : "No coupons found"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {searchQuery
            ? `No coupons matched "${searchQuery}". Try refining your search query.`
            : "Click 'Add Coupon' above to launch promotional discounts for your platform."}
        </p>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="space-y-4">
      {/* ────────────────────────────────────────────────────────── */}
      {/* ── DESKTOP VIEW (>= lg): Brand Green Header & Full Actions ─ */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-sm transition-shadow duration-200">
        <table className="w-full text-left text-sm text-slate-700">
          {/* Brand Green Background Table Header */}
          <thead className="bg-[#0f5c3e] text-[11px] uppercase tracking-wider text-white border-b border-[#0f5c3e] font-bold">
            <tr>
              <th className="px-5 py-3.5 text-white">Coupon Code</th>
              <th className="px-5 py-3.5 text-white">Discount</th>
              <th className="px-5 py-3.5 text-white">Order Thresholds</th>
              <th className="px-5 py-3.5 text-white">Redemptions</th>
              <th className="px-5 py-3.5 text-white">Validity & Status</th>
              <th className="px-5 py-3.5 text-right text-white min-w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const badge = getCouponStatusBadge(coupon);
              const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);
              const limit = Number(coupon.usageLimit ?? 100);
              const percentUsed = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
              const daysRemaining = getCouponDaysRemaining(coupon);
              const isDeletable = canDeleteCoupon(coupon);
              const isInactive = coupon.status === "inactive";

              return (
                <tr
                  key={coupon.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150"
                >
                  {/* Column 1: Coupon Code + Copy button */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm tracking-wider text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-1 rounded-lg border border-[#d1fae5] inline-flex items-center gap-1.5 shadow-2xs">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy && onCopy(coupon.code)}
                        className="p-1.5 text-slate-600 hover:text-[#0f5c3e] hover:bg-[#e8f5ee] rounded-md transition cursor-pointer"
                        title="Copy Coupon Code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Column 2: Discount */}
                  <td className="px-5 py-4 align-middle">
                    <div>
                      <div className="text-base font-bold font-heading text-[#0f5c3e]">
                        {formatCouponDiscount(coupon)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium capitalize">
                        {coupon.discountType === "fixed" ? "Fixed flat discount" : "Percentage discount"}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Order Thresholds */}
                  <td className="px-5 py-4 align-middle text-xs text-slate-600">
                    <div className="space-y-0.5">
                      <div>
                        <span className="text-slate-400">Min Order: </span>
                        <span className="font-semibold text-slate-700">
                          ₹{Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Max Cap: </span>
                        <span className="font-semibold text-slate-700">
                          {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
                            ? `₹${Number(coupon.maxDiscountAmount).toLocaleString("en-IN")}`
                            : "Unlimited"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Redemptions / Usage */}
                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-800 flex items-center justify-between min-w-[130px]">
                        <span>{used} used</span>
                        <span className="text-slate-400 font-normal">of {limit}</span>
                      </div>
                      <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentUsed >= 100
                              ? "bg-purple-600"
                              : percentUsed >= 80
                              ? "bg-amber-500"
                              : "bg-[#0f5c3e]"
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Validity & Status */}
                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1 text-xs">
                      {/* Status Tag */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Expiry line */}
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                        <Clock size={12} className="text-slate-600 shrink-0" />
                        <span className="text-slate-800">
                          {coupon.expiresAt ? formatCouponDate(coupon.expiresAt, false) : "No Expiry"}
                        </span>
                      </div>

                      {/* Countdown note if active */}
                      {status === "active" && daysRemaining !== null && (
                        <div className="text-[10px] text-slate-500 font-medium">
                          {daysRemaining <= 1 ? (
                            <span className="text-amber-700 font-bold">Expires today</span>
                          ) : (
                            <span>Expires in {daysRemaining} days</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Full Actions for Desktop (Direct Buttons) */}
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Details Button */}
                      {onOpenDetails && (
                        <button
                          type="button"
                          onClick={() => onOpenDetails(coupon)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#e8f5ee] hover:text-[#0f5c3e] text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-300/90 hover:border-[#0f5c3e]/40 transition cursor-pointer shadow-2xs hover:shadow-xs"
                          title="View Details"
                        >
                          <Eye size={13} className="text-slate-700 hover:text-[#0f5c3e]" />
                        </button>
                      )}

                      {/* Edit Button */}
                      {onOpenEdit && (
                        <button
                          type="button"
                          onClick={() => onOpenEdit(coupon)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-300/90 transition cursor-pointer shadow-2xs hover:shadow-xs"
                          title="Edit Coupon"
                        >
                          <Pencil size={13} className="text-slate-700" />
                        </button>
                      )}

                      {/* Toggle Active / Inactive Status */}
                      {onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(coupon)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer shadow-2xs hover:shadow-xs ${
                            isInactive
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300/90"
                              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300/90"
                          }`}
                          title={isInactive ? "Activate Coupon" : "Deactivate Coupon"}
                        >
                          <Power size={13} className={isInactive ? "text-emerald-700" : "text-amber-700"} />
                          <span>{isInactive ? "Activate" : "Deactivate"}</span>
                        </button>
                      )}

                      {/* Delete Button (Disabled if usedCount > 0) */}
                      {onOpenDelete && (
                        <button
                          type="button"
                          onClick={() => isDeletable && onOpenDelete(coupon)}
                          disabled={!isDeletable}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center border border-red-300/90 transition cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                          title={
                            isDeletable
                              ? "Delete Coupon"
                              : `Redeemed coupons cannot be deleted (${used} used)`
                          }
                        >
                          <Trash2 size={13} className="text-red-700" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── MOBILE / PHONE VIEW (< lg): Redesigned Cards & 3-Dot ─── */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {coupons.map((coupon) => {
          const status = getCouponStatus(coupon);
          const badge = getCouponStatusBadge(coupon);
          const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);
          const limit = Number(coupon.usageLimit ?? 100);
          const percentUsed = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
          const daysRemaining = getCouponDaysRemaining(coupon);
          const isDeletable = canDeleteCoupon(coupon);
          const isInactive = coupon.status === "inactive";

          const isMenuOpen = openMenuId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3"
            >
              {/* Card Header: Code Badge + Status Tag + Three-Dot Menu */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-1 rounded-lg border border-[#d1fae5]/70 shadow-2xs">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopy && onCopy(coupon.code)}
                    className="p-1 text-slate-600 hover:text-[#0f5c3e] rounded-md transition cursor-pointer"
                    title="Copy Coupon Code"
                  >
                    <Copy size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>

                  {/* Three-Dot Trigger Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(isMenuOpen ? null : coupon.id)
                      }
                      className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs transition cursor-pointer"
                      title="Actions"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Mobile Dropdown Popover */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/70 py-1 z-30 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                        {/* 1. View Details */}
                        {onOpenDetails && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenDetails(coupon);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-[#e8f5ee] hover:text-[#0f5c3e] flex items-center gap-2 transition cursor-pointer font-semibold"
                          >
                            <Eye size={13} className="text-[#0f5c3e]" />
                            <span>View Details</span>
                          </button>
                        )}

                        {/* 2. Edit Coupon */}
                        {onOpenEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenEdit(coupon);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer font-semibold"
                          >
                            <Pencil size={13} className="text-slate-600" />
                            <span>Edit Coupon</span>
                          </button>
                        )}

                        {/* 3. Toggle Status */}
                        {onToggleStatus && (
                          <button
                            type="button"
                            onClick={() => {
                              onToggleStatus(coupon);
                              setOpenMenuId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-xs flex items-center gap-2 transition cursor-pointer font-semibold ${
                              isInactive
                                ? "text-emerald-800 hover:bg-emerald-50"
                                : "text-amber-800 hover:bg-amber-50"
                            }`}
                          >
                            <Power size={13} className={isInactive ? "text-emerald-700" : "text-amber-700"} />
                            <span>{isInactive ? "Activate Coupon" : "Deactivate Coupon"}</span>
                          </button>
                        )}

                        {/* 4. Delete Coupon (Disabled if usedCount > 0) */}
                        {onOpenDelete && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                if (isDeletable) {
                                  onOpenDelete(coupon);
                                  setOpenMenuId(null);
                                }
                              }}
                              disabled={!isDeletable}
                              className="w-full px-3.5 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                              title={
                                isDeletable
                                  ? "Delete Coupon"
                                  : "Redeemed coupons cannot be deleted"
                              }
                            >
                              <Trash2 size={13} className="text-red-700" />
                              <span>Delete Coupon</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Discount & Rules Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Discount</span>
                  <span className="text-lg font-bold font-heading text-[#0f5c3e]">
                    {formatCouponDiscount(coupon)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Min Order / Cap</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Number(coupon.minOrderAmount || 0)} / {coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : "∞"}
                  </span>
                </div>
              </div>

              {/* Redemptions Progress */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                    <Layers size={12} className="text-slate-600" /> Redemptions:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {used} / {limit} ({percentUsed}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentUsed >= 100
                        ? "bg-purple-600"
                        : percentUsed >= 80
                        ? "bg-amber-500"
                        : "bg-[#0f5c3e]"
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>

              {/* Expiry Timeline */}
              <div className="text-xs text-slate-700 space-y-1 pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-600" /> Expires:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {coupon.expiresAt ? formatCouponDate(coupon.expiresAt, false) : "No Expiry"}
                  </span>
                </div>

                {status === "active" && daysRemaining !== null && (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-slate-500 text-[11px] font-medium">Validity status:</span>
                    {daysRemaining <= 1 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded shadow-2xs">
                        Expires today
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#0f5c3e] bg-[#e8f5ee] border border-[#d1fae5]/70 px-1.5 py-0.2 rounded shadow-2xs">
                        Expires in {daysRemaining} days
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Server-Side Pagination Bar */}
      {(coupons.length > 0 || hasPreviousPage || hasNextPage) && (
        <PaginationControl
          currentPage={currentPage}
          pageSize={pageSize}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          currentCount={coupons.length}
          totalItems={totalItems}
          loading={loading}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
