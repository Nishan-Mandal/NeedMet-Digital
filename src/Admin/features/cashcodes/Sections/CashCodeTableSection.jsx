import { useState, useEffect, useRef } from "react";
import {
  Coins,
  Copy,
  Clock,
  Ban,
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  MoreVertical,
  User,
  Calendar,
} from "lucide-react";
import {
  getCashCodeStatus,
  isCashCodeAvailable,
  formatCashCodeDate,
  getDaysRemaining,
  getCashCodeAmount,
} from "../../../utils/cashCode.utils";
import PaginationControl from "../../../components/PaginationControl";

export default function CashCodeTableSection({
  loading = false,
  codes = [],
  searchQuery = "",
  onCopy,
  onOpenAudit,
  onOpenDetails,
  onOpenEdit,
  onOpenRevoke,
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

  // Close mobile three-dot menu when clicking outside or pressing Escape
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

  const handleDetailsClick = (codeItem) => {
    if (onOpenDetails) onOpenDetails(codeItem);
    else if (onOpenAudit) onOpenAudit(codeItem);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm animate-pulse rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <Coins size={36} className="mx-auto mb-3 text-slate-400 animate-spin" />
        <p className="font-semibold text-slate-700">Loading cash codes from database...</p>
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-white border border-slate-200/60 shadow-xs text-slate-500">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/50 flex items-center justify-center mx-auto mb-3 text-slate-600 shadow-2xs">
          <Coins size={32} />
        </div>
        <p className="font-bold text-slate-800 text-base">No cash codes found</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {searchQuery
            ? `No cash codes matched "${searchQuery}". Try refining your search query.`
            : "Click 'Issue Cash Code' above to generate instant platform credits."}
        </p>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="space-y-4">
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-sm transition-shadow duration-200">
        <table className="w-full text-left text-sm text-slate-700">
          {/* Brand Green Background Table Header */}
          <thead className="bg-[#0f5c3e] text-[11px] uppercase tracking-wider text-white border-b border-[#0f5c3e] font-bold">
            <tr>
              <th className="px-5 py-3.5 text-white">Code</th>
              <th className="px-5 py-3.5 text-white">Created By</th>
              <th className="px-5 py-3.5 text-white">Credit Amount</th>
              <th className="px-5 py-3.5 text-white">Issue & Expiry</th>
              <th className="px-5 py-3.5 text-white">Usage & Redemption</th>
              <th className="px-5 py-3.5 text-right text-white min-w-[210px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {codes.map((codeItem) => {
              const status = getCashCodeStatus(codeItem);
              const isAvailable = isCashCodeAvailable(codeItem);
              const isRedeemed = Boolean(codeItem.isUsed);
              const isRevoked = Boolean(codeItem.isRevoked || status === "revoked");
              const amountNum = getCashCodeAmount(codeItem);
              const daysRemaining = getDaysRemaining(codeItem);
              const createdFormatted = formatCashCodeDate(codeItem.createdAt, true);
              const expiresFormatted = formatCashCodeDate(codeItem.expiresAt, false);

              return (
                <tr
                  key={codeItem.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150"
                >
                  {/* Column 1: Code (Copy button kept ONLY beside the code) */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm tracking-wider text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-1 rounded-lg border border-[#d1fae5] inline-flex items-center gap-1.5 shadow-2xs">
                        {codeItem.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy(codeItem.code)}
                        className="p-1.5 text-slate-600 hover:text-[#0f5c3e] hover:bg-[#e8f5ee] rounded-md transition cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Column 2: Created By */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                      <div className="w-6 h-6 rounded-full bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
                        <User size={12} />
                      </div>
                      <span className="truncate max-w-[140px]" title={codeItem.createdBy || "Admin User"}>
                        {codeItem.createdBy || "Admin User"}
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Credit Amount */}
                  <td className="px-5 py-4 align-middle">
                    <div>
                      <div className="text-base font-bold font-heading text-[#0f5c3e]">
                        ₹{amountNum.toLocaleString("en-IN")}
                      </div>
                     
                    </div>
                  </td>

                  {/* Column 4: Issue & Expiry */}
                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1 text-xs">
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-600 shrink-0" />
                        <span className="text-slate-500 text-[11px] font-medium">Issued:</span>
                        <span className="font-semibold text-slate-800">{createdFormatted}</span>
                      </div>

                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-600 shrink-0" />
                        <span className="text-slate-500 text-[11px] font-medium">Expires:</span>
                        <span className="font-semibold text-slate-800">{expiresFormatted}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Usage & Redemption */}
                  <td className="px-5 py-4 align-middle">
                    <div>
                      {status === "revoked" ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shadow-2xs">
                            <Ban size={11} className="text-red-700" />
                            Revoked
                          </span>
                          {codeItem.revokeReason && (
                            <p className="text-[11px] text-red-700 truncate max-w-[150px] font-medium" title={codeItem.revokeReason}>
                              {codeItem.revokeReason}
                            </p>
                          )}
                        </div>
                      ) : status === "redeemed" ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full shadow-2xs">
                            <CheckCircle2 size={11} className="text-sky-700" />
                            Redeemed
                          </span>
                          {codeItem.usedBy && (
                            <div className="text-[11px] font-mono text-slate-700 truncate max-w-[150px] font-medium" title={codeItem.usedBy}>
                              By: {codeItem.usedBy}
                            </div>
                          )}
                        </div>
                      ) : status === "expired" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shadow-2xs">
                          <Clock size={11} className="text-amber-700" />
                          Expired
                        </span>
                      ) : status === "inactive" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                          Inactive
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0f5c3e] bg-[#e8f5ee] border border-[#d1fae5] px-2 py-0.5 rounded-full shadow-2xs">
                            <ShieldCheck size={11} className="text-[#0f5c3e]" />
                            Available
                          </span>
                          {daysRemaining !== null && (
                            <div className="text-[11px] text-slate-600 font-medium">
                              {daysRemaining <= 1 ? (
                                <span className="text-amber-700 font-bold">Expires today</span>
                              ) : (
                                <span>Expires in {daysRemaining} days</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Full Actions for Desktop (Direct Buttons) */}
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Details Button (Replaced word Audit) */}
                      <button
                        type="button"
                        onClick={() => handleDetailsClick(codeItem)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#e8f5ee] hover:text-[#0f5c3e] text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-300/90 hover:border-[#0f5c3e]/40 transition cursor-pointer shadow-2xs hover:shadow-xs"
                        title="View Details"
                      >
                        <Eye size={13} className="text-slate-700 hover:text-[#0f5c3e]" />
                      </button>

                      {/* Edit Button (Disabled when redeemed) */}
                      {onOpenEdit && (
                        <button
                          type="button"
                          onClick={() => !isRedeemed && onOpenEdit(codeItem)}
                          disabled={isRedeemed}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1 border border-slate-300/90 transition cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                          title={isRedeemed ? "Redeemed codes cannot be edited" : "Edit Code"}
                        >
                          <Pencil size={13} className="text-slate-700" />
                        </button>
                      )}

                      {/* Revoke Button (Disabled when not available) */}
                      {onOpenRevoke && (
                        <button type="button" onClick={() => isAvailable && onOpenRevoke(codeItem)} disabled={!isAvailable}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-300/90 transition cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                          title={ isRevoked ? "Code is already revoked": isRedeemed ? "Redeemed codes cannot be revoked": !isAvailable ? "Expired or inactive code cannot be revoked": "Revoke Code"}
                        >
                          <Ban size={13} className="text-amber-700" />
                        </button>
                      )}

                      {/* Delete Button (Disabled when redeemed) */}
                      {onOpenDelete && (
                        <button
                          type="button"
                          onClick={() => !isRedeemed && onOpenDelete(codeItem)}
                          disabled={isRedeemed}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center border border-red-300/90 transition cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                          title={isRedeemed ? "Redeemed codes cannot be deleted" : "Delete Code"}
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
        {codes.map((codeItem) => {
          const status = getCashCodeStatus(codeItem);
          const isAvailable = isCashCodeAvailable(codeItem);
          const isRedeemed = Boolean(codeItem.isUsed);
          const isRevoked = Boolean(codeItem.isRevoked || status === "revoked");
          const amountNum = getCashCodeAmount(codeItem);
          const daysRemaining = getDaysRemaining(codeItem);
          const createdFormatted = formatCashCodeDate(codeItem.createdAt, true);
          const expiresFormatted = formatCashCodeDate(codeItem.expiresAt, false);

          const isMenuOpen = openMenuId === codeItem.id;

          return (
            <div
              key={codeItem.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3"
            >
              {/* Card Header: Code Badge + Status Tag + Three-Dot Menu */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-[#0f5c3e] bg-[#e8f5ee] px-2.5 py-1 rounded-lg border border-[#d1fae5]/70 shadow-2xs">
                    {codeItem.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopy(codeItem.code)}
                    className="p-1 text-slate-600 hover:text-[#0f5c3e] rounded-md transition cursor-pointer"
                    title="Copy Code"
                  >
                    <Copy size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Tag */}
                  {status === "revoked" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      <Ban size={10} /> Revoked
                    </span>
                  ) : status === "redeemed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      <CheckCircle2 size={10} /> Redeemed
                    </span>
                  ) : status === "expired" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      <Clock size={10} /> Expired
                    </span>
                  ) : status === "inactive" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full shadow-2xs">
                      Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f5c3e] bg-[#e8f5ee] border border-[#d1fae5]/70 px-2 py-0.5 rounded-full shadow-2xs">
                      <ShieldCheck size={10} /> Available
                    </span>
                  )}

                  {/* Three-Dot Menu (Mobile Only) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : codeItem.id);
                      }}
                      className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${
                        isMenuOpen
                          ? "bg-[#0f5c3e] text-white border-[#0f5c3e]"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                      aria-label="Action Menu"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-9 z-50 w-48 bg-white rounded-xl shadow-xl border border-slate-200/70 py-1.5 text-left ring-1 ring-black/5 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 1. View Details (Replaced word Audit) */}
                        <button
                          type="button"
                          onClick={() => {
                            handleDetailsClick(codeItem);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-[#e8f5ee] hover:text-[#0f5c3e] flex items-center gap-2 transition cursor-pointer font-semibold"
                        >
                          <Eye size={13} className="text-[#0f5c3e]" />
                          <span>View Details</span>
                        </button>

                        {/* 2. Edit Code (Disabled when redeemed) */}
                        {onOpenEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isRedeemed) {
                                onOpenEdit(codeItem);
                                setOpenMenuId(null);
                              }
                            }}
                            disabled={isRedeemed}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={isRedeemed ? "Redeemed codes cannot be edited" : "Edit Code"}
                          >
                            <Pencil size={13} className="text-slate-600" />
                            <span>Edit Code</span>
                          </button>
                        )}

                        {/* 3. Revoke Code (Disabled when not available) */}
                        {onOpenRevoke && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isAvailable) {
                                onOpenRevoke(codeItem);
                                setOpenMenuId(null);
                              }
                            }}
                            disabled={!isAvailable}
                            className="w-full px-3.5 py-2 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 transition cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isRevoked
                                ? "Code is already revoked"
                                : isRedeemed
                                ? "Redeemed codes cannot be revoked"
                                : !isAvailable
                                ? "Expired or inactive code cannot be revoked"
                                : "Revoke Code"
                            }
                          >
                            <Ban size={13} className="text-amber-700" />
                            <span>Revoke Code</span>
                          </button>
                        )}

                        {/* 4. Delete Code (Disabled when redeemed) */}
                        {onOpenDelete && (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                if (!isRedeemed) {
                                  onOpenDelete(codeItem);
                                  setOpenMenuId(null);
                                }
                              }}
                              disabled={isRedeemed}
                              className="w-full px-3.5 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              title={isRedeemed ? "Redeemed codes cannot be deleted" : "Delete Code"}
                            >
                              <Trash2 size={13} className="text-red-700" />
                              <span>Delete Code</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Credit Amount</span>
                  <span className="text-lg font-bold font-heading text-[#0f5c3e]">
                    ₹{amountNum.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Created By</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                    <User size={12} className="text-[#0f5c3e]" />
                    {codeItem.createdBy || "Admin User"}
                  </span>
                </div>
              </div>

              {/* Issue & Expiry Timeline */}
              <div className="text-xs text-slate-700 space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <Calendar size={12} className="text-slate-600" /> Issued:
                  </span>
                  <span className="font-semibold text-slate-800">{createdFormatted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <Clock size={12} className="text-slate-600" /> Expires:
                  </span>
                  <span className="font-semibold text-slate-800">{expiresFormatted}</span>
                </div>

                {/* Expiry countdown status for active codes */}
                {status === "active" && daysRemaining !== null && (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-slate-500 text-[11px] font-medium">Validity:</span>
                    {daysRemaining <= 1 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded shadow-2xs">
                        Expires today
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#0f5c3e] bg-[#e8f5ee] border border-[#d1fae5]/70 px-1.5 py-0.5 rounded shadow-2xs">
                        Expires in {daysRemaining} days
                      </span>
                    )}
                  </div>
                )}

                {status === "revoked" && codeItem.revokeReason && (
                  <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200/60 mt-1 font-medium shadow-2xs">
                    Reason: {codeItem.revokeReason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Server-Side Pagination Bar */}
      {(codes.length > 0 || hasPreviousPage || hasNextPage) && (
        <PaginationControl
          currentPage={currentPage}
          pageSize={pageSize}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          currentCount={codes.length}
          totalItems={totalItems}
          loading={loading}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
