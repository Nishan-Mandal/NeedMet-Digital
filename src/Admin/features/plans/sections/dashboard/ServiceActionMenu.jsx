import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ServiceActionMenu({
  plan,
  onToggleStatus,
  onDeleteClick,
  onCloneClick,
  actionInProgress,
  align = "right",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isPublished = plan.status === "published";
  const isLoading = actionInProgress === plan.id;

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleStatusClick = () => {
    setIsOpen(false);
    onToggleStatus(plan);
  };

  const handleCloneClick = () => {
    setIsOpen(false);
    onCloneClick?.(plan);
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    onDeleteClick(plan);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Three Dot Trigger Button (40px touch area on mobile) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className={`flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-xl sm:rounded-lg border transition cursor-pointer shadow-2xs ${
          isOpen
            ? "bg-[#0f5c3e] text-white border-[#0f5c3e]"
            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
        }`}
        title="More actions"
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <span className="material-symbols-outlined text-base animate-spin text-[#0f5c3e]">
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-xl sm:text-lg">more_vert</span>
        )}
      </button>

      {/* Floating Action Menu Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 w-52 sm:w-48 rounded-xl border border-slate-200/70 bg-white py-1 shadow-xl ring-1 ring-black/5 z-40 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Service Title Preview */}
          <div className="px-3 py-1.5 border-b border-slate-100 mb-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {plan.category || "Service Actions"}
            </p>
            <p className="text-xs font-bold text-slate-900 truncate" title={plan.name}>
              {plan.name}
            </p>
          </div>

          {/* Action 1: View on Storefront */}
          <Link
            to={`/service/${plan.serviceId || plan.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#e8f5ee] hover:text-[#0f5c3e] transition"
          >
            <span className="material-symbols-outlined text-base text-slate-600">
              open_in_new
            </span>
            <span>View on Storefront</span>
          </Link>

          {/* Action 2: Edit Service */}
          <Link
            to={`/admin/plans/edit/${plan.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <span className="material-symbols-outlined text-base text-slate-600">
              edit
            </span>
            <span>Edit Service & Plans</span>
          </Link>

          {/* Action 2b: Clone Plan */}
          <button
            type="button"
            onClick={handleCloneClick}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0f5c3e] transition cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-base text-slate-600">
              content_copy
            </span>
            <span>Clone Plan</span>
          </button>

          {/* Action 3: Toggle Publish/Archive Status */}
          <button
            type="button"
            onClick={handleStatusClick}
            disabled={isLoading}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 sm:py-1.5 text-sm sm:text-xs font-semibold transition cursor-pointer text-left min-h-[42px] sm:min-h-0 ${
              isPublished
                ? "text-amber-800 hover:bg-amber-50"
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <span className="material-symbols-outlined text-lg sm:text-base">
              {isPublished ? "archive" : "publish"}
            </span>
            <span>{isPublished ? "Archive Service" : "Publish Service"}</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Action 4: Permanent Delete */}
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 sm:py-1.5 text-sm sm:text-xs font-semibold text-red-700 hover:bg-red-50 transition cursor-pointer text-left min-h-[42px] sm:min-h-0"
          >
            <span className="material-symbols-outlined text-lg sm:text-base text-red-600">
              delete
            </span>
            <span>Delete Service</span>
          </button>
        </div>
      )}
    </div>
  );
}
