import { useState } from "react";
import { applyCouponService } from "../services/coupon.service";

export default function useCoupon() {
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponData, setCouponData] = useState(null);

  const applyCoupon = async (code, serviceId, planId, paymentMethod = "ALL") => {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const data = await applyCouponService(code, serviceId, planId, paymentMethod);
      const normalizedData = {
        ...data,
        couponCode: data?.couponCode || data?.code || code,
      };
      setCouponData(normalizedData);
      return normalizedData;
    } catch (err) {
      setCouponError(err.message || "Failed to apply coupon");
      throw err;
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setCouponData(null);
    setCouponError(null);
  };

  return {
    applyCoupon,
    clearCoupon,
    couponLoading,
    couponError,
    couponData,
  };
}
