/**
 * Derives tamper-proof, authoritative financial summary directly from verified transaction records.
 * Solves stale stored balances and non-atomic webhook increments.
 * Fully supports the new purchases data model (with itemSnapshot, accessWindow, mandate.installments, etc.)
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
      isFullPaidCompleted: false,
    };
  }

  const isEmi =
    String(purchase.paymentMethod || purchase.paymentType || "").toUpperCase() === "EMI" ||
    purchase.isEmi === true ||
    Boolean(purchase.mandate);

  const pricing = purchase.pricing || {};
  const planTotal = Number(pricing.finalPrice ?? purchase.amount ?? purchase.price ?? 0);

  const statusUpper = String(purchase.status || "").toUpperCase();

  // Upfront verification check
  const upfrontStatus = String(purchase.upfrontPayment?.status || "").toLowerCase();
  const isUpfrontPaid =
    Boolean(purchase.upfrontPayment?.paymentId) ||
    Boolean(purchase.paymentId) ||
    upfrontStatus === "captured" ||
    upfrontStatus === "success" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    statusUpper === "PENDING_MANDATE";

  const rawUpfront =
    pricing.upfrontAmount ??
    purchase.upfrontPayment?.amount ??
    purchase.upfrontAmount;

  // Take upfront amount directly from the DB record without recalculating or rounding
  const upfrontPaid = Number(rawUpfront ?? (isEmi ? 0 : planTotal) ?? 0);

  // Verified installments sum (new model stores installments in purchase.mandate.installments)
  const installments = Array.isArray(purchase.mandate?.installments)
    ? purchase.mandate.installments
    : Array.isArray(pricing.installments)
    ? pricing.installments
    : [];

  const verifiedInstallmentsSum = installments
    .filter((inst) => {
      const s = String(inst.status || "").toUpperCase();
      return s === "PAID" || s === "COMPLETED";
    })
    .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);

  const isFullPaidCompleted =
    !isEmi &&
    (statusUpper === "COMPLETED" ||
      statusUpper === "ACTIVE" ||
      purchase.status === "completed" ||
      purchase.planAccessStatus === "active");

  const verifiedPaid = isEmi
    ? (isUpfrontPaid ? upfrontPaid : 0) + verifiedInstallmentsSum
    : isFullPaidCompleted
    ? planTotal
    : isUpfrontPaid
    ? upfrontPaid
    : 0;

  // Take remaining amount directly from DB pricing.remainingAmount, never rounding up
  const remainingBalance = isEmi
    ? Number(
        pricing.remainingAmount !== undefined && pricing.remainingAmount !== null
          ? pricing.remainingAmount
          : Math.max(0, planTotal - verifiedPaid)
      )
    : isFullPaidCompleted
    ? 0
    : planTotal;

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
    isFullPaidCompleted,
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
    // Check authoritative lifecycle status and upfront payment
    const statusUpper = String(purchase.status || "").toUpperCase();
    const upfrontStatus = String(purchase.upfrontPayment?.status || "").toLowerCase();
    const isPaidOrActive =
      statusUpper === "ACTIVE" ||
      statusUpper === "COMPLETED" ||
      statusUpper === "PENDING_MANDATE" ||
      purchase.status === "active" ||
      purchase.status === "completed" ||
      purchase.planAccessStatus === "active" ||
      purchase.planAccessStatus === "completed" ||
      upfrontStatus === "captured" ||
      upfrontStatus === "success" ||
      Boolean(purchase.upfrontPayment?.paymentId) ||
      Boolean(purchase.primaryPaymentId) ||
      Boolean(purchase.paymentId);

    if (
      !isPaidOrActive ||
      statusUpper === "CANCELLED" ||
      statusUpper === "FAILED" ||
      statusUpper === "REFUNDED" ||
      purchase.status === "cancelled" ||
      purchase.planAccessStatus === "cancelled" ||
      purchase.status === "failed"
    ) {
      return;
    }

    // Hydrate itemSnapshot fields to top level if missing
    const snapshot = purchase.itemSnapshot || purchase.display;
    const hydrated = { ...purchase };
    if (snapshot) {
      if (!hydrated.serviceTitle) hydrated.serviceTitle = snapshot.serviceTitle || snapshot.serviceName;
      if (!hydrated.serviceName) hydrated.serviceName = snapshot.serviceTitle || snapshot.serviceName;
      if (!hydrated.planTitle) hydrated.planTitle = snapshot.planTitle || snapshot.planName;
      if (!hydrated.planName) hydrated.planName = snapshot.planTitle || snapshot.planName;
      if (!hydrated.imageUrl) hydrated.imageUrl = snapshot.imageUrl || snapshot.serviceImageUrl;
      if (!hydrated.category) hydrated.category = snapshot.category;
      if (!hydrated.durationDays && snapshot.durationDays) hydrated.durationDays = snapshot.durationDays;
      if (!hydrated.features && snapshot.features) hydrated.features = snapshot.features;
    }

    if (purchase.accessWindow) {
      if (!hydrated.startDate && purchase.accessWindow.activatedAt) hydrated.startDate = purchase.accessWindow.activatedAt;
      if (!hydrated.endDate && purchase.accessWindow.expiresAt) hydrated.endDate = purchase.accessWindow.expiresAt;
    }

    const ids = extractIds(hydrated);
    let canonicalKey = ids.find((id) => knownIdToKey.has(id));
    if (canonicalKey) {
      canonicalKey = knownIdToKey.get(canonicalKey);
    } else {
      canonicalKey = hydrated.id || hydrated.purchaseId || hydrated.orderId || `purchase-${idx}`;
    }

    ids.forEach((id) => knownIdToKey.set(id, canonicalKey));
    knownIdToKey.set(canonicalKey, canonicalKey);

    if (!purchaseMap.has(canonicalKey)) {
      purchaseMap.set(canonicalKey, {
        ...hydrated,
        id: canonicalKey,
        purchaseId: canonicalKey,
      });
    } else {
      const existing = purchaseMap.get(canonicalKey);
      purchaseMap.set(canonicalKey, {
        ...existing,
        ...hydrated,
        pricing: { ...(existing.pricing || {}), ...(hydrated.pricing || {}) },
        mandate: { ...(existing.mandate || {}), ...(hydrated.mandate || {}) },
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
        if (!existing.endDate && planItem.endDate) {
          const s = new Date(existing.startDate || planItem.startDate);
          const e = new Date(planItem.endDate);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e.getTime() > s.getTime() + 24 * 60 * 60 * 1000) {
            existing.endDate = planItem.endDate;
          }
        }
      }
    } else {
      // Check if plan matches an existing purchase by planName and serviceName
      const alreadyRepresented = Array.from(purchaseMap.values()).some((p) => {
        const pPlan = p.itemSnapshot?.planTitle || p.planName;
        const pService = p.itemSnapshot?.serviceTitle || p.serviceName;
        const samePlan = pPlan && planItem.planName && pPlan.toLowerCase() === planItem.planName.toLowerCase();
        const sameService = pService && planItem.serviceName && pService.toLowerCase() === planItem.serviceName.toLowerCase();
        return samePlan && sameService && (p.status === (planItem.status || "active") || String(p.status).toUpperCase() === "ACTIVE");
      });

      if (!alreadyRepresented) {
        const newKey = planItem.purchaseId || planItem.paymentId || `user-plan-${idx}`;
        const sDate = planItem.startDate ? new Date(planItem.startDate?.toDate ? planItem.startDate.toDate() : planItem.startDate) : new Date();
        let eDate = planItem.endDate ? new Date(planItem.endDate?.toDate ? planItem.endDate.toDate() : planItem.endDate) : null;
        const durationDays = Number(planItem.durationDays) || 92;
        if (!eDate || isNaN(eDate.getTime()) || eDate.getTime() <= sDate.getTime() + 24 * 60 * 60 * 1000) {
          eDate = new Date(sDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        }

        const newPurchase = {
          id: newKey,
          purchaseId: newKey,
          planName: planItem.planName || "Service Plan",
          serviceName: planItem.serviceName || "NeedMet Digital",
          planType: planItem.planType || "Monthly",
          amount: planItem.amount || 0,
          durationDays: durationDays,
          paymentMethod: planItem.paymentType || "FULL",
          planAccessStatus: planItem.status || "active",
          status: planItem.status || "active",
          startDate: planItem.startDate || sDate.toISOString(),
          endDate: eDate.toISOString(),
          createdAt: planItem.startDate || sDate.toISOString(),
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
      const pServiceId = p.itemSnapshot?.serviceId || p.serviceId;
      const pTitle = p.itemSnapshot?.serviceTitle || p.title || p.serviceName;
      const match =
        serviceMap.get(String(pServiceId || "").toLowerCase()) ||
        serviceMap.get(String(pTitle || "").trim().toLowerCase()) ||
        Array.from(serviceMap.values()).find((s) => {
          const sTitle = (s.title || "").toLowerCase();
          const target = (pTitle || "").toLowerCase();
          return sTitle && target && (sTitle.includes(target) || target.includes(sTitle));
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
  const statusUpper = String(p.status || "").toUpperCase();
  if (statusUpper === "PENDING_MANDATE") return true;

  const isEmi =
    String(p.paymentMethod || p.paymentType || "").toUpperCase() === "EMI" ||
    p.isEmi === true ||
    Boolean(p.mandate);
  const mandateStatus = String(p.mandate?.status || "").toUpperCase();
  const isMandateAuthorized = mandateStatus === "AUTHORIZED";
  const isPlanActive =
    statusUpper === "ACTIVE" ||
    p.planAccessStatus === "active" ||
    p.status === "active";

  return isEmi && !isMandateAuthorized && !isPlanActive;
}

/**
 * Checks whether a purchase is actively deliverable.
 */
