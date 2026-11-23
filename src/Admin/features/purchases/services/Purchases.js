import { db } from "../../../../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { apiRequest, isApiConfigured } from "../../../services/apiClient";

/**
 * Safely sanitizes image URLs, stripping invalid trailing comma concatenations (e.g. "https://domain.com/img.jpg,data:image/png...")
 */
export function cleanImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("http") && trimmed.includes(",")) {
    const first = trimmed.split(",")[0].trim();
    if (first.startsWith("http://") || first.startsWith("https://")) {
      return first;
    }
  }
  return trimmed;
}

/**
 * Normalizes a purchase document according to src/Models/purchases.model.js
 *
 * Model fields:
 * - userId: string
 * - userName: string
 * - paymentMethod: "FULL" | "EMI"
 * - status: "PENDING_PAYMENT" | "PENDING_MANDATE" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "REFUNDED"
 * - itemSnapshot: { serviceId, serviceTitle, planId, planTitle, category, imageUrl, durationDays, features }
 * - pricing: { originalPrice, discountAmount, finalPrice, upfrontAmount, remainingAmount, couponCode }
 * - accessWindow: { activatedAt, expiresAt }
 * - upfrontPayment: { paymentId, paidAt, amount }
 * - mandate: { subscriptionId, status, totalCycles, paidCycles, emiAmount, nextDebitDate, lastChargedAt, installments } | null
 * - createdAt: Timestamp / ISO string
 * - updatedAt: Timestamp / ISO string
 */
