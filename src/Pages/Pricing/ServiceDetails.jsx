import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import usePricing from "../../hooks/usePricing";
import useCheckout from "../../hooks/useCheckout";
import useCoupon from "../../hooks/useCoupon";
import useAuth from "../../hooks/useAuth";
import { fetchServiceWithPlans } from "../../services/firebase/service";
import LoginPromptModal from "../../Components/ui/LoginPromptModal";
import CashCodeModal from "./Sections/CashCodeModal";
import ServiceHero from "./Sections/ServiceHero";
import FeatureGrid from "./Sections/FeatureGrid";
import PlanSelector from "./Sections/PlanSelector";
import Timeline from "./Sections/Timeline";
import OrderSummary from "./Sections/OrderSummary";
import { TIMELINE } from "../../data/Timeline";

export default function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [plansArray, setPlansArray] = useState([]);
  const [plansMap, setPlansMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("FULL");

  const { applyCoupon, couponData, couponError, couponLoading } = useCoupon();
  const { handleCheckoutFlow, checkoutLoading, checkoutError } = useCheckout();
  const navigate = useNavigate();

  const couponDiscount = couponData?.discountAmount || 0;
  const couponMessage = couponError || (couponData ? "Coupon applied successfully!" : "");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashContext, setCashContext] = useState(null); // { serviceId, planId, couponCode }
  const { currentUser } = useAuth();

  // Fetch the service and its merged plans on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { service, plans } = await fetchServiceWithPlans(id);

        setService(service);
        setPlansArray(plans);

        // Convert array to map for easy lookup by ID
        const map = {};
        plans.forEach(p => {
          map[p.id] = p;
        });
        setPlansMap(map);

        // Set the default selected plan to the first one in the sorted list
        if (plans.length > 0) {
          setSelectedPlanId(plans[0].id);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load service details.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const currentPlan = plansMap[selectedPlanId] || { months: 1, discount: 0, tag: "", description: "", name: "", price: 0 };
  const basePrice = currentPlan.price || 0;
  const pricing = usePricing(
    currentPlan,
    basePrice,
    couponDiscount
  );
  if (isLoading) {
    return <ServiceDetailsSkeleton />;
  }

  if (!service) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-text">
          Service Not Found
        </h1>

        <p className="text-text-secondary">
          The service you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="rounded-full bg-primary px-8 py-3 font-medium text-white transition hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (code) => {
    if (!code.trim()) return;
    try {
      await applyCoupon(code, id, selectedPlanId, paymentMethod);
    } catch (error) {
      console.error("Coupon failed", error);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    await handleCheckoutFlow({
      serviceId: id,
      planId: selectedPlanId,
      paymentMethod,
      couponCode: couponData ? couponData.couponCode : undefined,
      onSuccess: (paymentId) => {
        navigate("/checkout/success");
      },
      onFailure: (errorMsg) => {
        navigate(`/checkout/failure?error=${encodeURIComponent(errorMsg)}`);
      },
      onCashPayment: (context) => {
        setCashContext(context);
        setShowCashModal(true);
      }
    });
  };

  return (
    <div className="relative">
      {checkoutLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-2xl space-y-4 max-w-sm mx-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-bold text-gray-900 text-center">Wait a while...</p>
            <p className="text-sm text-gray-500 text-center">Please do not refresh the page or close the window while the verification is in progress.</p>
          </div>
        </div>
      )}
      <LoginPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CashCodeModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        serviceId={cashContext?.serviceId}
        planId={cashContext?.planId}
        couponCode={cashContext?.couponCode}
      />
      {/* Main Layout */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-5 lg:px-5 py-10 pb-10 lg:pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Left */}
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

          {/* Desktop Summary */}
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

        {/* ================= MOBILE STICKY BAR ================= */}
        <div className="sticky bottom-0 z-40 mt-6 border border-border/20 bg-white/95 p-1 shadow-lg rounded-2xl backdrop-blur-md lg:hidden">
          <button
            onClick={() => setShowOrderSummary(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-xl"
          >
            <div className="text-left">
              <p className="text-xs text-white/80">
                {currentPlan.name}
              </p>

              <p className="text-xl font-bold">
                ₹{pricing.grand.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-2 font-medium">
              View Summary
              <span className="material-symbols-outlined">
                expand_less
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}

      {showOrderSummary && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setShowOrderSummary(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl lg:hidden">

            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-14 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 pb-4">

              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <button
                onClick={() => setShowOrderSummary(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
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

function ServiceDetailsSkeleton() {
  return (
    <div className="relative mx-auto max-w-7xl px-5 py-10 animate-pulse">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <main className="space-y-6 lg:col-span-8">
          {/* ServiceHero Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-24 rounded-full bg-gray-200"></div>
            <div className="h-10 w-3/4 rounded bg-gray-200"></div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 rounded bg-gray-200"></div>
              <div className="h-6 w-24 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
            <div className="aspect-[21/9] w-full rounded-3xl bg-gray-200"></div>
          </div>

          {/* FeatureGrid Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-36 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-gray-50 p-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PlanSelector Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 rounded-3xl border border-gray-50 bg-gray-50/50 p-6">
                  <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                  <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Column (Sidebar) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
              <div className="flex-1 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1 h-10 rounded-full bg-gray-200"></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="border-t border-gray-100 my-3"></div>
              <div className="flex justify-between">
                <div className="h-6 w-16 rounded bg-gray-200"></div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="h-12 w-full rounded-2xl bg-gray-200"></div>
            <div className="h-14 w-full rounded-full bg-gray-200"></div>
          </div>
        </aside>
      </div>
    </div>
  );
}