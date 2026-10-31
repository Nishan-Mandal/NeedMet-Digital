import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { buildSuccessQueryParams } from "./utils";

/**
 * Custom hook managing user action handlers for ServiceDetails:
 * coupon application, checkout initiation, and mandate resumption.
 */
export function useServiceActions({
  serviceId,
  selectedPlanId,
  paymentMethod,
  couponData,
  applyCoupon,
  handleCheckoutFlow,
  resumeMandateAuthorization,
  pendingMandate,
  checkoutStep,
  setShowAuthModal,
  setCashContext,
  setShowCashModal,
  service,
  currentPlan,
  pricing,
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleApplyCoupon = async (code) => {
    if (!code?.trim()) return;
    try {
      await applyCoupon(code, serviceId, selectedPlanId, paymentMethod);
    } catch (error) {
      console.error("Coupon failed:", error);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    await handleCheckoutFlow({
      serviceId,
      planId: selectedPlanId,
      paymentMethod,
      couponCode: couponData?.couponCode,
      serviceDetails: {
        serviceName: service?.title || service?.name || "NeedMet Digital",
        category: service?.category || "Digital Marketing",
        imageUrl: service?.imageUrl || [],
        planName: currentPlan?.name || "Standard Plan",
        basePrice: pricing?.baseprice || pricing?.total,
        finalPrice: pricing?.grand,
        upfrontAmount: pricing?.upfrontAmount,
        upfrontDisplay: pricing?.upfrontDisplay || "15%",
        upfrontType: pricing?.upfrontType || "percentage",
        upfrontValue: pricing?.upfrontValue || 15,
        totalCycles: pricing?.totalCycles,
        emiAmount: pricing?.emiAmount,
      },
      onSuccess: (_paymentId, metadata = {}) => {
        navigate(`/checkout/success?${buildSuccessQueryParams(metadata)}`);
      },

      onFailure: (errorMsg) => {
        if (pendingMandate || checkoutStep === "mandate_pending") return;
        navigate(`/checkout/failure?error=${encodeURIComponent(errorMsg)}`);
      },
      onCashPayment: (context) => {
        setCashContext(context);
        setShowCashModal(true);
      },
    });
  };

  const handleResumeMandate = async () => {
    if (!pendingMandate) return;
    await resumeMandateAuthorization({
      ...pendingMandate,
      onSuccess: (_paymentId, metadata = {}) => {
        navigate(`/checkout/success?${buildSuccessQueryParams(metadata)}`);
      },
      onFailure: (errorMsg) => {
        console.error("Resume mandate failed:", errorMsg);
      },
    });
  };

  return {
    handleApplyCoupon,
    handleCheckout,
    handleResumeMandate,
  };
}
