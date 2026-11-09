import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "./Layout/Layout";

function AdminLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
      <div className="w-9 h-9 border-3 border-[#0f5c3e] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading admin workspace...</p>
    </div>
  );
}

/**
 * Admin Application Shell
 * Dedicated entry point for the administration portal.
 */
function Admin({ children }) {
  return (
    <AdminLayout>
      <Suspense fallback={<AdminLoader />}>
        {children || <Outlet />}
      </Suspense>
    </AdminLayout>
  );
}

export default Admin;
export { Admin as AdminApp };
