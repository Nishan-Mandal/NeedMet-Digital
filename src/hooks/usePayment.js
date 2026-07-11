import { useState } from "react";
import { verifyPaymentService } from "../services/payment.service";

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

      const rzp = new window.Razorpay({
        ...options,
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
      });

      rzp.on("payment.failed", function (response) {
        reject(response.error);
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

  return {
    initiateRazorpayCheckout,
    verifyPayment,
    paymentLoading,
    paymentError,
  };
}
