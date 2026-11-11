import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import usePricing from "../../hooks/usePricing";
import useCheckout from "../../hooks/useCheckout";
import useCoupon from "../../hooks/useCoupon";
import { fetchServiceWithPlans } from "../../services/firebase/service";
import LoginPromptModal from "../../Components/ui/LoginPromptModal";
import CashCodeModal from "./Sections/CashCodeModal";
import ServiceHero from "./Sections/ServiceHero";
import FeatureGrid from "./Sections/FeatureGrid";
import PlanSelector from "./Sections/PlanSelector";
import Timeline from "./Sections/Timeline";
import OrderSummary from "./Sections/OrderSummary";
import CheckoutLoadingModal from "./Sections/CheckoutLoadingModal";
import PendingMandateBanner from "./Sections/PendingMandateBanner";
import ServiceDetailsSkeleton from "./Sections/ServiceDetailsSkeleton";
import { useServiceActions } from "./useServiceActions";
import { getCheckoutStepFeedback, mapPlansById } from "./utils";
import { TIMELINE } from "../../data/Timeline";

export default function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [plansArray, setPlansArray] = useState([]);
  const [plansMap, setPlansMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState(null);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("FULL");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashContext, setCashContext] = useState(null);

  const { applyCoupon, couponData, couponError, couponLoading } = useCoupon();
  const {
    handleCheckoutFlow,
    resumeMandateAuthorization,
    checkoutLoading,
    checkoutStep,
    pendingMandate,
  } = useCheckout();

  const couponDiscount = couponData?.discountAmount || 0;
  const couponMessage = couponError || (couponData ? "Coupon applied successfully!" : "");

  // Load service and plans
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { service: loadedService, plans: loadedPlans } = await fetchServiceWithPlans(id);
        if (
          loadedService.status === "archived" ||
          loadedService.isActive === false ||
          loadedService.isArchived === true
        ) {
          setService(null);
          setError("This service has been archived and is no longer available.");
          return;
        }
        setService(loadedService);
        setPlansArray(loadedPlans);

        const map = mapPlansById(loadedPlans);
        setPlansMap(map);

        if (loadedPlans.length > 0) {
          setSelectedPlanId(loadedPlans[0].id);
        }
      } catch (err) {
        console.error("Failed to load service details:", err);
        setError("Failed to load service details.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const currentPlan = plansMap[selectedPlanId] || {
    months: 1,
    discount: 0,
    tag: "",
    description: "",
    name: "",
    price: 0,
  };
  const basePrice = currentPlan.price || 0;
  const pricing = usePricing(currentPlan, basePrice, couponDiscount, paymentMethod);

  // Custom hook orchestrating coupon, checkout, and mandate actions
  const { handleApplyCoupon, handleCheckout, handleResumeMandate } = useServiceActions({
    serviceId: id,
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
  });

  // Re-validate coupon when payment method or plan changes
  useEffect(() => {
    if (couponData?.couponCode) {
      applyCoupon(couponData.couponCode, id, selectedPlanId, paymentMethod).catch((err) => {
        console.warn("Coupon invalid for current payment method:", err.message);
      });
    }
  }, [paymentMethod, selectedPlanId]);

  if (isLoading) {
    return <ServiceDetailsSkeleton />;
  }

  if (!service) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-text">Service Not Found</h1>
        <p className="text-text-secondary">The service you are looking for does not exist.</p>
        <Link
          to="/"
          className="rounded-full bg-primary px-8 py-3 font-medium text-white transition hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const stepFeedback = getCheckoutStepFeedback(checkoutStep, paymentMethod);

  return (
    <div className="relative">
      {/* Checkout Loading Modal */}
      <CheckoutLoadingModal
        isOpen={checkoutLoading}
        stepFeedback={stepFeedback}
        paymentMethod={paymentMethod}
      />

      {/* Auth & Cash Modals */}
      <LoginPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CashCodeModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        serviceId={cashContext?.serviceId}
        planId={cashContext?.planId}
        couponCode={cashContext?.couponCode}
        serviceDetails={cashContext?.serviceDetails}
      />

      {/* Main Content Layout */}
      <div className="relative mx-auto max-w-7xl px-5 py-10 space-y-6">
        {/* Pending Mandate Resume Action Banner */}
        {(pendingMandate || checkoutStep === "mandate_pending") && (
          <PendingMandateBanner onResume={handleResumeMandate} isLoading={checkoutLoading} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Details (Left) */}
          <main className="space-y-4 lg:col-span-8">
            <ServiceHero service={service} />
            <FeatureGrid features={currentPlan?.features || []} />
            <PlanSelector
              plans={plansArray}
              selectedPlanId={selectedPlanId}
              onSelect={setSelectedPlanId}
              basePrice={basePrice}
            />
            <Timeline timeline={TIMELINE} />
          </main>

          {/* Desktop Summary Sidebar (Right) */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24">
              <OrderSummary
                currentPlan={currentPlan}
                pricing={pricing}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onApplyCoupon={handleApplyCoupon}
                couponMessage={couponMessage}
                couponLoading={couponLoading}
                onCheckout={handleCheckout}
                checkoutLoading={checkoutLoading}
              />
            </div>
          </aside>
        </div>

        {/* Mobile Sticky Bar */}
        <div className="sticky bottom-0 z-40 mt-6 border border-border/20 bg-white/95 p-1 shadow-lg rounded-2xl backdrop-blur-md lg:hidden">
          <button
            onClick={() => setShowOrderSummary(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-xl"
          >
            <div className="text-left">
              <p className="text-xs text-white/80">
                {pricing.isEmi ? `${pricing.upfrontDisplay || "15%"} Down Payment` : currentPlan.name}
              </p>
              <p className="text-xl font-bold">
                ₹{pricing.isEmi ? pricing.upfrontAmount.toLocaleString("en-IN") : pricing.grand.toLocaleString("en-IN")}
                {pricing.isEmi && <span className="text-xs font-normal text-white/80"> today</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 font-medium">
              View Summary
              <span className="material-symbols-outlined">expand_less</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showOrderSummary && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setShowOrderSummary(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl lg:hidden">
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-14 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between border-b px-6 pb-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <button
                onClick={() => setShowOrderSummary(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <OrderSummary
                currentPlan={currentPlan}
                pricing={pricing}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onApplyCoupon={handleApplyCoupon}
                couponMessage={couponMessage}
                couponLoading={couponLoading}
                checkoutLoading={checkoutLoading}
                onCheckout={() => {
                  setShowOrderSummary(false);
                  handleCheckout();
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}