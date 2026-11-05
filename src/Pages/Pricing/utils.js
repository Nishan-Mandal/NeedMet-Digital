/**
 * Utility functions for ServiceDetails and Pricing workflows
 */

/**
 * Returns user-facing step progress and status messaging for checkout loading states
 * @param {string} step - The active checkout step
 * @param {string} paymentMethod - 'FULL' | 'EMI' | 'CASH'
 * @returns {{ step: string, title: string, desc: string }}
 */
export function getCheckoutStepFeedback(step, paymentMethod) {
  if (paymentMethod === "EMI") {
    switch (step) {
      case "initiating":
        return {
          step: "Step 1 of 2",
          title: "Calculating EMI Schedule",
          desc: "Setting up your upfront down payment order...",
        };
      case "upfront_payment":
        return {
          step: "Step 1 of 2",
          title: "Down Payment",
          desc: "Please complete the down payment in the Razorpay overlay...",
        };
      case "verifying_upfront":
        return {
          step: "Step 1 of 2",
          title: "Verifying Down Payment",
          desc: "Payment secured! Preparing your recurring Auto-Pay mandate...",
        };
      case "setting_up_mandate":
        return {
          step: "Step 2 of 2",
          title: "Configuring Auto-Pay",
          desc: "Setting up recurring schedule (first auto-debit in 30 days)...",
        };
      case "authorizing_mandate":
        return {
          step: "Step 2 of 2",
          title: "Authorize Auto-Pay Mandate",
          desc: "Please authorize the monthly recurring mandate (UPI / Card)...",
        };
      case "verifying_mandate":
        return {
          step: "Step 2 of 2",
          title: "Activating Your Plan",
          desc: "Confirming mandate authorization and activating service access...",
        };
      default:
        return {
          step: "Processing",
          title: "Please wait...",
          desc: "Please do not refresh the page or close your browser.",
        };
    }
  }

  return {
    step: "Processing",
    title: "Processing Payment...",
    desc: "Please do not refresh the page or close your browser.",
  };
}

/**
 * Builds URL search parameters for navigation to checkout success page
 * @param {Object} metadata
 * @returns {string} URL search string
 */
export function buildSuccessQueryParams(metadata = {}) {
  const queryParams = new URLSearchParams();
  if (metadata.orderId) queryParams.set("orderId", metadata.orderId);
  if (metadata.purchaseId) queryParams.set("purchaseId", metadata.purchaseId);
  if (metadata.paymentType) queryParams.set("paymentType", metadata.paymentType);
  if (metadata.isEmi !== undefined) queryParams.set("isEmi", String(metadata.isEmi));
  if (metadata.requiresMandate !== undefined) queryParams.set("requiresMandate", String(metadata.requiresMandate));
  if (metadata.serviceId) queryParams.set("serviceId", metadata.serviceId);
  if (metadata.serviceName) queryParams.set("serviceName", metadata.serviceName);
  if (metadata.planId) queryParams.set("planId", metadata.planId);
  if (metadata.planName) queryParams.set("planName", metadata.planName);
  if (metadata.amount !== undefined && metadata.amount !== null) queryParams.set("amount", String(metadata.amount));
  if (metadata.totalAmount !== undefined && metadata.totalAmount !== null) queryParams.set("totalAmount", String(metadata.totalAmount));
  return queryParams.toString();
}

/**
 * Converts a list of plans into a map keyed by plan ID
 * @param {Array} plans
 * @returns {Record<string, Object>}
 */
export function mapPlansById(plans = []) {
  const map = {};
  plans.forEach((p) => {
    map[p.id] = p;
  });
  return map;
}
