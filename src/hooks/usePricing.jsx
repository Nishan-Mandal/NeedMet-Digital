import { useMemo } from "react";

export default function usePricing(plan, basePrice, couponDiscount = 0) {

    return useMemo(() => {
        const total = plan.price || 0;
        const discountAmount = 0;
        const subtotal = Math.max(total - discountAmount, 0);
        const grand = subtotal - couponDiscount;

        return {
            baseprice: basePrice,
            total,
            subtotal,
            couponDiscount,
            grand: Math.max(grand, 0),
        };

    }, [plan, basePrice, couponDiscount]);

}
