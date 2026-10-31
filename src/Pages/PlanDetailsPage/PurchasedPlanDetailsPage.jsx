import React from "react";
import CheckoutLoadingModal from "../Pricing/Sections/CheckoutLoadingModal";
import usePurchasedPlanDetails from "./hooks/usePurchasedPlanDetails";
import {
  PlanDetailsNav,
  PlanHeroHeader,
  MandateActionAlert,
  PlanVerifiedBanner,
  PlanFinancialOverview,
  InstallmentSchedule,
  PlanDetailsCard,
  PaymentReceiptsCard,
  ServiceConciergeCard,
  PlanDetailsSkeleton,
  PlanNotFound,
} from "./Sections";

export default function PurchasedPlanDetailsPage() {
  const {
    purchase,
    loading,
    notFound,
    copiedKey,
    copyToClipboard,
    feedbackMessage,
    setFeedbackMessage,
    showVerifiedOnce,
    setShowVerifiedOnce,
    handleResumeMandate,
    checkoutLoading,
    formatDate,
    isEmi,
    isMandateNeeded,
    statusConfig,
    upfrontPaid,
    totalCycles,
    emiAmount,
    verifiedPaid,
    purchaseRef,
  } = usePurchasedPlanDetails();

  if (loading) return <PlanDetailsSkeleton />;
  if (notFound) return <PlanNotFound />;

  return (
    <div className="min-h-screen bg-background-secondary py-4 sm:py-6 md:py-8 px-3.5 sm:px-6 lg:px-8 text-black">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">

        {/* Back Navigation Bar */}
        <PlanDetailsNav
          purchaseRef={purchaseRef}
          copiedKey={copiedKey}
          onCopy={copyToClipboard}
        />

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 text-left shadow-2xs ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-base shrink-0">
                {feedbackMessage.type === "success" ? "check_circle" : "error"}
              </span>
              <span className="break-words">{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
              aria-label="Dismiss feedback"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* SECTION 1: PLAN HERO HEADER */}
        <PlanHeroHeader
          purchase={purchase}
          isEmi={isEmi}
          statusConfig={statusConfig}
          purchaseRef={purchaseRef}
          formatDate={formatDate}
        />

        {/* SECTION 2: MANDATE STATUS ALERT (IF ACTION REQUIRED) */}
        {isMandateNeeded && (
          <MandateActionAlert
            upfrontPaid={upfrontPaid}
            totalCycles={totalCycles}
            emiAmount={emiAmount}
            checkoutLoading={checkoutLoading}
            onResumeMandate={handleResumeMandate}
          />
        )}

        {/* SECTION 3: ONE-TIME VERIFIED CONFIRMATION BANNER */}
        {showVerifiedOnce && (
          <PlanVerifiedBanner onDismiss={() => setShowVerifiedOnce(false)} />
        )}

        {/* SECTION 4: MAIN TWO-COLUMN RESPONSIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column (Financial Overview & Installment Timeline) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 flex flex-col">
            <PlanFinancialOverview purchase={purchase} />
            {(isEmi || totalCycles > 0 || emiAmount > 0) && (
              <InstallmentSchedule purchase={purchase} />
            )}
          </div>

          {/* Right Column (Plan Metadata Details & Payment History) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 flex flex-col">
            <PlanDetailsCard purchase={purchase} />
            <PaymentReceiptsCard
              purchase={purchase}
              isEmi={isEmi}
              verifiedPaid={verifiedPaid}
              formatDate={formatDate}
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
            />
            <ServiceConciergeCard purchase={purchase} />
          </div>
        </div>

      </div>

      {/* Loading Modal for Mandate Resumption */}
      <CheckoutLoadingModal
        isOpen={checkoutLoading}
        stepFeedback={{
          title: "Authorizing E-Mandate",
          desc: "Preparing your recurring auto-pay authorization with Razorpay...",
        }}
        paymentMethod="EMI"
      />
    </div>
  );
}
