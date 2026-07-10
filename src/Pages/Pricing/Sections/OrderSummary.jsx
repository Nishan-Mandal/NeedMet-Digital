import Container from "../../../Components/layout/Container";

import CouponInput from "./CouponInput";
import PaymentSelector from "./PaymentSelector";
import PriceBreakdown from "./PriceBreakDown";
import CheckoutButton from "./CheckoutButton";
import HelpCard from "./HelpCard";

export default function OrderSummary({ currentPlan, pricing, paymentMethod, setPaymentMethod, onApplyCoupon, couponMessage, couponLoading, onCheckout, checkoutLoading }) {
    return (
        <div
            className=" rounded-3xl" >
            <div className="space-y-4 sticky top-24">
                <div className=" rounded-3xl p-3 bg-white shadow-xl">
                    <h2 className="mb-2 text-2xl font-bold border-b-1 border-gray-200/30  text-[#0F5C3E]"> Order Summary  </h2>
                    <PriceBreakdown plan={currentPlan} pricing={pricing} />

                    <div className="my-3">
                        <CouponInput
                            onApply={onApplyCoupon}
                            message={couponMessage}
                            isLoading={couponLoading}
                        />
                    </div>
                    <PaymentSelector
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod} />
                    <div className="mt-6">
                        <CheckoutButton onClick={onCheckout} isLoading={checkoutLoading} />
                    </div>
                    <div className=" mt-1 pt-1 flex items-center justify-center gap-1 text-secondary text-label-sm text-xs">
                        <span className="material-symbols-outlined icon-sm">lock</span>
                        Secure, encrypted transaction
                    </div>
                </div>
                <HelpCard />
            </div>
        </div>


    );

}
