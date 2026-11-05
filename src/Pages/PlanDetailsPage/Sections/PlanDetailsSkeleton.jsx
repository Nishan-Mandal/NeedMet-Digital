import React from "react";

export default function PlanDetailsSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background-secondary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-heading text-sm font-semibold text-text-secondary">
          Loading plan details...
        </p>
      </div>
    </div>
  );
}

