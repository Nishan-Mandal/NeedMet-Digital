import { db } from "../../../../config/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  limit,
} from "firebase/firestore";
import { apiRequest, isApiConfigured } from "../../../services/apiClient";

/**
 * Safe date parser returning ISO string or null.
 */
const parseDate = (val) => {
  if (!val) return null;
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
  if (val.seconds) return new Date(val.seconds * 1000).toISOString();
  const dObj = new Date(val);
  return isNaN(dObj.getTime()) ? null : dObj.toISOString();
};

/**
 * Normalizes payment documents strictly matching src/Models/payment.model.js:
 * {
 *   userId, userName, orderId, subscriptionId,
 *   gateway, paymentType, status, currency, amount,
 *   method, bank, cardLast4,
 *   error: { code, description },
 *   refund: { refundId, amount, refundedAt },
 *   createdAt
 * }
 */
export function normalizePayment(d, id = null) {
  const data = d?.data ? d.data() : (d || {});
  const docId = id || d?.id || data.id || data.paymentId || data.transactionId;

  // Amount parsing (Amount in Rupees)
  const rawAmount = data.amount ?? data.value ?? data.totalAmount ?? 0;
  const numAmount = typeof rawAmount === "number" ? rawAmount : (parseFloat(rawAmount) || 0);

  // Status normalization: "SUCCESS" | "PENDING_MANDATE" | "PENDING" | "FAILED" | "REFUNDED"
  const rawStatus = String(data.status || "SUCCESS").toUpperCase();
  let status = "SUCCESS";
  if (rawStatus === "PENDING_MANDATE" || rawStatus.includes("MANDATE")) {
    status = "PENDING_MANDATE";
  } else if (["PENDING", "PROCESSING", "INITIATED"].includes(rawStatus)) {
    status = "PENDING";
  } else if (["FAILED", "FAILURE", "ERROR", "DECLINED"].includes(rawStatus)) {
    status = "FAILED";
  } else if (["REFUNDED", "REVERSED"].includes(rawStatus)) {
    status = "REFUNDED";
  } else {
    status = "SUCCESS";
  }

  // Payment Type normalization: "FULL" | "EMI_UPFRONT" | "EMI_RECURRING"
  const rawType = String(data.paymentType || "FULL").toUpperCase();
  let paymentType = "FULL";
  if (rawType.includes("UPFRONT")) {
    paymentType = "EMI_UPFRONT";
  } else if (rawType.includes("RECURRING") || rawType.includes("MANDATE")) {
    paymentType = "EMI_RECURRING";
  } else {
    paymentType = "FULL";
  }

  // Method normalization: "upi" | "card" | "netbanking"
  const rawMethod = String(data.method || data.paymentMethod || "upi").toLowerCase();
  let method = "upi";
  if (rawMethod.includes("card")) {
    method = "card";
  } else if (rawMethod.includes("netbanking") || rawMethod.includes("net_banking")) {
    method = "netbanking";
  } else {
    method = "upi";
  }

  // Failure Context (If status === "FAILED" or error is provided)
  let error = null;
  if (data.error && typeof data.error === "object") {
    error = {
      code: data.error.code || "PAYMENT_FAILED",
      description: data.error.description || "Payment failed",
    };
  } else if (status === "FAILED") {
    error = {
      code: "BAD_REQUEST_ERROR",
      description: "Payment transaction failed",
    };
  }

  // Refund Context (If refunded or refund object is provided)
  let refund = null;
  if (data.refund && typeof data.refund === "object") {
    const rawRefundAmount = data.refund.amount ?? numAmount;
    refund = {
      refundId: data.refund.refundId || "",
      amount: typeof rawRefundAmount === "number" ? rawRefundAmount : (parseFloat(rawRefundAmount) || 0),
      refundedAt: parseDate(data.refund.refundedAt),
    };
  } else if (status === "REFUNDED") {
    refund = {
      refundId: data.refundId || "",
      amount: numAmount,
      refundedAt: parseDate(data.refundedAt || data.createdAt),
    };
  }

  // Phone normalization
  const rawPhone = (
    data.phone ||
    data.contact ||
    data.userPhone ||
    data.customerPhone ||
    data.phoneNumber ||
    data.mobile ||
    data.customerMobile ||
    data.payerPhone ||
    (typeof data.user === "object" ? (data.user?.phone || data.user?.phoneNumber || data.user?.contact || data.user?.mobile) : null) ||
    data.upfrontPayment?.contact ||
    data.upfrontPayment?.phone ||
    ""
  );
  const cleanPhoneStr = String(rawPhone || "").trim();
  const phone = (cleanPhoneStr === "null" || cleanPhoneStr === "undefined") ? "" : cleanPhoneStr;

  const user = {
    userId: data.userId || "",
    userName: data.userName || data.payerName || data.customerName || data.name || "Customer",
    phone,
    email: data.email || data.userEmail || data.customerEmail || "",
  };

  return {
    id: docId,
    // 1. Transaction Context
    userId: data.userId || "",
    userName: data.userName || data.payerName || data.customerName || data.name || "",
    orderId: data.orderId || data.purchaseId || "",
    subscriptionId: data.subscriptionId || null,
    phone,
    userPhone: phone,
    customerPhone: phone,
    contact: phone,
    user,

    // 2. Gateway Event Data
    gateway: data.gateway || data.provider || "RAZORPAY",
    paymentType,
    status,
    currency: data.currency || "INR",
    amount: numAmount,

    // 3. Payment Method Details
    method,
    bank: data.bank || null,
    cardLast4: data.cardLast4 || null,

    // 4. Failure Context (If status === "FAILED")
    error,

    // 5. Refund Context (If refunded)
    refund,

    // Timestamp
    createdAt: parseDate(data.createdAt || data.timestamp || data.date),
  };
}

