/**
 * Pure Mathematical & Aggregation Utilities for NeedMet Sales Report Dashboard
 * Enforces strict financial calculations, prevents double-counting, and computes period-over-period growth.
 */

import { generateTimeBuckets } from "./salesDateBuckets.utils";

/**
 * Safely parses any date/timestamp representation into milliseconds since epoch or 0.
 */
export function toTimestampMs(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  if (typeof val.toDate === "function") {
    try {
      return val.toDate().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof val.seconds === "number") return val.seconds * 1000;
  if (typeof val._seconds === "number") return val._seconds * 1000;
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/**
 * Calculates percentage growth between current and previous values.
 * Returns { value: number, direction: 'up'|'down'|'neutral', formatted: string }
 */
export function calculateGrowth(current = 0, previous = 0) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;

  if (prev === 0) {
    if (curr > 0) return { value: 100, direction: "up", formatted: "+100%" };
    if (curr === 0) return { value: 0, direction: "neutral", formatted: "0%" };
    return { value: -100, direction: "down", formatted: "-100%" };
  }

  const diff = curr - prev;
  const pct = Math.round((diff / prev) * 100);

  if (pct > 0) {
    return { value: pct, direction: "up", formatted: `+${pct}%` };
  }
  if (pct < 0) {
    return { value: Math.abs(pct), direction: "down", formatted: `${pct}%` };
  }
  return { value: 0, direction: "neutral", formatted: "0%" };
}

/**
 * Primary aggregator computing comprehensive dashboard summary metrics from purchases and payments.
 */
export function computeDashboardMetrics(
  currentPurchases = [],
  currentPayments = [],
  previousPurchases = [],
  previousPayments = []
) {
  const nowMs = Date.now();

  // 1. Current Purchases Filtered Sets
  const confirmedPurchases = currentPurchases.filter((p) =>
    ["ACTIVE", "COMPLETED", "PENDING_MANDATE"].includes(p.status)
  );
  const activePurchases = currentPurchases.filter((p) => p.status === "ACTIVE");
  const completedPurchases = currentPurchases.filter((p) => p.status === "COMPLETED");
  const pendingOrders = currentPurchases.filter((p) =>
    ["PENDING_PAYMENT", "PENDING_MANDATE"].includes(p.status)
  );
  const cancelledOrders = currentPurchases.filter((p) =>
    ["CANCELLED", "REFUNDED"].includes(p.status)
  );

  // 2. Current Financial Totals from Purchases
  const grossBookedSales = confirmedPurchases.reduce(
    (sum, p) => sum + (Number(p.pricing?.finalPrice) || 0),
    0
  );
  const catalogGross = confirmedPurchases.reduce(
    (sum, p) => sum + (Number(p.pricing?.originalPrice) || 0),
    0
  );
  const totalDiscounts = confirmedPurchases.reduce(
    (sum, p) => sum + (Number(p.pricing?.discountAmount) || 0),
    0
  );
  const totalOrdersCount = confirmedPurchases.length;
  const averageOrderValue =
    totalOrdersCount > 0 ? Math.round(grossBookedSales / totalOrdersCount) : 0;

  // Outstanding EMI Balance across confirmed EMI purchases
  const emiPurchases = confirmedPurchases.filter((p) => p.paymentMethod === "EMI");
  const outstandingEmiAmount = emiPurchases.reduce(
    (sum, p) => sum + (Number(p.pricing?.remainingAmount) || 0),
    0
  );

  // Overdue EMI Installments
  let overdueEmiAmount = 0;
  let overdueInstallmentsCount = 0;
  let upcomingInstallmentsCount = 0;
  let upcomingEmiAmount = 0;
  const upcomingWindowMs = nowMs + 30 * 24 * 60 * 60 * 1000;

  emiPurchases.forEach((p) => {
    const installments = p.mandate?.installments || [];
    installments.forEach((inst) => {
      const instDueMs = toTimestampMs(inst.dueDate);
      const instAmount = Number(inst.amount) || 0;
      if (inst.status !== "PAID") {
        if (instDueMs > 0 && instDueMs < nowMs) {
          overdueEmiAmount += instAmount;
          overdueInstallmentsCount += 1;
        } else if (instDueMs >= nowMs && instDueMs <= upcomingWindowMs) {
          upcomingEmiAmount += instAmount;
          upcomingInstallmentsCount += 1;
        }
      }
    });
  });

  // Active Plans with valid expiration window
  const activePlansCount = currentPurchases.filter((p) => {
    if (p.status !== "ACTIVE") return false;
    const expiresMs = toTimestampMs(p.accessWindow?.expiresAt);
    return expiresMs === 0 || expiresMs > nowMs;
  }).length;

  // 3. Current Payments Breakdown (Authoritative Gateway Ledger)
  const successfulPayments = currentPayments.filter((p) => p.status === "SUCCESS");
  const failedPayments = currentPayments.filter((p) => p.status === "FAILED");
  const pendingPayments = currentPayments.filter((p) =>
    ["PENDING", "PENDING_MANDATE"].includes(p.status)
  );
  const refundedPayments = currentPayments.filter(
    (p) => p.status === "REFUNDED" || Boolean(p.refund?.amount)
  );

  const totalCollectedRevenue = successfulPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const totalRefundedAmount = refundedPayments.reduce((sum, p) => {
    const refAmt = Number(p.refund?.amount);
    return sum + (refAmt > 0 ? refAmt : Number(p.amount) || 0);
  }, 0);

  const netRevenue = Math.max(0, totalCollectedRevenue - totalRefundedAmount);

  // Success Rates
  const totalPaymentAttempts = currentPayments.length;
  const paymentSuccessRate =
    totalPaymentAttempts > 0
      ? Math.round((successfulPayments.length / totalPaymentAttempts) * 100)
      : 100;

  const totalEmiOrders = emiPurchases.length;
  const authorizedMandates = emiPurchases.filter(
    (p) => p.mandate?.status === "AUTHORIZED" || p.mandate?.status === "COMPLETED"
  ).length;
  const mandateSuccessRate =
    totalEmiOrders > 0 ? Math.round((authorizedMandates / totalEmiOrders) * 100) : 100;

  // 4. Previous Period Comparison Metrics
  const prevConfirmedPurchases = previousPurchases.filter((p) =>
    ["ACTIVE", "COMPLETED", "PENDING_MANDATE"].includes(p.status)
  );
  const prevGrossBookedSales = prevConfirmedPurchases.reduce(
    (sum, p) => sum + (Number(p.pricing?.finalPrice) || 0),
    0
  );
  const prevOrdersCount = prevConfirmedPurchases.length;
  const prevAov =
    prevOrdersCount > 0 ? Math.round(prevGrossBookedSales / prevOrdersCount) : 0;

  const prevSuccessfulPayments = previousPayments.filter((p) => p.status === "SUCCESS");
  const prevCollectedRevenue = prevSuccessfulPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );
  const prevRefundedAmount = previousPayments
    .filter((p) => p.status === "REFUNDED" || Boolean(p.refund?.amount))
    .reduce((sum, p) => sum + (Number(p.refund?.amount) || Number(p.amount) || 0), 0);
  const prevNetRevenue = Math.max(0, prevCollectedRevenue - prevRefundedAmount);

  return {
    financials: {
      grossSales: grossBookedSales,
      catalogGross,
      totalDiscounts,
      netRevenue,
      collectedRevenue: totalCollectedRevenue,
      refundedAmount: totalRefundedAmount,
      outstandingEmi: outstandingEmiAmount,
      overdueEmi: overdueEmiAmount,
      averageOrderValue,
    },
    counts: {
      totalOrders: totalOrdersCount,
      activePlans: activePlansCount,
      activeOrders: activePurchases.length,
      completedOrders: completedPurchases.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      pendingPayments: pendingPayments.length,
      refundedPayments: refundedPayments.length,
      totalTransactions: totalPaymentAttempts,
      overdueInstallmentsCount,
      upcomingInstallmentsCount,
      upcomingEmiAmount,
    },
    rates: {
      paymentSuccessRate,
      mandateSuccessRate,
    },
    growth: {
      grossSales: calculateGrowth(grossBookedSales, prevGrossBookedSales),
      netRevenue: calculateGrowth(netRevenue, prevNetRevenue),
      collectedRevenue: calculateGrowth(totalCollectedRevenue, prevCollectedRevenue),
      orders: calculateGrowth(totalOrdersCount, prevOrdersCount),
      aov: calculateGrowth(averageOrderValue, prevAov),
      refunds: calculateGrowth(totalRefundedAmount, prevRefundedAmount),
    },
  };
}

