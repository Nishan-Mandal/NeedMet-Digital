import * as couponService from "../features/coupons/services/Coupons";
import * as cashCodeService from "../features/cashcodes/services/cashCodes";
import * as planService from "../features/plans/services/Plans";
import * as purchaseService from "../features/purchases/services/Purchases";
import * as paymentService from "../features/payments/services/Payments";

/**
 * NeedMate Digital Admin API Unified Gateway.
 * Exposes core domain services for Plans, Coupons, Cash Codes, Purchases, and Payments.
 */
export const adminApi = {
  // Subscription Plans & Digital Services
  ...planService,

  // Coupons Management
  ...couponService,

  // Cash Codes Management
  ...cashCodeService,

  // Purchases & Orders
  ...purchaseService,

  // Payments & Transactions
  ...paymentService,
};

export default adminApi;

