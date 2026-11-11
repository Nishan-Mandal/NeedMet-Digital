import { useMemo } from "react";

export default function usePricing(plan, basePrice, couponDiscount = 0, paymentMethod = "FULL") {
  return useMemo(() => {
    const total = Number(plan?.finalPrice) || Number(plan?.price) || Number(basePrice) || 0;
    const discountAmount = 0;
    const subtotal = Math.max(total - discountAmount, 0);
    const grand = Math.max(subtotal - couponDiscount, 0);

    const isEmi = paymentMethod === "EMI";
    let upfrontType = "percentage";
    let upfrontValue = 15;
    let upfrontDisplay = "15%";
    let upfrontAmount = 0;
    let remainingAmount = 0;
    let totalCycles = 0;
    let emiAmount = 0;

    if (isEmi && grand > 0) {
      // 1. Determine upfront down payment type ('percentage' or 'fixed')
      upfrontType = plan?.upfrontType || plan?.emiConfig?.upfrontType || "percentage";

      // 2. Determine upfront down payment value (from plan, default 15)
      const rawUpfrontVal =
        plan?.upfrontValue !== undefined && plan?.upfrontValue !== null && plan?.upfrontValue !== ""
          ? plan.upfrontValue
          : plan?.emiConfig?.upfrontValue;

      upfrontValue =
        rawUpfrontVal !== undefined && rawUpfrontVal !== null && rawUpfrontVal !== ""
          ? Number(rawUpfrontVal)
          : 15;

      // 3. Compute upfront amount in rupees and dynamic display string
      if (upfrontType === "percentage") {
        const pct = Math.min(Math.max(upfrontValue, 1), 100);
        upfrontAmount = Math.round(((grand * pct) / 100) * 100) / 100;
        upfrontDisplay = `${pct}%`;
      } else {
        // Fixed amount in rupees
        upfrontAmount = Math.min(Math.max(upfrontValue, 1), grand);
        upfrontDisplay = `₹${upfrontValue.toLocaleString("en-IN")}`;
      }

      // 4. Compute remaining balance after down payment
      remainingAmount = Math.max(Math.round((grand - upfrontAmount) * 100) / 100, 0);

      // 5. Determine total EMI cycles (from plan setting, fallback to duration in months - 1)
      const rawCycles = plan?.totalCycles || plan?.emiConfig?.totalCycles;
      if (rawCycles && Number(rawCycles) > 0) {
        totalCycles = Number(rawCycles);
      } else {
        const durationDays =
          Number(plan?.durationDays) ||
          (plan?.months ? Number(plan.months) * 30 : 30);
        const months = Math.max(Math.round(durationDays / 30), 1);
        totalCycles = Math.max(months - 1, 1);
      }

      // 6. Monthly EMI amount per recurring installment
      emiAmount = totalCycles > 0 ? Math.round((remainingAmount / totalCycles) * 100) / 100 : 0;
    }

    return {
      baseprice: basePrice,
      total,
      subtotal,
      couponDiscount,
      grand,
      isEmi,
      upfrontType,
      upfrontValue,
      upfrontDisplay,
      upfrontAmount,
      remainingAmount,
      totalCycles,
      emiAmount,
    };
  }, [plan, basePrice, couponDiscount, paymentMethod]);
}