/**
 * Pure memory filter and paginator for payments.
 */
export function filterAndPaginatePayments(paymentsList = [], {
  page = 1,
  limit: pageSize = 15,
  pageSize: explicitPageSize,
  search = "",
  status = "all",
} = {}) {
  const finalPageSize = explicitPageSize || pageSize || 15;
  let payments = [...paymentsList];

  // Calculate metrics strictly from the payment model attributes
  const metrics = {
    totalCount: payments.length,
    totalVolume: payments.reduce((acc, p) => acc + (p.status === "SUCCESS" ? p.amount : 0), 0),
    successfulCount: payments.filter((p) => p.status === "SUCCESS").length,
    pendingMandateCount: payments.filter((p) => p.status === "PENDING_MANDATE").length,
    pendingCount: payments.filter((p) => p.status === "PENDING").length,
    failedCount: payments.filter((p) => p.status === "FAILED").length,
    refundedCount: payments.filter((p) => p.status === "REFUNDED").length,
  };

  // Filter by status ("ALL", "SUCCESS", "FAILED", "REFUNDED")
  if (status && status.toLowerCase() !== "all") {
    const targetStatus = status.toUpperCase();
    payments = payments.filter((p) => p.status === targetStatus);
  }

  // Search filter across model attributes
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    payments = payments.filter(
      (p) =>
        (p.id && p.id.toLowerCase().includes(s)) ||
        (p.userId && p.userId.toLowerCase().includes(s)) ||
        (p.userName && p.userName.toLowerCase().includes(s)) ||
        (p.orderId && p.orderId.toLowerCase().includes(s)) ||
        (p.subscriptionId && p.subscriptionId.toLowerCase().includes(s)) ||
        (p.gateway && p.gateway.toLowerCase().includes(s)) ||
        (p.bank && p.bank.toLowerCase().includes(s)) ||
        (p.cardLast4 && String(p.cardLast4).includes(s)) ||
        (p.refund?.refundId && p.refund.refundId.toLowerCase().includes(s)) ||
        (p.error?.code && p.error.code.toLowerCase().includes(s))
    );
  }

  // Sort descending by createdAt
  payments.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  const total = payments.length;
  const startIndex = (page - 1) * finalPageSize;
  const paginated = payments.slice(startIndex, startIndex + finalPageSize);

  return {
    success: true,
    payments: paginated,
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
 * Fetch payments & gateway transactions from Firestore 'payments' collection.
 */
export const getPayments = async ({
  page = 1,
  limit: pageSize = 15,
  search = "",
  status = "all",
} = {}) => {
  if (isApiConfigured) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        search,
        status,
      });
      return await apiRequest(`/payments?${params.toString()}`, { method: "GET" });
    } catch (err) {
      if (err.status !== 404 && err.status !== 500) throw err;
    }
  }

  try {
    const snap = await getDocs(query(collection(db, "payments"), limit(250)));
    const paymentsList = snap.docs.map((d) => normalizePayment(d, d.id));

    return filterAndPaginatePayments(paymentsList, {
      page,
      limit: pageSize,
      search,
      status,
    });
  } catch (err) {
    console.error("Error loading payments from Firestore:", err);
    throw err;
  }
};

/**
 * Update payment status (e.g. SUCCESS, FAILED, REFUNDED) in Firestore.
 */
export const updatePaymentStatus = async (id, newStatus) => {
  try {
    const docRef = doc(db, "payments", id);
    await updateDoc(docRef, {
      status: newStatus.toUpperCase(),
    });
    return { success: true, id, status: newStatus.toUpperCase() };
  } catch (err) {
    console.error("Error updating payment status in Firestore:", err);
    throw err;
  }
};

export default {
  getPayments,
  filterAndPaginatePayments,
  updatePaymentStatus,
  normalizePayment,
};

