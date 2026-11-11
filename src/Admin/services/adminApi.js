import * as couponService from "./Coupons";
import * as cashCodeService from "./cashCodes";
import * as planService from "./Plans";

/**
 * NeedMate Digital Admin API Unified Gateway.
 * Exposes core domain services for Plans, Coupons, and Cash Codes.
 */
export const adminApi = {
  // Subscription Plans & Digital Services
  ...planService,

  // Coupons Management
  ...couponService,

  // Cash Codes Management
  ...cashCodeService,
};

export default adminApi;
