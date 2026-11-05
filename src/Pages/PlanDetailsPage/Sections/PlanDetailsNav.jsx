import React from "react";
import { Link } from "react-router-dom";

export default function PlanDetailsNav({ purchaseRef, copiedKey, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        to="/profile"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-black hover:text-[#0F5C3E] transition"
      >
        <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        <span>Back to My Plans</span>
      </Link>

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-black font-semibold">Plan Ref:</span>
        <span className="font-mono text-xs font-bold bg-white border border-gray-200/90 px-2 py-0.5 rounded-md text-black shadow-2xs">
          {purchaseRef ? purchaseRef.slice(-12) : "—"}
        </span>
        {purchaseRef && (
          <button
            type="button"
            onClick={() => onCopy(purchaseRef, "top_ref")}
            className="p-1 text-gray-400 hover:text-[#0F5C3E] transition cursor-pointer"
            title="Copy full reference code"
            aria-label="Copy reference code"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedKey === "top_ref" ? "check" : "content_copy"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

