import { Link } from "react-router-dom";

export default function DashboardHeader({ userEmail }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 uppercase tracking-wide">
            Admin Panel
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs font-medium text-text-secondary">
            {userEmail || "Admin"}
          </span>
        </div>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Services & Plans Management
        </h1>
        <p className="text-xs text-text-secondary">
          Manage root services, nested duration plans (1M, 3M, 6M, 1Y), EMI schedules, and deliverables.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Link
          to="/admin/plans/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#266C51] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#1f5741] transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Create New Service
        </Link>
      </div>
    </div>
  );
}

