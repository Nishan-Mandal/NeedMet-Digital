import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sections/AdminSidebar";
import AdminNavbar from "./Sections/AdminNavbar";
import AdminDrawer from "./Sections/AdminDrawer";
import AdminBottomNav from "./Sections/AdminBottomNav";

/**
 * Admin Root Layout Shell
 * Coordinates fixed full-height desktop sidebar, fixed top navbar, responsive mobile drawer,
 * sticky mobile bottom navbar, and isolated scrollable main work area.
 */
export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({ offers: true });

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f7faf8] text-[#111827] flex font-primary relative">
      {/* ── Fixed Desktop Sidebar ── */}
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        openGroups={openGroups}
        toggleGroup={toggleGroup}
        setOpenGroups={setOpenGroups}
      />

      {/* ── Fixed Top Navbar ── */}
      <AdminNavbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* ── Mobile Navigation Drawer ── */}
      <AdminDrawer
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openGroups={openGroups}
        toggleGroup={toggleGroup}
      />

      {/* ── Main Scrollable Work Area ── */}
      <div className="flex-1 flex overflow-hidden pt-16">
        <main
          className={`flex-1 w-full overflow-y-auto min-w-0 p-4 pb-24 lg:pb-4 bg-[#f7faf8] transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          {children || <Outlet />}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar (< lg breakpoint) ── */}
      <AdminBottomNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </div>
  );
}
