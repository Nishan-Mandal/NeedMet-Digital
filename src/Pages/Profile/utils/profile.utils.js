/**
 * Derives tamper-proof, authoritative financial summary directly from verified transaction records.
 * Solves stale stored balances and non-atomic webhook increments.
 */
export function calculateAuthoritativeFinancials(purchase) {
  if (!purchase) {
    return {
      isEmi: false,
      planTotal: 0,
      upfrontPaid: 0,
      isUpfrontPaid: false,
      verifiedPaid: 0,
      remainingBalance: 0,
      paidPercent: 0,
      installments: [],
    };
  }

  const isEmi =
    String(purchase.paymentMethod || purchase.paymentType || "").toUpperCase() === "EMI" ||
    purchase.isEmi === true ||
    Boolean(purchase.mandate);

  const pricing = purchase.pricing || {};
  const planTotal = Number(pricing.finalPrice ?? purchase.amount ?? purchase.price ?? 0);

  // Upfront verification check
  const upfrontStatus = purchase.upfrontPayment?.status || (purchase.paymentId ? "captured" : "pending");
  const isUpfrontPaid =
    upfrontStatus === "captured" ||
    upfrontStatus === "success" ||
    Boolean(purchase.paymentId) ||
    Boolean(purchase.upfrontPayment?.paymentId);

  const upfrontPaid = Number(
    pricing.upfrontAmount ??
      purchase.upfrontAmount ??
      purchase.upfrontPayment?.amount ??
      (isEmi ? Math.round(planTotal * 0.15 * 100) / 100 : planTotal)
  );

  // Verified installments sum
  const installments = Array.isArray(pricing.installments) ? pricing.installments : [];
  const verifiedInstallmentsSum = installments
    .filter((inst) => inst.status === "paid" || inst.status === "completed")
    .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);

  const isFullPaidCompleted =
    !isEmi && (purchase.status === "completed" || purchase.planAccessStatus === "active");

  const verifiedPaid = isEmi
    ? (isUpfrontPaid ? upfrontPaid : 0) + verifiedInstallmentsSum
    : isFullPaidCompleted
    ? planTotal
    : isUpfrontPaid
    ? upfrontPaid
    : 0;

  const remainingBalance = Math.max(0, Math.round((planTotal - verifiedPaid) * 100) / 100);
  const paidPercent = planTotal > 0 ? Math.min(100, Math.round((verifiedPaid / planTotal) * 100)) : 0;

  return {
    isEmi,
    planTotal,
    upfrontPaid,
    isUpfrontPaid,
    verifiedPaid,
    remainingBalance,
    paidPercent,
    installments,
  };
}

/**
 * Reconciles and safely deduplicates purchases from authoritative 'purchases' collection
 * and user entitlements in 'users/{uid}.plans'.
 * - Never hides legitimate separate purchases.
 * - Prevents duplicate rendering of the same purchase record.
 */
