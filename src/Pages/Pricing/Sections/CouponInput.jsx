import { useState } from "react";

export default function CouponInput({ onApply, message, isLoading }) {
  const [coupon, setCoupon] = useState("");

  const handleApply = () => {
    if (onApply && coupon.trim() && !isLoading) {
      onApply(coupon.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          placeholder="Coupon Code"
          disabled={isLoading}
          className="flex-1 rounded-xl border border-border bg-primary-surface px-4 py-2 outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || !coupon.trim()}
          className="rounded-xl bg-text-secondary px-4 text-white transition hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {message && (
        <p className={`text-sm ${message === "Coupon applied successfully!" ? "text-primary" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}