export function isPurchaseActive(p) {
  if (!p) return false;
  const statusUpper = String(p.status || "").toUpperCase();
  const isEmi =
    String(p.paymentMethod || p.paymentType || "").toUpperCase() === "EMI" ||
    p.isEmi === true ||
    Boolean(p.mandate);
  const mandateStatus = String(p.mandate?.status || "").toUpperCase();
  const isMandateAuthorized = mandateStatus === "AUTHORIZED";

  if (isEmi && p.mandate && !isMandateAuthorized) return false;
  if (statusUpper === "ACTIVE") return true;
  return p.planAccessStatus === "active" || p.status === "active";
}

/**
 * Checks whether a purchase lifecycle is completed.
 */
export function isPurchaseCompleted(p) {
  if (!p) return false;
  const statusUpper = String(p.status || "").toUpperCase();
  return (
    statusUpper === "COMPLETED" ||
    p.status === "completed" ||
    p.planAccessStatus === "completed"
  );
}

/**
 * Checks whether a purchase is in processing state.
 */
export function isPurchaseProcessing(p) {
  if (!p) return false;
  const statusUpper = String(p.status || "").toUpperCase();
  if (statusUpper === "PENDING_PAYMENT" || statusUpper === "PENDING") return true;
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
      const planName = String(p.itemSnapshot?.planTitle || p.planName || p.planTitle || "").toLowerCase();
      const serviceName = String(p.itemSnapshot?.serviceTitle || p.serviceName || p.serviceTitle || p.title || "").toLowerCase();
      const refId = String(p.id || p.purchaseId || p.orderId || "").toLowerCase();
      if (!planName.includes(query) && !serviceName.includes(query) && !refId.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