/**
 * Distributes purchases and payments into time buckets for area/bar charts.
 */
export function buildTimelineBuckets(rangeConfig, purchases = [], payments = []) {
  const { start, end, interval } = rangeConfig;
  const buckets = generateTimeBuckets(start, end, interval);

  const findBucketIndex = (tsMs) => {
    if (!tsMs) return -1;
    return buckets.findIndex((b) => tsMs >= b.start.getTime() && tsMs <= b.end.getTime());
  };

  // Populate purchases (Gross Booked Sales & Orders)
  purchases.forEach((p) => {
    if (!["ACTIVE", "COMPLETED", "PENDING_MANDATE"].includes(p.status)) return;
    const ts = toTimestampMs(p.createdAt);
    const idx = findBucketIndex(ts);
    if (idx !== -1) {
      buckets[idx].grossSales += Number(p.pricing?.finalPrice) || 0;
      buckets[idx].ordersCount += 1;
    }
  });

  // Populate payments (Cash Collected & Refunds)
  payments.forEach((pay) => {
    const ts = toTimestampMs(pay.createdAt);
    const idx = findBucketIndex(ts);
    if (idx !== -1) {
      if (pay.status === "SUCCESS") {
        const amt = Number(pay.amount) || 0;
        buckets[idx].cashCollected += amt;
        buckets[idx].netRevenue += amt;
        buckets[idx].paymentsCount += 1;
      } else if (pay.status === "REFUNDED" || pay.refund?.amount) {
        const refAmt = Number(pay.refund?.amount) || Number(pay.amount) || 0;
        buckets[idx].refundedAmount += refAmt;
        buckets[idx].netRevenue -= refAmt;
      }
    }
  });

  // Normalize net revenue floor to zero per bucket
  buckets.forEach((b) => {
    if (b.netRevenue < 0) b.netRevenue = 0;
  });

  return buckets;
}

