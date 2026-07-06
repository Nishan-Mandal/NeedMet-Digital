import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

/**
 * Creates an order in the backend.
 * @param {Object} data 
 * @param {string} data.serviceId
 * @param {string} data.planId
 * @param {string} data.paymentMethod - e.g., "Full" or "Split"
 * @param {string} [data.couponCode]
 * @returns {Promise<Object>} The order details including Razorpay order ID if applicable.
 */
export const createOrderCallable = httpsCallable(functions, "createOrder");

/**
 * Verifies a Razorpay payment.
 * @param {Object} data 
 * @param {string} data.razorpay_order_id
 * @param {string} data.razorpay_payment_id
 * @param {string} data.razorpay_signature
 * @returns {Promise<Object>} The verification result.
 */
export const verifyPaymentCallable = httpsCallable(functions, "verifyPayment");

/**
 * Verifies a cash payment (if you have manual codes or similar).
 * @param {Object} data 
 * @param {string} data.orderId
 * @param {string} data.cashCode
 * @returns {Promise<Object>}
 */
export const verifyCashPaymentCallable = httpsCallable(functions, "verifyCashPayment");

/**
 * Applies a coupon to check discount.
 * @param {Object} data 
 * @param {string} data.couponCode
 * @param {string} data.planId
 * @returns {Promise<Object>} Result containing discount amount and new total.
 */
export const applyCouponCallable = httpsCallable(functions, "applyCoupon");

/**
 * Creates a subscription record after successful payment.
 * @param {Object} data 
 * @param {string} data.orderId
 * @returns {Promise<Object>} The subscription details.
 */
export const createSubscriptionCallable = httpsCallable(functions, "createSubscription");

// Additional Cloud Functions mentioned in requirements
export const generateCouponCallable = httpsCallable(functions, "generateCoupon");
export const generateCashCodesCallable = httpsCallable(functions, "generateCashCodes");
export const razorpayWebhookCallable = httpsCallable(functions, "razorpayWebhook");
export const sendListingNotificationCallable = httpsCallable(functions, "sendListingNotification");
export const sendChatNotificationCallable = httpsCallable(functions, "sendChatNotification");
export const generateDailyCombinedReportCallable = httpsCallable(functions, "generateDailyCombinedReport");
export const syncCategoriesCallable = httpsCallable(functions, "syncCategories");
