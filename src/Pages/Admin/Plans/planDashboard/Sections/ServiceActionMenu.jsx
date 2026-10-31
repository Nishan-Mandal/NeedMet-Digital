import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ServiceActionMenu({
  plan,
  onToggleStatus,
  onDeleteClick,
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

  const handleDeleteClick = () => {
    setIsOpen(false);
    onDeleteClick(plan);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Three Dot Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition cursor-pointer ${
          isOpen
            ? "bg-gray-100 text-gray-900 border-gray-200"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }`}
        title="More actions"
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <span className="material-symbols-outlined text-base animate-spin text-[#266C51]">
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-lg">more_vert</span>
        )}
      </button>

      {/* Floating Action Menu Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 w-48 rounded-xl border border-gray-200/90 bg-white py-1.5 shadow-xl ring-1 ring-black/5 z-40 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Service Title Preview */}
          <div className="px-3 py-1 border-b border-gray-100 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {plan.category || "Service Actions"}
            </p>
            <p className="text-xs font-semibold text-gray-800 truncate" title={plan.name}>
              {plan.name}
            </p>
          </div>

          {/* Action 1: View on Storefront */}
          <Link
            to={`/service/${plan.serviceId || plan.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-emerald-50/60 hover:text-[#266C51] transition"
          >
            <span className="material-symbols-outlined text-base text-gray-400">
              open_in_new
            </span>
            <span>View on Storefront</span>
          </Link>

          {/* Action 2: Edit Service */}
          <Link
            to={`/admin/plans/edit/${plan.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <span className="material-symbols-outlined text-base text-gray-400">
              edit
            </span>
            <span>Edit Service & Plans</span>
          </Link>

          {/* Action 3: Toggle Publish/Archive Status */}
          <button
            type="button"
            onClick={handleStatusClick}
            disabled={isLoading}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition cursor-pointer text-left ${
              isPublished
                ? "text-amber-700 hover:bg-amber-50"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isPublished ? "archive" : "publish"}
            </span>
            <span>{isPublished ? "Archive Service" : "Publish Service"}</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-gray-100" />

          {/* Action 4: Permanent Delete */}
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-base text-red-500">
              delete
            </span>
            <span>Delete Service</span>
          </button>
        </div>
      )}
    </div>
  );
}

