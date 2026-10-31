import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { fetchPurchaseById } from "../../services/db";
import { formatCurrency } from "../../utils/Formatters";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Extract query parameters
  const orderId = searchParams.get("orderId") || "";
  const purchaseId = searchParams.get("purchaseId") || orderId;
  const paramServiceName = searchParams.get("serviceName");
  const paramPlanName = searchParams.get("planName");
  const paramAmount = searchParams.get("amount");
  const paramTotalAmount = searchParams.get("totalAmount");
  const paymentType = (searchParams.get("paymentType") || "FULL").toUpperCase();
  const isEmi =
    searchParams.get("isEmi") === "true" ||
    paymentType === "EMI" ||
    paymentType === "MANDATE_AUTHORIZED";
  const requiresMandate =
    searchParams.get("requiresMandate") === "true" ||
    (isEmi && paymentType === "EMI");
  const isMandateAuthorized = paymentType === "MANDATE_AUTHORIZED";
  const isCash = paymentType === "CASH";

  // State for hydrated purchase details
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Redirection countdown state (5 seconds)
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  // Hydrate purchase if query params are missing service/plan names
  useEffect(() => {
    let isMounted = true;
    if (purchaseId && (!paramServiceName || !paramPlanName)) {
      fetchPurchaseById(purchaseId, currentUser?.uid)
        .then((doc) => {
          if (isMounted && doc) {
            setPurchaseDetails(doc);
          }
        })
        .catch(() => {
          // ignore hydration errors
        });
    }
    return () => {
      isMounted = false;
    };
  }, [purchaseId, currentUser?.uid, paramServiceName, paramPlanName]);

  // Derived display values
  const serviceName =
    paramServiceName ||
    purchaseDetails?.serviceName ||
    purchaseDetails?.service?.title ||
    "NeedMet Digital Service";
  const planName =
    paramPlanName ||
    purchaseDetails?.planName ||
    purchaseDetails?.planType ||
    "Selected Plan";

  const rawAmount =
    paramAmount !== null && paramAmount !== undefined && paramAmount !== ""
      ? Number(paramAmount)
      : (purchaseDetails?.pricing?.upfrontAmount ||
          purchaseDetails?.upfrontAmount ||
          purchaseDetails?.amount ||
          0);

  const totalAmount =
    paramTotalAmount !== null && paramTotalAmount !== undefined && paramTotalAmount !== ""
      ? Number(paramTotalAmount)
      : (purchaseDetails?.pricing?.finalPrice ||
          purchaseDetails?.amount ||
          rawAmount);

  // Determine target profile redirection URL
  const targetProfileUrl = useMemo(() => {
    if (requiresMandate) {
      return `/profile?mandate_pending=true${purchaseId ? `&purchaseId=${encodeURIComponent(purchaseId)}` : ""}`;
    }
    if (purchaseId) {
      return `/profile/plans/${encodeURIComponent(purchaseId)}${isMandateAuthorized ? "?mandate_authorized=true" : ""}`;
    }
    return "/profile";
  }, [requiresMandate, purchaseId, isMandateAuthorized]);

  // Countdown timer for automatic redirection
  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      navigate(targetProfileUrl, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, navigate, targetProfileUrl]);

  const handleCopy = useCallback((text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const progressPercentage = ((5 - countdown) / 5) * 100;

  return (
    <div className=" w-full bg-slate-50/70 flex items-center justify-center p-3 sm:p-5 text-left">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-6 shadow-sm space-y-3.5 sm:space-y-4">

        {/* 1. Header & Status Badge */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${
              requiresMandate
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-[#0F5C3E]"
            }`}
          >
            <span className="material-symbols-outlined text-2xl sm:text-3xl">
              {requiresMandate ? "pending_actions" : "check_circle"}
            </span>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                requiresMandate
                  ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  requiresMandate ? "bg-amber-500" : "bg-emerald-600"
                }`}
              />
              {requiresMandate
                ? "UPFRONT PAYMENT VERIFIED"
                : isMandateAuthorized
                ? "E-MANDATE AUTHORIZED"
                : isCash
                ? "CASH APPROVED"
                : "PAYMENT SUCCESSFUL"}
            </span>

            <h1 className="mt-1 text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {requiresMandate
                ? "Down Payment Confirmed"
                : isMandateAuthorized
                ? "You're All Set!"
                : isCash
                ? "Payment Approved!"
                : "Payment Confirmed!"}
            </h1>

            <p className="text-[11px] sm:text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              {requiresMandate
                ? "Initial payment verified. Complete your e-mandate setup to activate ongoing service deliverables."
                : "Transaction completed successfully. Your service plan is active."}
            </p>
          </div>
        </div>

        {/* 2. Compact Purchase Summary Box */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 sm:p-3.5 space-y-2">
          {/* Main Item Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Purchased Plan
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate" title={serviceName}>
                {serviceName}
              </h3>
              <p className="text-[11px] text-gray-500 truncate">{planName}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {isEmi && totalAmount > rawAmount ? "Paid Today" : "Amount Paid"}
              </span>
              <p className="font-extrabold text-base sm:text-lg text-[#0F5C3E] tabular-nums">
                {formatCurrency(rawAmount)}
              </p>
            </div>
          </div>

          {/* EMI Sub-row if applicable */}
          {isEmi && totalAmount > rawAmount && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1 text-[11px] flex items-center justify-between text-gray-700">
              <span className="text-gray-600">Total Plan Value:</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          )}

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-2 border-t border-gray-200/60 pt-2 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[10px]">Payment Method</span>
              <span className="font-semibold text-gray-800">
                {isEmi
                  ? "Down Payment + EMI"
                  : isCash
                  ? "Cash Voucher"
                  : "Online Payment"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Reference</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-gray-800 truncate">
                  {purchaseId ? `#${purchaseId.slice(-10).toUpperCase()}` : "—"}
                </span>
                {purchaseId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(purchaseId, "ref")}
                    className="text-gray-400 hover:text-emerald-700 transition cursor-pointer"
                    title="Copy full reference"
                    aria-label="Copy reference"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedKey === "ref" ? "check" : "content_copy"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Mandate Action Notice (When Mandate Required) */}
        {requiresMandate && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-sm shrink-0 mt-0.5">
              pending_actions
            </span>
            <div className="min-w-0 flex-1 text-[11px] text-amber-900 leading-snug">
              <strong className="font-bold">Next Step:</strong> Authorize your monthly Auto-Pay recurring mandate from your profile to activate your plan deliverables.
            </div>
          </div>
        )}

        {/* 4. Actions & Automatic Redirection Bar */}
        <div className="space-y-2 pt-0.5">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => navigate(targetProfileUrl)}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0F5C3E] hover:bg-[#0B4931] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition duration-200 cursor-pointer"
          >
            <span>{requiresMandate ? "Go to Profile & Set Up Auto-Pay" : "View Purchased Plan"}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>

          {/* Countdown & Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">
                  {isPaused ? "pause_circle" : "schedule"}
                </span>
                <span>
                  {isPaused ? "Redirect paused" : `Redirecting in ${countdown}s`}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-[#0F5C3E] hover:underline font-semibold text-[10px] cursor-pointer"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#0F5C3E] transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
            <Link
              to="/profile"
              className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="material-symbols-outlined text-sm">account_circle</span>
              <span>My Profile</span>
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Home</span>
            </Link>
          </div>
        </div>

      
      </div>
    </div>
  );
}