export function normalizePurchase(d, id = null, sourceCollection = "purchases") {
  const data = d?.data ? d.data() : (d || {});
  const docId = id || d?.id || data.id || data.purchaseId || data.orderId || "";

  // Helper to parse Firestore Timestamps / ISO strings / dates into ISO string or null
  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val.toDate === "function") {
      try {
        return val.toDate().toISOString();
      } catch {
        // ignore
      }
    }
    if (typeof val.seconds === "number") {
      return new Date(val.seconds * 1000).toISOString();
    }
    if (typeof val._seconds === "number") {
      return new Date(val._seconds * 1000).toISOString();
    }
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val.toISOString();
    }
    if (typeof val === "string" || typeof val === "number") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    return null;
  };

  // 1. Customer & Ownership (matching src/Models/purchases.model.js:L3-L9)
  const userId = String(data.user?.userId || data.userId || data.uid || "");
  const userName = String(
    data.user?.userName ||
    data.userName ||
    data.customerName ||
    data.name ||
    (typeof data.user === "object" ? (data.user?.name || data.user?.displayName) : null) ||
    "Customer"
  );
  const rawPhone = (
    data.user?.phone ||
    data.phone ||
    data.userPhone ||
    data.customerPhone ||
    data.phoneNumber ||
    data.contact ||
    data.mobile ||
    data.customerMobile ||
    data.userMobile ||
    data.payerPhone ||
    data.upfrontPayment?.contact ||
    data.upfrontPayment?.phone ||
    data.billingAddress?.phone ||
    data.shippingAddress?.phone ||
    data.address?.phone ||
    data.mandate?.phone ||
    data.mandate?.customerPhone ||
    (typeof data.user === "object" ? (data.user?.phone || data.user?.phoneNumber || data.user?.mobile || data.user?.contact) : null) ||
    ""
  );
  const cleanPhoneStr = String(rawPhone || "").trim();
  const userPhone = (cleanPhoneStr === "null" || cleanPhoneStr === "undefined") ? "" : cleanPhoneStr;
  const userEmail = String(
    data.user?.email ||
    data.userEmail ||
    data.customerEmail ||
    data.email ||
    (typeof data.user === "object" ? data.user?.email : null) ||
    ""
  );

  const user = {
    userId,
    userName,
    phone: userPhone,
    ...(userEmail ? { email: userEmail } : {}),
  };

  const SaleBy = data.SaleBy || data.saleBy || data.itemSnapshot?.SaleBy || null;

  const rawMethod = String(data.paymentMethod || data.paymentType || "").toUpperCase();
  const paymentMethod = rawMethod.includes("EMI") ? "EMI" : "FULL";

  // 2. Authoritative Life-cycle Status (Strict FSM)
  // PENDING_PAYMENT | PENDING_MANDATE | ACTIVE | COMPLETED | CANCELLED | REFUNDED
  let status = "ACTIVE";
  const rawStatus = String(data.status || "").toUpperCase();
  if (
    [
      "PENDING_PAYMENT",
      "PENDING_MANDATE",
      "ACTIVE",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ].includes(rawStatus)
  ) {
    status = rawStatus;
  } else if (["PENDING", "PROCESSING", "INITIATED", "IN_REVIEW"].includes(rawStatus)) {
    status = paymentMethod === "EMI" ? "PENDING_MANDATE" : "PENDING_PAYMENT";
  } else if (["PAID", "SUCCESS", "ACTIVE"].includes(rawStatus)) {
    status = "ACTIVE";
  } else if (rawStatus === "COMPLETED") {
    status = "COMPLETED";
  } else if (["FAILED", "CANCELLED"].includes(rawStatus)) {
    status = "CANCELLED";
  } else if (rawStatus === "REFUNDED") {
    status = "REFUNDED";
  } else if (data.status) {
    status = rawStatus;
  }

  // 3. Service & Plan Snapshot (Captured at checkout)
  const itemSnapshot = {
    serviceId: String(data.itemSnapshot?.serviceId || data.serviceId || ""),
    serviceTitle: String(
      data.itemSnapshot?.serviceTitle ||
      data.serviceTitle ||
      data.serviceName ||
      data.title ||
      "NeedMet Service"
    ),
    planId: String(data.itemSnapshot?.planId || data.planId || ""),
    planTitle: String(
      data.itemSnapshot?.planTitle ||
      data.planTitle ||
      data.planName ||
      data.packageName ||
      "Subscription Plan"
    ),
    category: String(data.itemSnapshot?.category || data.category || ""),
    imageUrl: cleanImageUrl(
      data.itemSnapshot?.imageUrl ||
      data.imageUrl ||
      data.serviceImageUrl ||
      ""
    ),
    durationDays:
      Number(
        data.itemSnapshot?.durationDays ??
        data.durationDays ??
        (data.duration ? parseInt(data.duration, 10) : 30)
      ) || 30,
    features: Array.isArray(data.itemSnapshot?.features)
      ? data.itemSnapshot.features
      : Array.isArray(data.features)
      ? data.features
      : [],
  };

  // 4. Financial Breakdown (All values in INR Rupees)
  const originalPrice = Number(
    data.pricing?.originalPrice ??
    data.originalPrice ??
    data.amount ??
    data.planPrice ??
    0
  );
  const discountAmount = Number(
    data.pricing?.discountAmount ??
    data.discountAmount ??
    data.discount ??
    0
  );
  const finalPrice = Number(
    data.pricing?.finalPrice ??
    data.finalPrice ??
    (originalPrice - discountAmount > 0 ? originalPrice - discountAmount : originalPrice)
  );
  const upfrontAmount = Number(
    data.pricing?.upfrontAmount ??
    data.upfrontAmount ??
    (paymentMethod === "FULL" ? finalPrice : 0)
  );
  const remainingAmount = Number(
    data.pricing?.remainingAmount ??
    data.remainingAmount ??
    (finalPrice - upfrontAmount > 0 ? finalPrice - upfrontAmount : 0)
  );
  const couponCode = data.pricing?.couponCode || data.couponCode || null;

  const pricing = {
    originalPrice,
    discountAmount,
    finalPrice,
    upfrontAmount,
    remainingAmount,
    couponCode: couponCode ? String(couponCode).toUpperCase() : null,
  };

  // 5. Access Window
  const activatedAt = parseDate(
    data.accessWindow?.activatedAt ||
    data.activatedAt ||
    data.startDate ||
    data.createdAt ||
    data.timestamp
  );
  const expiresAt = parseDate(
    data.accessWindow?.expiresAt ||
    data.expiresAt ||
    data.endDate ||
    data.validUntil
  );
  const accessWindow = {
    activatedAt,
    expiresAt,
  };

  // 6. Upfront Settlement Link
  const upfrontPayment = {
    paymentId: String(
      data.upfrontPayment?.paymentId ||
      data.paymentId ||
      data.razorpay_payment_id ||
      ""
    ),
    paidAt: parseDate(
      data.upfrontPayment?.paidAt ||
      data.paidAt ||
      activatedAt
    ),
    amount: Number(
      data.upfrontPayment?.amount ??
      data.upfrontAmount ??
      upfrontAmount
    ),
  };

  // 7. Mandate & EMI Ledger (null for FULL payment)
  let mandate = null;
  if (paymentMethod === "EMI" || data.mandate || data.subscriptionId) {
    const rawInstallments = Array.isArray(data.mandate?.installments)
      ? data.mandate.installments
      : Array.isArray(data.installments)
      ? data.installments
      : [];

    mandate = {
      subscriptionId: String(
        data.mandate?.subscriptionId ||
        data.subscriptionId ||
        ""
      ),
      status: String(
        data.mandate?.status ||
        data.mandateStatus ||
        (status === "ACTIVE" ? "AUTHORIZED" : "PENDING")
      ).toUpperCase(),
      totalCycles: Number(data.mandate?.totalCycles || data.totalCycles || rawInstallments.length || 0),
      paidCycles: Number(data.mandate?.paidCycles || data.paidCycles || 0),
      emiAmount: Number(data.mandate?.emiAmount || data.emiAmount || 0),
      nextDebitDate: parseDate(data.mandate?.nextDebitDate || data.nextDebitDate),
      lastChargedAt: parseDate(data.mandate?.lastChargedAt || data.lastChargedAt),
      installments: rawInstallments.map((inst, idx) => ({
        cycleIndex: Number(inst.cycleIndex ?? idx + 1),
        dueDate: parseDate(inst.dueDate),
        amount: Number(inst.amount || 0),
        status: String(inst.status || "PENDING").toUpperCase(),
        paymentId: inst.paymentId ? String(inst.paymentId) : null,
        paidAt: parseDate(inst.paidAt),
      })),
    };
  }

  // Timestamps
  const createdAt = parseDate(data.createdAt || data.timestamp || data.orderDate);
  const updatedAt = parseDate(data.updatedAt || data.lastUpdated || createdAt);

  // Remaining validity helper
  let remainingDays = null;
  let isExpired = false;
  if (expiresAt) {
    const expMs = new Date(expiresAt).getTime();
    const diff = expMs - Date.now();
    remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (remainingDays <= 0) {
      isExpired = true;
      remainingDays = 0;
    }
  }

  return {
    id: docId,
    orderId: docId,
    purchaseId: docId,
    sourceCollection,
    user,
    SaleBy,
    userId,
    userName,
    userPhone,
    phone: userPhone,
    userEmail,
    customerPhone: userPhone,
    customerEmail: userEmail,
    paymentMethod,
    status,
    itemSnapshot,
    pricing,
    accessWindow,
    upfrontPayment,
    mandate,
    createdAt,
    updatedAt,
    derived: {
      isExpired,
      remainingDays,
      discountPercent:
        pricing.originalPrice > 0 && pricing.discountAmount > 0
          ? Math.round((pricing.discountAmount / pricing.originalPrice) * 100)
          : 0,
    },
  };
}