/**
 * Aggregates sales metrics grouped by service plan.
 */
export function aggregatePlanPerformance(purchases = []) {
  const planMap = new Map();

  purchases.forEach((p) => {
    if (!["ACTIVE", "COMPLETED", "PENDING_MANDATE"].includes(p.status)) return;
    const planId = p.itemSnapshot?.planId || "unknown-plan";
    const planTitle = p.itemSnapshot?.planTitle || "Subscription Plan";
    const serviceTitle = p.itemSnapshot?.serviceTitle || "NeedMet Service";
    const isEmi = p.paymentMethod === "EMI";
    const amount = Number(p.pricing?.finalPrice) || 0;

    if (!planMap.has(planId)) {
      planMap.set(planId, {
        planId,
        planTitle,
        serviceTitle,
        category: p.itemSnapshot?.category || "General",
        durationDays: p.itemSnapshot?.durationDays || 30,
        unitsSold: 0,
        grossRevenue: 0,
        fullPaymentCount: 0,
        emiCount: 0,
        activeCount: 0,
        completedCount: 0,
      });
    }

    const item = planMap.get(planId);
    item.unitsSold += 1;
    item.grossRevenue += amount;
    if (isEmi) item.emiCount += 1;
    else item.fullPaymentCount += 1;

    if (p.status === "ACTIVE") item.activeCount += 1;
    if (p.status === "COMPLETED") item.completedCount += 1;
  });

  const list = Array.from(planMap.values());
  // Sort descending by gross revenue
  list.sort((a, b) => b.grossRevenue - a.grossRevenue);
  return list;
}

/**
 * Aggregates customer sales history, LTV, and purchasing frequency.
 */
