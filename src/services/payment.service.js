import { verifyPaymentCallable, verifyCashPaymentCallable } from "./cloudFunctions";

export const verifyPaymentService = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  extraData = {}
) => {
  try {
    const payload = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ...extraData,
    };
    const response = await verifyPaymentCallable(payload);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

export const verifyMandateService = async ({ purchaseId, subscriptionId, paymentId, signature }) => {
  try {
    const response = await verifyPaymentCallable({
      action: "VERIFY_MANDATE",
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

export const verifyCashPaymentService = async (serviceId, planId, couponCode, code, SaleBy) => {
  try {
    const payload = { serviceId, planId, couponCode: couponCode || null, code };
    if (SaleBy) {
      payload.SaleBy = SaleBy;
      payload.saleBy = SaleBy;
    }
    const response = await verifyCashPaymentCallable(payload);
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