export function reconcileUserPurchases(purchasesData = [], plansData = [], servicesData = []) {
  const purchaseMap = new Map();
  const knownIdToKey = new Map();

  const extractIds = (item) => {
    return [
      item.id,
      item.purchaseId,
      item.orderId,
      item.razorpayOrderId,
      item.paymentId,
      item.upfrontPayment?.paymentId,
      item.mandate?.subscriptionId,
    ].filter((id) => Boolean(id) && typeof id === "string" && id.trim().length > 0);
  };

  // 1. Process authoritative purchases collection records first
  purchasesData.forEach((purchase, idx) => {
    const ids = extractIds(purchase);
    let canonicalKey = ids.find((id) => knownIdToKey.has(id));
    if (canonicalKey) {
      canonicalKey = knownIdToKey.get(canonicalKey);
    } else {
      canonicalKey = purchase.id || purchase.purchaseId || purchase.orderId || `purchase-${idx}`;
    }

    ids.forEach((id) => knownIdToKey.set(id, canonicalKey));
    knownIdToKey.set(canonicalKey, canonicalKey);

    if (!purchaseMap.has(canonicalKey)) {
      purchaseMap.set(canonicalKey, {
        ...purchase,
        id: canonicalKey,
        purchaseId: canonicalKey,
      });
    } else {
      const existing = purchaseMap.get(canonicalKey);
      purchaseMap.set(canonicalKey, {
        ...existing,
        ...purchase,
        pricing: { ...(existing.pricing || {}), ...(purchase.pricing || {}) },
        mandate: { ...(existing.mandate || {}), ...(purchase.mandate || {}) },
      });
    }
  });

  // 2. Process legacy / entitlement records from users/{uid}.plans
  plansData.forEach((planItem, idx) => {
    const ids = extractIds(planItem);
    let matchedKey = ids.find((id) => knownIdToKey.has(id));

    if (matchedKey) {
      matchedKey = knownIdToKey.get(matchedKey);
      const existing = purchaseMap.get(matchedKey);
      if (existing) {
        if (!existing.startDate && planItem.startDate) existing.startDate = planItem.startDate;
        if (!existing.endDate && planItem.endDate) existing.endDate = planItem.endDate;
      }
    } else {
      // Check if plan matches an existing purchase by planName and serviceName
      const alreadyRepresented = Array.from(purchaseMap.values()).some((p) => {
        const samePlan = p.planName && planItem.planName && p.planName.toLowerCase() === planItem.planName.toLowerCase();
        const sameService = p.serviceName && planItem.serviceName && p.serviceName.toLowerCase() === planItem.serviceName.toLowerCase();
        return samePlan && sameService && p.status === (planItem.status || "active");
      });

      if (!alreadyRepresented) {
        const newKey = planItem.purchaseId || planItem.paymentId || `user-plan-${idx}`;
        const newPurchase = {
          id: newKey,
          purchaseId: newKey,
          planName: planItem.planName || "Service Plan",
          serviceName: planItem.serviceName || "NeedMet Digital",
          planType: planItem.planType || "Monthly",
          amount: planItem.amount || 0,
          paymentMethod: planItem.paymentType || "FULL",
          planAccessStatus: planItem.status || "active",
          status: planItem.status || "active",
          startDate: planItem.startDate,
          endDate: planItem.endDate,
          createdAt: planItem.startDate,
        };
        purchaseMap.set(newKey, newPurchase);
        ids.forEach((id) => knownIdToKey.set(id, newKey));
      }
    }
  });

  // 3. Enrich purchases with catalog service data (description, title, image, category)
  if (Array.isArray(servicesData) && servicesData.length > 0) {
    const serviceMap = new Map();
    servicesData.forEach((s) => {
      if (s.id) serviceMap.set(String(s.id).toLowerCase(), s);
      if (s.serviceId) serviceMap.set(String(s.serviceId).toLowerCase(), s);
      if (s.title) serviceMap.set(String(s.title).trim().toLowerCase(), s);
    });

    purchaseMap.forEach((p) => {
      const match =
        serviceMap.get(String(p.serviceId || "").toLowerCase()) ||
        serviceMap.get(String(p.title || p.serviceName || "").trim().toLowerCase()) ||
        Array.from(serviceMap.values()).find((s) => {
          const sTitle = (s.title || "").toLowerCase();
          const pTitle = (p.title || p.serviceName || "").toLowerCase();
          return sTitle && pTitle && (sTitle.includes(pTitle) || pTitle.includes(sTitle));
        });

      if (match) {
        if (!p.description && match.description) p.description = match.description;
        if (!p.title && match.title) p.title = match.title;
        if (!p.category && match.category) p.category = match.category;
        if (!p.imageUrl && match.imageUrl) p.imageUrl = match.imageUrl;
        if (!p.tags && match.tags) p.tags = match.tags;
      }
    });
  }

  return Array.from(purchaseMap.values());
}

/**
 * Checks whether an EMI purchase requires AutoPay setup.
 */
export function isPurchasePendingMandate(p) {
  if (!p) return false;
  const isEmi =
    String(p.paymentMethod || p.paymentType || "").toUpperCase() === "EMI" ||
    p.isEmi === true ||
    Boolean(p.mandate);
  const isMandateAuthorized = p.mandate?.status === "authorized";
  const isPlanActive = p.planAccessStatus === "active" || p.status === "active";
  return isEmi && !isMandateAuthorized && !isPlanActive;
}

/**
 * Checks whether a purchase is actively deliverable.
 */
export function isPurchaseActive(p) {
  if (!p) return false;
  const isEmi =
    String(p.paymentMethod || p.paymentType || "").toUpperCase() === "EMI" ||
    p.isEmi === true ||
    Boolean(p.mandate);
  const isMandateAuthorized = p.mandate?.status === "authorized";
  if (isEmi && !isMandateAuthorized) return false;
  return p.planAccessStatus === "active" || p.status === "active";
}

/**
 * Checks whether a purchase lifecycle is completed.
 */
export function isPurchaseCompleted(p) {
  if (!p) return false;
  return p.status === "completed" || p.planAccessStatus === "completed";
}

/**
 * Checks whether a purchase is in processing state.
 */
export function isPurchaseProcessing(p) {
  if (!p) return false;
  return !isPurchaseActive(p) && !isPurchasePendingMandate(p) && !isPurchaseCompleted(p);
}

/**
 * Filters a list of purchases according to status filter and search query.
 */
export function filterPurchases(purchases = [], filter = "all", searchQuery = "") {
  return purchases.filter((p) => {
    if (filter === "active") {
      if (!isPurchaseActive(p)) return false;
    } else if (filter === "pending_mandate") {
      if (!isPurchasePendingMandate(p)) return false;
    } else if (filter === "pending") {
      if (!isPurchaseProcessing(p)) return false;
    } else if (filter === "completed") {
      if (!isPurchaseCompleted(p)) return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const planName = (p.planName || "").toLowerCase();
      const serviceName = (p.serviceName || "").toLowerCase();
      const refId = String(p.id || p.purchaseId || "").toLowerCase();
      if (!planName.includes(query) && !serviceName.includes(query) && !refId.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
