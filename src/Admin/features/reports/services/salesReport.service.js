import { db } from "../../../../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { normalizePurchase } from "../../purchases/services/Purchases";
import { normalizePayment } from "../../payments/services/Payments";
import { resolveDateRange } from "../utils/salesDateBuckets.utils";
import {
  computeDashboardMetrics,
  buildTimelineBuckets,
  aggregatePlanPerformance,
  aggregateCustomerSales,
  extractEmiInstallmentLedger,
  toTimestampMs,
} from "../utils/salesCalculations.utils";

/**
 * Converts a JS Date to a Firestore Timestamp safely.
 */
function toFirestoreTimestamp(date) {
  if (!date) return null;
  return Timestamp.fromDate(new Date(date));
}

/**
 * Fetches purchases within a date window.
 * Fallback to in-memory filter if composite index is pending or reading collection directly.
 */
async function fetchPurchasesForWindow(startDate, endDate) {
  const startTs = toFirestoreTimestamp(startDate);
  const endTs = toFirestoreTimestamp(endDate);
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  try {
    // Attempt indexed date range query
    const q = query(
      collection(db, "purchases"),
      where("createdAt", ">=", startTs),
      where("createdAt", "<=", endTs),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizePurchase(d.data(), d.id, "purchases"));
  } catch (rangeErr) {
    // If range index is missing or permission denies query, fetch collection and filter client-side safely
    try {
      const snap = await getDocs(query(collection(db, "purchases"), limit(500)));
      return snap.docs
        .map((d) => normalizePurchase(d.data(), d.id, "purchases"))
        .filter((p) => {
          const ts = toTimestampMs(p.createdAt);
          return ts >= startMs && ts <= endMs;
        });
    } catch (fallbackErr) {
      // Try orders fallback collection
      const snap = await getDocs(query(collection(db, "orders"), limit(500)));
      return snap.docs
        .map((d) => normalizePurchase(d.data(), d.id, "orders"))
        .filter((p) => {
          const ts = toTimestampMs(p.createdAt);
          return ts >= startMs && ts <= endMs;
        });
    }
  }
}

/**
 * Fetches payments within a date window.
 */
async function fetchPaymentsForWindow(startDate, endDate) {
  const startTs = toFirestoreTimestamp(startDate);
  const endTs = toFirestoreTimestamp(endDate);
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  try {
    const q = query(
      collection(db, "payments"),
      where("createdAt", ">=", startTs),
      where("createdAt", "<=", endTs),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizePayment(d, d.id));
  } catch (rangeErr) {
    try {
      const snap = await getDocs(query(collection(db, "payments"), limit(500)));
      return snap.docs
        .map((d) => normalizePayment(d, d.id))
        .filter((pay) => {
          const ts = toTimestampMs(pay.createdAt);
          return ts >= startMs && ts <= endMs;
        });
    } catch (fallbackErr) {
      console.warn("Failed to retrieve payments collection for sales report:", fallbackErr);
      return [];
    }
  }
}

/**
 * Main Service API for Sales Report Dashboard.
 * Retrieves data for current and previous periods, executes calculations, and structures dashboard payload.
 */
export async function getSalesReportData({ timeframe = "30d", customRange = null } = {}) {
  const rangeConfig = resolveDateRange(timeframe, customRange);
  const { start, end, previousStart, previousEnd } = rangeConfig;

  // Parallel fetch: current period & previous comparison period
  const [currentPurchases, currentPayments, previousPurchases, previousPayments] =
    await Promise.all([
      fetchPurchasesForWindow(start, end),
      fetchPaymentsForWindow(start, end),
      fetchPurchasesForWindow(previousStart, previousEnd),
      fetchPaymentsForWindow(previousStart, previousEnd),
    ]);

  // Execute pure analytics aggregations
  const metrics = computeDashboardMetrics(
    currentPurchases,
    currentPayments,
    previousPurchases,
    previousPayments
  );

  const timelineBuckets = buildTimelineBuckets(rangeConfig, currentPurchases, currentPayments);
  const planPerformance = aggregatePlanPerformance(currentPurchases);
  const customerSales = aggregateCustomerSales(currentPurchases, currentPayments);
  const emiLedger = extractEmiInstallmentLedger(currentPurchases);

  return {
    success: true,
    rangeConfig: {
      timeframe: rangeConfig.timeframe,
      label: rangeConfig.label,
      start: rangeConfig.start.toISOString(),
      end: rangeConfig.end.toISOString(),
      interval: rangeConfig.interval,
    },
    metrics,
    timelineBuckets,
    planPerformance,
    customerSales,
    emiLedger,
    raw: {
      purchasesCount: currentPurchases.length,
      paymentsCount: currentPayments.length,
      currentPurchases,
      currentPayments,
    },
  };
}

export default {
  getSalesReportData,
};

