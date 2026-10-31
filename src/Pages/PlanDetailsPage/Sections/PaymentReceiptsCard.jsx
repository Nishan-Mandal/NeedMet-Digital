import React from "react";

export default function PaymentReceiptsCard({
  purchase,
  isEmi,
  verifiedPaid,
  formatDate,
  copiedKey,
  onCopy,
}) {
  const paymentId = purchase?.upfrontPayment?.paymentId || purchase?.paymentId;
  const hasPaymentRecord = Boolean(paymentId || verifiedPaid > 0);

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs text-left space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0F5C3E]">
          <span className="material-symbols-outlined text-lg">receipt_long</span>
        </div>
        <div>
          <h3 className="font-heading font-bold text-black text-sm sm:text-base tracking-tight">
            Verified Payment Receipts
          </h3>
          <p className="text-[11px] text-black font-medium">
            Authenticated gateway transaction records
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {hasPaymentRecord ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 sm:p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-black">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-base">
                  check_circle
                </span>
                {isEmi ? "Initial Down Payment" : "Verified Payment"}
              </span>
              <span className="font-heading font-bold text-emerald-800 text-sm sm:text-base tabular-nums">
                ₹{Number(verifiedPaid || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2 text-black text-xs pt-2 border-t border-gray-200/50">
              {paymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-black font-medium">Payment ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-black">
                    <span>{paymentId}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(paymentId, "pay")}
                      className="text-gray-400 hover:text-[#0F5C3E] transition cursor-pointer"
                      title="Copy payment ID"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {copiedKey === "pay" ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-black font-medium">Recorded Date:</span>
                <span className="font-medium text-black">
                  {formatDate(purchase?.createdAt || purchase?.startDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-black font-medium">Gateway Protocol:</span>
                <span className="inline-flex items-center gap-1 font-heading text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  <span className="material-symbols-outlined text-xs">security</span>
                  Razorpay Secured
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-secondary py-2">No recorded payments yet.</p>
        )}
      </div>
    </div>
  );
}

