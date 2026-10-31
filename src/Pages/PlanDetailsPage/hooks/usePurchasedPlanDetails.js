import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import useCheckout from "../../../hooks/useCheckout";
import { fetchPurchaseById, clearUserPurchasesCache } from "../../../services/db";
import { calculateAuthoritativeFinancials } from "../../Profile/utils/profile.utils";
import {
  checkIsEmi,
  getStatusConfig,
  formatPlanDate,
  derivePurchaseReference,
  copyToClipboardSafe,
} from "../utils/planDetails.utils";

export default function usePurchasedPlanDetails() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // One-time banner shown only once immediately after mandate verification
  const [showVerifiedOnce, setShowVerifiedOnce] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isJustVerified =
        urlParams.get("mandate_authorized") === "true" ||
        urlParams.get("verified") === "true" ||
        urlParams.get("mandate_success") === "true";
      if (!isJustVerified) return false;
      const key = `mandate_verified_dismissed_${purchaseId}`;
      const alreadySeen = sessionStorage.getItem(key);
      if (!alreadySeen) {
        sessionStorage.setItem(key, "true");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const {
    resumeMandateAuthorization,
    checkoutLoading,
    checkoutStep,
    checkoutError,
  } = useCheckout();

  // Redirect unauthenticated visitors
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate(`/login?redirect=/profile/plans/${encodeURIComponent(purchaseId || "")}`);
    }
  }, [currentUser, authLoading, navigate, purchaseId]);

  // Load single purchase
  const loadPurchaseData = useCallback(async () => {
    if (!currentUser?.uid || !purchaseId) return;
    setLoading(true);
    try {
      const data = await fetchPurchaseById(purchaseId, currentUser.uid);
      setPurchase(data);
    } catch (err) {
      console.error("Error loading purchase details:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, purchaseId]);

  useEffect(() => {
    if (currentUser?.uid && purchaseId) {
      loadPurchaseData();
    }
  }, [currentUser, purchaseId, loadPurchaseData]);

  // Resume Mandate
  const handleResumeMandate = useCallback(async () => {
    if (!purchase) return;
    const pId = purchase.id || purchase.purchaseId || purchase.orderId || purchase.razorpayOrderId;
    setFeedbackMessage(null);

    await resumeMandateAuthorization({
      purchaseId: pId,
      subscriptionId: purchase.mandate?.subscriptionId || null,
      razorpayKeyId: purchase.mandate?.razorpayKeyId || null,
      onSuccess: () => {
        clearUserPurchasesCache(currentUser?.uid);
        navigate(
          `/checkout/success?paymentType=MANDATE_AUTHORIZED&purchaseId=${encodeURIComponent(pId)}&serviceName=${encodeURIComponent(purchase.serviceName || "")}&planName=${encodeURIComponent(purchase.planName || "")}&amount=${encodeURIComponent(purchase.pricing?.upfrontAmount || purchase.amount || 0)}`
        );
      },
      onFailure: (err) => {
        setFeedbackMessage({
          type: "error",
          text: err || "Failed to authorize mandate. Please try again.",
        });
      },
    });
  }, [purchase, currentUser, resumeMandateAuthorization, navigate]);

  // Clipboard copy handler
  const copyToClipboard = useCallback(async (text, key) => {
    if (!text) return;
    await copyToClipboardSafe(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  // Format date helper scoped to current purchase
  const formatDate = useCallback(
    (dateVal) => {
      const fallback = purchase?.createdAt || purchase?.startDate || Date.now();
      return formatPlanDate(dateVal, fallback);
    },
    [purchase]
  );

  // Derived calculations
  const isEmi = useMemo(() => checkIsEmi(purchase), [purchase]);
  const isMandateAuthorized = purchase?.mandate?.status === "authorized";
  const isPlanActive =
    (purchase?.planAccessStatus === "active" || purchase?.status === "active") &&
    (!isEmi || isMandateAuthorized);
  const isMandateNeeded = isEmi && !isMandateAuthorized;
  const statusConfig = useMemo(() => getStatusConfig(purchase), [purchase]);

  const financials = useMemo(
    () => calculateAuthoritativeFinancials(purchase),
    [purchase]
  );
  const pricing = purchase?.pricing || {};
  const upfrontPaid = Number(
    financials.upfrontPaid ?? pricing.upfrontAmount ?? purchase?.upfrontAmount ?? 0
  );
  const totalCycles = Number(
    pricing.totalCycles ?? purchase?.mandate?.totalCount ?? 0
  );
  const emiAmount = Number(pricing.emiAmount ?? 0);
  const verifiedPaid = Number(financials.verifiedPaid ?? upfrontPaid);
  const purchaseRef = useMemo(() => derivePurchaseReference(purchase), [purchase]);

  return {
    purchaseId,
    purchase,
    loading: authLoading || (loading && !purchase),
    notFound: !loading && !purchase,
    copiedKey,
    copyToClipboard,
    feedbackMessage,
    setFeedbackMessage,
    showVerifiedOnce,
    setShowVerifiedOnce,
    handleResumeMandate,
    checkoutLoading,
    checkoutStep,
    checkoutError,
    formatDate,
    isEmi,
    isMandateAuthorized,
    isPlanActive,
    isMandateNeeded,
    statusConfig,
    financials,
    pricing,
    upfrontPaid,
    totalCycles,
    emiAmount,
    verifiedPaid,
    purchaseRef,
  };
}

