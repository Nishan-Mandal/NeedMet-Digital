import React from "react";
import { Link } from "react-router-dom";

export default function PlanNotFound() {
  return (
    <div className="min-h-screen bg-background-secondary py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md mx-auto space-y-4 rounded-2xl bg-white p-8 border border-border/40 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          <span className="material-symbols-outlined text-2xl">search_off</span>
        </div>
        <h2 className="font-heading text-lg font-bold text-black">Plan Not Found</h2>
        <p className="text-xs text-black">
          We couldn't locate this purchase or it may belong to a different account.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-heading text-xs font-bold text-white shadow-xs hover:bg-primary-light transition"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to My Plans
        </Link>
      </div>
    </div>
  );
}