/**
 * Pure memory filter and paginator for purchases.
 */
export function filterAndPaginatePurchases(purchasesList = [], {
  page = 1,
  limit: pageSize = 15,
  pageSize: explicitPageSize,
  status = "all",
  search = "",
  usedCollection = "purchases",
} = {}) {
  const finalPageSize = explicitPageSize || pageSize || 15;
  let purchases = [...purchasesList];

  // Derived Metrics strictly from the model:
  const metrics = {
    totalCount: purchases.length,
    totalRevenue: purchases.reduce(
      (acc, p) =>
        acc + (["ACTIVE", "COMPLETED"].includes(p.status) ? (p.pricing?.finalPrice || 0) : 0),
      0
    ),
    activeCount: purchases.filter((p) => p.status === "ACTIVE").length,
    completedCount: purchases.filter((p) => p.status === "COMPLETED").length,
    pendingCount: purchases.filter(
      (p) => p.status === "PENDING_PAYMENT" || p.status === "PENDING_MANDATE"
    ).length,
    cancelledCount: purchases.filter(
      (p) => p.status === "CANCELLED" || p.status === "REFUNDED"
    ).length,
  };

  // Filter by status if requested (strict FSM statuses)
  if (status && status !== "all") {
    const sUpper = status.toUpperCase();
    purchases = purchases.filter((p) => p.status === sUpper);
  }

  // Filter by search query using model fields
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    purchases = purchases.filter(
      (p) =>
        (p.id && p.id.toLowerCase().includes(s)) ||
        (p.orderId && p.orderId.toLowerCase().includes(s)) ||
        (p.purchaseId && p.purchaseId.toLowerCase().includes(s)) ||
        (p.user?.userId && p.user.userId.toLowerCase().includes(s)) ||
        (p.userId && p.userId.toLowerCase().includes(s)) ||
        (p.user?.userName && p.user.userName.toLowerCase().includes(s)) ||
        (p.userName && p.userName.toLowerCase().includes(s)) ||
        (p.user?.phone && p.user.phone.toLowerCase().includes(s)) ||
        (p.userPhone && p.userPhone.toLowerCase().includes(s)) ||
        (p.SaleBy && p.SaleBy.toLowerCase().includes(s)) ||
        (p.saleBy && p.saleBy.toLowerCase().includes(s)) ||
        (p.itemSnapshot?.serviceTitle && p.itemSnapshot.serviceTitle.toLowerCase().includes(s)) ||
        (p.itemSnapshot?.serviceId && p.itemSnapshot.serviceId.toLowerCase().includes(s)) ||
        (p.itemSnapshot?.planTitle && p.itemSnapshot.planTitle.toLowerCase().includes(s)) ||
        (p.itemSnapshot?.planId && p.itemSnapshot.planId.toLowerCase().includes(s)) ||
        (p.itemSnapshot?.category && p.itemSnapshot.category.toLowerCase().includes(s)) ||
        (p.pricing?.couponCode && p.pricing.couponCode.toLowerCase().includes(s)) ||
        (p.upfrontPayment?.paymentId && p.upfrontPayment.paymentId.toLowerCase().includes(s)) ||
        (p.mandate?.subscriptionId && p.mandate.subscriptionId.toLowerCase().includes(s))
    );
  }

  // Sort descending by createdAt
  purchases.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  const total = purchases.length;
  const startIndex = (page - 1) * finalPageSize;
  const paginated = purchases.slice(startIndex, startIndex + finalPageSize);

  return {
    success: true,
    purchases: paginated,
    orders: paginated,
    collectionSource: usedCollection,
    metrics,
    pagination: {
      total,
      page,
      limit: finalPageSize,
      totalPages: Math.ceil(total / finalPageSize) || 1,
    },
  };
}