export function aggregateCustomerSales(purchases = []) {
  const customerMap = new Map();

  purchases.forEach((p) => {
    const uid = String(p.user?.userId || p.userId || "");
    if (!uid) return;
    const amount = Number(p.pricing?.finalPrice) || 0;
    const remaining = Number(p.pricing?.remainingAmount) || 0;
    const pDate = toTimestampMs(p.createdAt);

    if (!customerMap.has(uid)) {
      customerMap.set(uid, {
        user: p.user || {
          userId: uid,
          userName: p.user?.userName || p.userName || "Customer",
          phone: p.user?.phone || p.phone || p.userPhone || "",
        },
        userId: uid,
        userName: p.user?.userName || p.userName || "Customer",
        phone: p.user?.phone || p.phone || p.userPhone || null,
        email: p.user?.email || p.userEmail || null,
        totalOrders: 0,
        confirmedPurchases: 0,
        totalSpent: 0,
        outstandingAmount: 0,
        lastPurchaseDate: p.createdAt,
        lastPurchaseMs: pDate,
        hasActivePlan: false,
        paymentMethods: new Set(),
      });
    }

    const c = customerMap.get(uid);
    c.totalOrders += 1;

    if (["ACTIVE", "COMPLETED", "PENDING_MANDATE"].includes(p.status)) {
      c.confirmedPurchases += 1;
      c.totalSpent += amount;
      c.outstandingAmount += remaining;
      c.paymentMethods.add(p.paymentMethod || "FULL");
    }

    if (p.status === "ACTIVE") {
      c.hasActivePlan = true;
    }

    if (pDate > c.lastPurchaseMs) {
      c.lastPurchaseMs = pDate;
      c.lastPurchaseDate = p.createdAt;
    }
  });

  const list = Array.from(customerMap.values()).map((c) => ({
    ...c,
    paymentMethods: Array.from(c.paymentMethods),
    isRepeatCustomer: c.confirmedPurchases > 1,
  }));

  // Sort descending by total spent
  list.sort((a, b) => b.totalSpent - a.totalSpent);
  return list;
}

/**
 * Extracts and sorts overdue and upcoming EMI installments.
 */
export function extractEmiInstallmentLedger(purchases = []) {
  const nowMs = Date.now();
  const overdue = [];
  const upcoming = [];

  purchases.forEach((p) => {
    if (p.paymentMethod !== "EMI" || !p.mandate?.installments) return;

    p.mandate.installments.forEach((inst) => {
      const dueMs = toTimestampMs(inst.dueDate);
      const isPaid = inst.status === "PAID";

      const ledgerItem = {
        purchaseId: p.id,
        user: p.user || {
          userId: p.user?.userId || p.userId,
          userName: p.user?.userName || p.userName || "Customer",
          phone: p.user?.phone || p.phone || p.userPhone || "",
        },
        SaleBy: p.SaleBy || p.saleBy || null,
        userId: p.user?.userId || p.userId,
        userName: p.user?.userName || p.userName || "Customer",
        phone: p.user?.phone || p.phone || p.userPhone || "",
        serviceTitle: p.itemSnapshot?.serviceTitle || "NeedMet Service",
        planTitle: p.itemSnapshot?.planTitle || "Plan",
        subscriptionId: p.mandate?.subscriptionId || "N/A",
        cycleIndex: inst.cycleIndex,
        dueDate: inst.dueDate,
        amount: Number(inst.amount) || 0,
        status: inst.status,
        paymentId: inst.paymentId,
        paidAt: inst.paidAt,
        dueMs,
      };

      if (!isPaid) {
        if (dueMs > 0 && dueMs < nowMs) {
          overdue.push(ledgerItem);
        } else {
          upcoming.push(ledgerItem);
        }
      }
    });
  });

  // Sort overdue by most delinquent first (ascending due date)
  overdue.sort((a, b) => a.dueMs - b.dueMs);

  // Sort upcoming by soonest due first
  upcoming.sort((a, b) => a.dueMs - b.dueMs);

  return { overdue, upcoming };
}

