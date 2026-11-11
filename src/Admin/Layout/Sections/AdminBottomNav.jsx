import { NavLink, useLocation } from "react-router-dom";
import {
  NotepadText,
  TicketCheck,
  Banknote,
  SquareArrowOutUpRight,
} from "lucide-react";

/**
 * Mobile Bottom Navigation Bar for NeedMate Admin
 * Visible only on mobile screens (< lg breakpoint).
 * Provides fast 1-tap thumb navigation between Plans, Coupons, Cash Codes,
 * and quick access to the Live Site.
 */
export default function AdminBottomNav({
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const location = useLocation();
  const pathname = location.pathname;

  const isPlansActive =
    pathname.startsWith("/admin/plans") && pathname !== "/admin/plans/new";
  const isCouponsActive = pathname.startsWith("/admin/coupons");
  const isCashCodesActive = pathname.startsWith("/admin/cash-codes");

  const closeMenu = () => {
    if (mobileMenuOpen && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),0.5rem)] select-none transition-all duration-200"
      aria-label="Mobile Administration Navigation"
    >
      <div className="flex items-center justify-around h-15 px-2 max-w-lg mx-auto">
        {/* 1. Plans */}
        <NavLink
          to="/admin/plans"
          onClick={closeMenu}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
            isPlansActive
              ? "text-[#0f5c3e] font-bold"
              : "text-slate-600 hover:text-slate-900 font-semibold"
          }`}
        >
          <div className="relative">
            <NotepadText size={20} className={isPlansActive ? "stroke-[2.5]" : "stroke-2"} />
            {isPlansActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0f5c3e]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Plans</span>
        </NavLink>

        {/* 2. Coupons */}
        <NavLink
          to="/admin/coupons"
          onClick={closeMenu}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
            isCouponsActive
              ? "text-[#0f5c3e] font-bold"
              : "text-slate-600 hover:text-slate-900 font-semibold"
          }`}
        >
          <div className="relative">
            <TicketCheck size={20} className={isCouponsActive ? "stroke-[2.5]" : "stroke-2"} />
            {isCouponsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0f5c3e]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Coupons</span>
        </NavLink>

        {/* 3. Cash Codes */}
        <NavLink
          to="/admin/cash-codes"
          onClick={closeMenu}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
            isCashCodesActive
              ? "text-[#0f5c3e] font-bold"
              : "text-slate-600 hover:text-slate-900 font-semibold"
          }`}
        >
          <div className="relative">
            <Banknote size={20} className={isCashCodesActive ? "stroke-[2.5]" : "stroke-2"} />
            {isCashCodesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0f5c3e]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Cash Codes</span>
        </NavLink>

        {/* 4. Live Site */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          onClick={closeMenu}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 text-slate-600 hover:text-[#0f5c3e] font-semibold cursor-pointer"
          title="Open Live Website"
        >
          <div className="relative">
            <SquareArrowOutUpRight size={20} className="stroke-2" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Live Site</span>
        </a>
      </div>
    </nav>
  );
}