/**
 * Fetch a single purchase by ID directly from Firestore.
 */
export const getPurchaseById = async (id, targetCollection = "purchases") => {
  if (!id || typeof id !== "string") return null;
  const cleanId = id.trim();
  if (!cleanId) return null;

  try {
    let docRef = doc(db, targetCollection, cleanId);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists() && targetCollection === "purchases") {
      docRef = doc(db, "orders", cleanId);
      docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return normalizePurchase(docSnap.data(), docSnap.id, "orders");
      }
    } else if (docSnap.exists()) {
      return normalizePurchase(docSnap.data(), docSnap.id, targetCollection);
    }
    return null;
  } catch (err) {
    console.warn("Error fetching purchase by ID from Firestore:", err);
    return null;
  }
};

/**
 * Fetch purchases from backend API or fallback to Firestore 'purchases' or 'orders' collection.
 */
export const getPurchases = async ({
  page = 1,
  limit: pageSize = 15,
  status = "all",
  search = "",
} = {}) => {
  // If dedicated backend API is configured, use it:
  if (isApiConfigured) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        status,
        search,
      });
      return await apiRequest(`/purchases?${params.toString()}`, { method: "GET" });
    } catch (err) {
      if (err.status !== 404 && err.status !== 500) throw err;
    }
  }

  // Direct Firestore access: try 'purchases' collection first, fallback to 'orders'
  let purchasesSnap;
  let usedCollection = "purchases";

  try {
    purchasesSnap = await getDocs(
      query(collection(db, "purchases"), limit(300))
    ).catch(async () => {
      return await getDocs(collection(db, "purchases"));
    });
  } catch (purchasesErr) {
    if (purchasesErr.code === "permission-denied" || purchasesErr.code === "not-found") {
      try {
        purchasesSnap = await getDocs(
          query(collection(db, "orders"), limit(300))
        ).catch(async () => {
          return await getDocs(collection(db, "orders"));
        });
        usedCollection = "orders";
      } catch {
        const err = new Error(
          "Permission Denied: Cloud Firestore security rules reject reading the 'purchases' collection. " +
          "Please verify Firestore rules allow reading purchases."
        );
        err.code = "permission-denied";
        err.originalError = purchasesErr;
        throw err;
      }
    } else {
      throw purchasesErr;
    }
  }

  try {
    const purchasesList = purchasesSnap.docs.map((d) =>
      normalizePurchase(d.data(), d.id, usedCollection)
    );

    return filterAndPaginatePurchases(purchasesList, {
      page,
      limit: pageSize,
      status,
      search,
      usedCollection,
    });
  } catch (err) {
    console.error("Error formatting purchases from Firestore:", err);
    throw err;
  }
};

export const getOrders = getPurchases;

/**
 * Update purchase lifecycle status according to purchases.model.js FSM:
 * PENDING_PAYMENT | PENDING_MANDATE | ACTIVE | COMPLETED | CANCELLED | REFUNDED
 */
export const updatePurchaseStatus = async (id, newStatus, targetCollection = "purchases") => {
  try {
    let docRef = doc(db, targetCollection, id);
    try {
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (firstErr) {
      if (targetCollection === "purchases") {
        docRef = doc(db, "orders", id);
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        throw firstErr;
      }
    }
    return { success: true, id, status: newStatus };
  } catch (err) {
    console.error("Error updating purchase status in Firestore:", err);
    throw err;
  }
};

export default {
  getPurchases,
  getOrders,
  getPurchaseById,
  filterAndPaginatePurchases,
  updatePurchaseStatus,
  normalizePurchase,
};

