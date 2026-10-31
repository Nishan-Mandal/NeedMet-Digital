import { verifyPaymentCallable, verifyCashPaymentCallable, verifyMandateCallable } from "./cloudFunctions";

export const verifyPaymentService = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const response = await verifyPaymentCallable({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

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
    console.warn("verifyMandateCallable error, falling back to public verifyPayment:", error);
    try {
      const fallbackResponse = await verifyPaymentCallable({
        action: "VERIFY_MANDATE",
        purchaseId,
        subscriptionId,
        paymentId: paymentId || null,
        signature: signature || null,
      });
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error("Error verifying mandate via fallback:", fallbackError);
      throw fallbackError;
    }
  }
};

export const verifyCashPaymentService = async (serviceId, planId, couponCode, code) => {
  try {
    const response = await verifyCashPaymentCallable({ serviceId, planId, couponCode: couponCode || null, code });
    return response.data;
  } catch (error) {
    console.error("Error verifying cash payment:", error);
    throw error;
  }
};

export const syncPaymentService = async (paymentId) => {
  try {
    const response = await verifyPaymentCallable({
      action: "SYNC_PAYMENT",
      paymentId,
    });
    return response.data;
  } catch (error) {
    console.error("Error syncing payment:", error);
    throw error;
  }
};

