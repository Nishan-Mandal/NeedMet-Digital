import { useState } from "react";
import { createOrderService, createSubscriptionService } from "../services/checkout.service";
import { clearUserPurchasesCache, recordPurchase, deletePendingPurchase } from "../services/db";
import usePayment from "./usePayment";
import useAuth from "./useAuth";

export default function useCheckout() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(null); // "initiating" | "upfront_payment" | "verifying_upfront" | "setting_up_mandate" | "authorizing_mandate" | "verifying_mandate" | "mandate_pending"
  const [checkoutError, setCheckoutError] = useState(null);
  const [pendingMandate, setPendingMandate] = useState(null); // { purchaseId, subscriptionId, razorpayKeyId }

  const { currentUser } = useAuth();
  const { initiateRazorpayCheckout, verifyPayment, verifyMandate } = usePayment();

  const handleCheckoutFlow = async ({
    serviceId,
    planId,
    paymentMethod,
    couponCode,
    serviceDetails,
    onSuccess,
    onFailure,
    onCashPayment,
  }) => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutStep("initiating");
    let createdOrderId = null;

    try {
      // 1. Handle CASH payment
      if (paymentMethod === "CASH") {
        if (onCashPayment) {
          onCashPayment({ serviceId, planId, couponCode: couponCode || null, serviceDetails });
        }
        setCheckoutStep(null);
        return;
      }

      // 2. Handle FULL (One-time) payment
      if (paymentMethod === "FULL" || paymentMethod === "BANKING") {
        const orderResponse = await createOrderService(serviceId, planId, paymentMethod, couponCode);
        const { razorpayOrderId, amount, currency, razorpayKeyId } = orderResponse;
        createdOrderId = razorpayOrderId;

        if (!razorpayKeyId) throw new Error("Missing Razorpay Key ID");

        setCheckoutStep("payment");
        const paymentResponse = await initiateRazorpayCheckout({
          key: razorpayKeyId,
          name: "NeedMet Digital",
          description: "Full Service Purchase",
          notes: {
            ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
            ...(serviceId ? { serviceId } : {}),
            ...(planId ? { planId } : {}),
            paymentMethod: paymentMethod || "FULL",
            orderId: razorpayOrderId,
            purchaseId: razorpayOrderId,
          },
          amount: amount,
          currency: currency || "INR",
          order_id: razorpayOrderId,
          theme: { color: "#0F5C3E" },
        });

        setCheckoutStep("verifying");
        await verifyPayment(
          paymentResponse.razorpay_order_id || razorpayOrderId,
          paymentResponse.razorpay_payment_id,
          paymentResponse.razorpay_signature
        );

        const paidAmountRupees =
          serviceDetails?.finalPrice !== undefined && serviceDetails?.finalPrice !== null
            ? Number(serviceDetails.finalPrice)
            : Number(amount) > 0
            ? Number(amount) / 100
            : Number(amount);
        const fullDurationDays = Number(serviceDetails?.durationDays) || 92;
        const nowFull = new Date();
        const endFullDate = new Date(nowFull.getTime() + fullDurationDays * 24 * 60 * 60 * 1000);

        const purchaseRecord = {
          purchaseId: razorpayOrderId,
          orderId: razorpayOrderId,
          userId: currentUser?.uid || "anonymous",
          userName: currentUser?.displayName || currentUser?.email || "Customer",
          userEmail: currentUser?.email || "",
          paymentMethod: "FULL",
          status: "ACTIVE",
          itemSnapshot: {
            serviceId: serviceId,
            serviceTitle: serviceDetails?.serviceName || "NeedMet Digital",
            planId: planId,
            planTitle: serviceDetails?.planName || "Service Plan",
            category: serviceDetails?.category || "Digital Marketing",
            imageUrl: Array.isArray(serviceDetails?.imageUrl) ? serviceDetails.imageUrl[0] : (serviceDetails?.imageUrl || ""),
            durationDays: fullDurationDays,
            features: serviceDetails?.features || [],
          },
          pricing: {
            originalPrice: Number(serviceDetails?.basePrice) || paidAmountRupees,
            discountAmount: Math.max(0, (Number(serviceDetails?.basePrice) || paidAmountRupees) - paidAmountRupees),
            finalPrice: Number(serviceDetails?.finalPrice) || paidAmountRupees,
            upfrontAmount: paidAmountRupees,
            remainingAmount: 0,
            couponCode: couponCode || null,
          },
          accessWindow: {
            activatedAt: nowFull.toISOString(),
            expiresAt: endFullDate.toISOString(),
          },
          upfrontPayment: {
            paymentId: paymentResponse.razorpay_payment_id,
            paidAt: nowFull.toISOString(),
            amount: paidAmountRupees,
          },
          mandate: null,
          // Backward compatibility fields
          serviceId: serviceId,
          serviceName: serviceDetails?.serviceName || "NeedMet Digital",
          planId: planId,
          planName: serviceDetails?.planName || "Service Plan",
          category: serviceDetails?.category || "Digital Marketing",
          imageUrl: serviceDetails?.imageUrl || [],
          isEmi: false,
          amount: paidAmountRupees,
          duration: serviceDetails?.duration || `${fullDurationDays} Days`,
          durationDays: fullDurationDays,
          planType: serviceDetails?.planType || serviceDetails?.duration || `${fullDurationDays} Days`,
          startDate: nowFull.toISOString(),
          endDate: endFullDate.toISOString(),
          planAccessStatus: "active",
        };

        try {
          await recordPurchase(purchaseRecord);
        } catch (dbErr) {
          console.warn("Failed to persist purchase client-side:", dbErr);
        }

        setCheckoutStep(null);
        clearUserPurchasesCache(currentUser?.uid);

        if (onSuccess) {
          onSuccess(paymentResponse.razorpay_payment_id, {
            ...purchaseRecord,
            paymentType: "FULL",
            orderId: razorpayOrderId,
          });
        }
        return;
      }

      // 3. Handle EMI (Optimized 2-Step Flow)
      if (paymentMethod === "EMI") {
        // Step 1A: Create order for 15% upfront down payment
        const orderResponse = await createOrderService(serviceId, planId, "EMI", couponCode);
        const { razorpayOrderId, amount, currency, razorpayKeyId } = orderResponse;
        createdOrderId = razorpayOrderId;

        if (!razorpayKeyId) throw new Error("Missing Razorpay Key ID");

        // Step 1B: Customer pays 15% down payment via one-time Razorpay checkout
        setCheckoutStep("upfront_payment");
        const upfrontResponse = await initiateRazorpayCheckout({
          key: razorpayKeyId,
          name: "NeedMet Digital",
          description: `EMI Down Payment (${serviceDetails?.upfrontDisplay ? `${serviceDetails.upfrontDisplay} ` : ""}Upfront)`,
          notes: {
            ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
            ...(serviceId ? { serviceId } : {}),
            ...(planId ? { planId } : {}),
            paymentMethod: "EMI",
            flow: "EMI_UPFRONT",
            orderId: razorpayOrderId,
            purchaseId: razorpayOrderId,
          },
          amount: amount,
          currency: currency || "INR",
          order_id: razorpayOrderId,
          theme: { color: "#0F5C3E" },
        });

        // Step 1C: Verify upfront payment & persist to Firestore purchases & payments
        setCheckoutStep("verifying_upfront");
        await verifyPayment(
          upfrontResponse.razorpay_order_id || razorpayOrderId,
          upfrontResponse.razorpay_payment_id,
          upfrontResponse.razorpay_signature
        );

        const upfrontAmountRupees =
          serviceDetails?.upfrontAmount !== undefined && serviceDetails?.upfrontAmount !== null
            ? Number(serviceDetails.upfrontAmount)
            : Number(amount) > 0
            ? Number(amount) / 100
            : Number(amount);
        const totalCycles = Number(serviceDetails?.totalCycles) || 3;
        const finalPrice =
          Number(serviceDetails?.finalPrice) ||
          (upfrontAmountRupees > 0 ? upfrontAmountRupees / 0.15 : 0);
        const emiAmount =
          Number(serviceDetails?.emiAmount) ||
          (totalCycles > 0 ? (finalPrice - upfrontAmountRupees) / totalCycles : 0);

        const emiDurationDays = Number(serviceDetails?.durationDays) || 92;
        const nowEmi = new Date();
        const endEmiDate = new Date(nowEmi.getTime() + emiDurationDays * 24 * 60 * 60 * 1000);

        const purchaseRecord = {
          purchaseId: razorpayOrderId,
          orderId: razorpayOrderId,
          userId: currentUser?.uid || "anonymous",
          userName: currentUser?.displayName || currentUser?.email || "Customer",
          userEmail: currentUser?.email || "",
          paymentMethod: "EMI",
          status: "PENDING_MANDATE",
          itemSnapshot: {
            serviceId: serviceId,
            serviceTitle: serviceDetails?.serviceName || "NeedMet Digital",
            planId: planId,
            planTitle: serviceDetails?.planName || "Service Plan (EMI)",
            category: serviceDetails?.category || "Digital Marketing",
            imageUrl: Array.isArray(serviceDetails?.imageUrl) ? serviceDetails.imageUrl[0] : (serviceDetails?.imageUrl || ""),
            durationDays: emiDurationDays,
            features: serviceDetails?.features || [],
          },
          pricing: {
            originalPrice: Number(serviceDetails?.basePrice) || finalPrice,
            discountAmount: Math.max(0, (Number(serviceDetails?.basePrice) || finalPrice) - finalPrice),
            finalPrice: finalPrice,
            upfrontAmount: upfrontAmountRupees,
            remainingAmount: Math.max(0, finalPrice - upfrontAmountRupees),
            couponCode: couponCode || null,
          },
          accessWindow: {
            activatedAt: nowEmi.toISOString(),
            expiresAt: endEmiDate.toISOString(),
          },
          upfrontPayment: {
            paymentId: upfrontResponse.razorpay_payment_id,
            paidAt: nowEmi.toISOString(),
            amount: upfrontAmountRupees,
          },
          mandate: {
            subscriptionId: null,
            status: "PENDING",
            totalCycles: totalCycles,
            paidCycles: 0,
            emiAmount: emiAmount,
            nextDebitDate: null,
            lastChargedAt: null,
            installments: [],
          },
          // Backward compatibility fields
          serviceId: serviceId,
          serviceName: serviceDetails?.serviceName || "NeedMet Digital",
          planId: planId,
          planName: serviceDetails?.planName || "Service Plan (EMI)",
          category: serviceDetails?.category || "Digital Marketing",
          imageUrl: serviceDetails?.imageUrl || [],
          isEmi: true,
          amount: upfrontAmountRupees,
          duration: serviceDetails?.duration || `${emiDurationDays} Days`,
          durationDays: emiDurationDays,
          planType: serviceDetails?.planType || serviceDetails?.duration || `${emiDurationDays} Days`,
          startDate: nowEmi.toISOString(),
          endDate: endEmiDate.toISOString(),
          planAccessStatus: "pending_mandate",
        };

        try {
          await recordPurchase(purchaseRecord);
        } catch (dbErr) {
          console.warn("Failed to persist EMI purchase client-side:", dbErr);
        }

        setCheckoutStep(null);
        clearUserPurchasesCache(currentUser?.uid);

        if (onSuccess) {
          onSuccess(upfrontResponse.razorpay_payment_id, {
            ...purchaseRecord,
            paymentType: "EMI",
            isEmi: true,
            upfrontCaptured: true,
            requiresMandate: true,
            purchaseId: razorpayOrderId,
            orderId: razorpayOrderId,
            amount: upfrontAmountRupees,
          });
        }
        return;
      }

      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    } catch (err) {
      if (createdOrderId) {
        deletePendingPurchase(createdOrderId);
        clearUserPurchasesCache(currentUser?.uid);
      }
      const errorMessage = err.message || "Checkout process failed";
      setCheckoutError(errorMessage);
      console.error("Checkout flow error:", err);
      if (onFailure) {
        onFailure(errorMessage);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  /**
   * Resumes mandate authorization for a purchase whose upfront fee is already captured.
   * Ensures an active subscription exists before opening Razorpay checkout.
   */
  const resumeMandateAuthorization = async ({
    purchaseId,
    subscriptionId = null,
    razorpayKeyId = null,
    onSuccess,
    onFailure,
  }) => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      let activeSubId = subscriptionId;
      let activeKey = razorpayKeyId;

      if (!activeSubId || !activeKey) {
        setCheckoutStep("setting_up_mandate");
        const subResponse = await createSubscriptionService({ purchaseId });
        activeSubId = subResponse.subscriptionId;
        activeKey = subResponse.razorpayKeyId || activeKey;
      }

      setCheckoutStep("authorizing_mandate");
      const mandateResponse = await initiateRazorpayCheckout({
        key: activeKey,
        name: "NeedMet Digital",
        description: "Authorize Monthly Auto-Pay Mandate",
        subscription_id: activeSubId,
        theme: { color: "#0F5C3E" },
      });

      setCheckoutStep("verifying_mandate");
      await verifyMandate({
        purchaseId,
        subscriptionId: activeSubId,
        paymentId: mandateResponse.razorpay_payment_id,
        signature: mandateResponse.razorpay_signature,
      });

      const mandateUpdate = {
        purchaseId,
        mandate: {
          status: "AUTHORIZED",
          subscriptionId: activeSubId,
          paymentId: mandateResponse.razorpay_payment_id,
          authorizedAt: new Date().toISOString(),
        },
        status: "ACTIVE",
        accessWindow: {
          activatedAt: new Date().toISOString(),
        },
        planAccessStatus: "active",
      };

      try {
        await recordPurchase(mandateUpdate);
      } catch (dbErr) {
        console.warn("Failed to update mandate status:", dbErr);
      }

      setPendingMandate(null);
      setCheckoutStep(null);
      clearUserPurchasesCache(currentUser?.uid);

      if (onSuccess) {
        onSuccess(mandateResponse.razorpay_payment_id, {
          purchaseId,
          paymentType: "MANDATE_AUTHORIZED",
          isEmi: true,
          subscriptionId: activeSubId,
        });
      }
    } catch (err) {
      const errorMessage = err.message || "Mandate authorization failed";
      setCheckoutError(errorMessage);
      setCheckoutStep("mandate_pending");
      console.error("Resume mandate error:", err);
      if (onFailure) {
        onFailure(errorMessage);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };


  return {
    handleCheckoutFlow,
    resumeMandateAuthorization,
    checkoutLoading,
    checkoutStep,
    checkoutError,
    pendingMandate,
  };
}

