import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import useAuth from "../../../hooks/useAuth";

export default function ProfileHeader() {
  const { currentUser, userProfile, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const displayName = userProfile?.name || currentUser?.displayName || "Valued Client";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 sm:p-4.5 md:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* User Identity */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F5C3E] to-[#1a8a5a] text-white text-sm sm:text-base font-bold shadow-xs select-none">
            {userInitials || "U"}
          </div>
          <div className="text-left space-y-0.5 min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight truncate" title={displayName}>
              {displayName}
            </h1>
            <p className="text-xs text-text-secondary truncate" title={currentUser?.phoneNumber || currentUser?.email || "—"}>
              {currentUser?.phoneNumber || currentUser?.email || "—"}
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-gray-50/80 hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-gray-700 transition cursor-pointer shadow-2xs"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
