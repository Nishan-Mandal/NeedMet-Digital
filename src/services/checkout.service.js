import {
  createOrderCallable,
  createSubscriptionCallable,
  verifyMandateCallable,
} from "./cloudFunctions";

export const createOrderService = async (serviceId, planId, paymentMethod, couponCode) => {
  try {
    const response = await createOrderCallable({ serviceId, planId, paymentMethod, couponCode });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Creates or retrieves a recurring subscription for EMI mandate setup.
 * Supports passing an object with { purchaseId } or legacy positional arguments.
 */
export const createSubscriptionService = async (paramsOrServiceId, planId, couponCode) => {
  try {
    let payload;
    if (typeof paramsOrServiceId === "object" && paramsOrServiceId !== null) {
      payload = paramsOrServiceId;
    } else {
      payload = { serviceId: paramsOrServiceId, planId, couponCode };
    }
    const response = await createSubscriptionCallable(payload);
    return response.data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Verifies mandate authorization and activates user plan in Firestore.
 */
export const verifyMandateService = async ({ purchaseId, subscriptionId, paymentId, signature }) => {
  try {
    const response = await verifyMandateCallable({
      purchaseId,
      subscriptionId,
      paymentId: paymentId || null,
      signature: signature || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying mandate:", error);
    throw error;
  }
};
