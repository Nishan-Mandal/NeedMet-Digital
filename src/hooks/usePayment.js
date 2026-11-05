import { useState } from "react";
import { verifyPaymentService, verifyMandateService } from "../services/payment.service";

export default function usePayment() {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  /**
   * Initializes Razorpay checkout overlay.
   * @param {Object} options Razorpay configuration options
   * @returns {Promise<Object>} Resolves with the Razorpay payment response
   */
  const initiateRazorpayCheckout = (options) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      let isCompleted = false;
      let lastFailure = null;

      const rzp = new window.Razorpay({
        ...options,
        handler: function (response) {
          isCompleted = true;
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            if (!isCompleted) {
              if (lastFailure) {
                const err = new Error(lastFailure.description || lastFailure.reason || "Payment cancelled or failed");
                err.code = lastFailure.code;
                err.details = lastFailure;
                reject(err);
              } else {
                reject(new Error("Payment cancelled by user"));
              }
            }
          },
        },
      });

      rzp.on("payment.failed", function (response) {
        console.warn("Razorpay in-modal payment attempt failed (popup still open for retry):", response.error);
        lastFailure = response.error;
        // Do NOT reject the checkout promise here!
        // Razorpay modal remains open and allows the customer to retry with another
        // UPI app, card, or payment method without breaking the checkout session.
      });

      rzp.open();
    });
  };

  /**
   * Verifies the Razorpay signature via Cloud Functions
   */
  const verifyPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const data = await verifyPaymentService(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      return data;
    } catch (err) {
      setPaymentError(err.message || "Payment verification failed");
      throw err;
    } finally {
      setPaymentLoading(false);
    }
  };

  /**
   * Verifies the Razorpay subscription mandate authorization via Cloud Functions
   */
  const verifyMandate = async ({ purchaseId, subscriptionId, paymentId, signature }) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const data = await verifyMandateService({ purchaseId, subscriptionId, paymentId, signature });
      return data;
    } catch (err) {
      setPaymentError(err.message || "Mandate verification failed");
      throw err;
    } finally {
      setPaymentLoading(false);
    }
  };

  return {
    initiateRazorpayCheckout,
    verifyPayment,
    verifyMandate,
    paymentLoading,
    paymentError,
  };
}

