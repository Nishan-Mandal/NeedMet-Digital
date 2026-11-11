/**
 * Utility functions for PurchasedPlanDetailsPage & related Section components
 */

/**
 * Check whether a purchase follows an EMI installment model
 */
export function checkIsEmi(purchase) {
  if (!purchase) return false;
  return (
    String(purchase.paymentMethod || purchase.paymentType || "").toUpperCase() === "EMI" ||
    purchase.isEmi === true ||
    Boolean(purchase.mandate)
  );
}

/**
 * Derive status badge configuration (label, icon, color variants)
 */
export function getStatusConfig(purchase) {
  if (!purchase) {
    return {
      label: "Processing",
      variant: "neutral",
      icon: "hourglass_top",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
      dotClass: "bg-blue-500",
    };
  }

  const isEmi = checkIsEmi(purchase);
  const mandateStatus = String(purchase.mandate?.status || "").toUpperCase();
  const isMandateAuthorized = mandateStatus === "AUTHORIZED";
  const statusUpper = String(purchase.status || "").toUpperCase();
  const isPlanMarkedActive =
    statusUpper === "ACTIVE" ||
    purchase.planAccessStatus === "active" ||
    purchase.status === "active";

  if (statusUpper === "PENDING_MANDATE" || (isEmi && !isMandateAuthorized && statusUpper !== "ACTIVE")) {
    return {
      label: "Action Required: AutoPay",
      variant: "warning",
      icon: "pending_actions",
      badgeClass: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200/60",
      dotClass: "bg-amber-500 animate-pulse",
    };
  }

  if (statusUpper === "ACTIVE" || (isPlanMarkedActive && (!isEmi || isMandateAuthorized))) {
    return {
      label: "Active Plan",
      variant: "success",
      icon: "verified",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-200/50",
      dotClass: "bg-emerald-500",
    };
  }

  if (
    statusUpper === "COMPLETED" ||
    purchase.status === "completed" ||
    purchase.planAccessStatus === "completed"
  ) {
    return {
      label: "Completed",
      variant: "neutral",
      icon: "task_alt",
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      dotClass: "bg-gray-400",
    };
  }

  if (
    statusUpper === "CANCELLED" ||
    statusUpper === "REFUNDED" ||
    statusUpper === "FAILED" ||
    purchase.status === "cancelled" ||
    purchase.planAccessStatus === "cancelled" ||
    purchase.status === "failed"
  ) {
    return {
      label: "Cancelled",
      variant: "neutral",
      icon: "cancel",
      badgeClass: "bg-red-50 text-red-800 border-red-200",
      dotClass: "bg-red-500",
    };
  }

  if (
    statusUpper === "PENDING_PAYMENT" ||
    statusUpper === "PENDING" ||
    purchase.status === "pending" ||
    purchase.upfrontPayment?.status === "pending"
  ) {
    return {
      label: "Payment Incomplete",
      variant: "warning",
      icon: "pending",
      badgeClass: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200/60",
      dotClass: "bg-amber-500",
    };
  }

  return {
    label: "Processing",
    variant: "neutral",
    icon: "hourglass_top",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  };
}

/**
 * Safely parses any date, timestamp, seconds object, or date string into a Date object.
 */
export function parseSafeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === "function") {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {}
  }
  // Firestore serialized timestamps { seconds, nanoseconds } or { _seconds, _nanoseconds }
  if (typeof val === "object") {
    const sec = val.seconds ?? val._seconds;
    if (typeof sec === "number" && !isNaN(sec)) {
      return new Date(sec * 1000);
    }
  }
  if (typeof val === "number") {
    const ms = val < 100000000000 ? val * 1000 : val;
    const d = new Date(ms);
    return !isNaN(d.getTime()) ? d : null;
  }
  if (typeof val === "string") {
    const num = Number(val);
    if (!isNaN(num) && String(num) === val.trim() && num > 1000000) {
      const ms = num < 100000000000 ? num * 1000 : num;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d : null;
  }
  return null;
}

/**
 * Format timestamp or Date object safely as DD MMM YYYY (e.g. 10 Nov 2026)
 */
export function formatPlanDate(dateVal, fallbackVal = null) {
  const d = parseSafeDate(dateVal) || parseSafeDate(fallbackVal) || new Date();
  try {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Safely parse a date from Firestore Timestamp, Date instance, or string
 */
export function getSafeDate(rawDate, fallbackDate = new Date()) {
  const parsed = parseSafeDate(rawDate);
  if (parsed) return parsed;
  const fallback = parseSafeDate(fallbackDate);
  return fallback || new Date();
}

/**
 * Extract date if encoded inside purchase ID (e.g. NM20240812...)
 */
export function extractDateFromId(idStr) {
  if (!idStr || typeof idStr !== "string") return null;
  const match = idStr.match(/(?:NM|order_)?(\d{4})(\d{2})(\d{2})/i);
  if (match) {
    const [_, y, m, d] = match;
    const parsed = new Date(`${y}-${m}-${d}T10:00:00Z`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * Derive duration in days from purchase object or fallback intelligently
 */
export function deriveDurationDays(purchase) {
  if (!purchase) return 90;
  if (purchase.itemSnapshot?.durationDays && !isNaN(Number(purchase.itemSnapshot.durationDays)) && Number(purchase.itemSnapshot.durationDays) > 0) {
    return Number(purchase.itemSnapshot.durationDays);
  }
  if (purchase.durationDays && !isNaN(Number(purchase.durationDays)) && Number(purchase.durationDays) > 0) {
    return Number(purchase.durationDays);
  }
  if (purchase.accessWindow?.activatedAt && purchase.accessWindow?.expiresAt) {
    const act = parseSafeDate(purchase.accessWindow.activatedAt);
    const exp = parseSafeDate(purchase.accessWindow.expiresAt);
    if (act && exp && exp.getTime() > act.getTime()) {
      return Math.max(1, Math.round((exp.getTime() - act.getTime()) / (24 * 60 * 60 * 1000)));
    }
  }
  const nameStr = `${purchase.itemSnapshot?.planTitle || ""} ${purchase.planName || ""} ${purchase.planType || ""} ${purchase.duration || ""} ${Array.isArray(purchase.plans) ? purchase.plans[0]?.duration || "" : ""}`;
  const mMatch = nameStr.match(/(\d+)\s*(?:M|Months?)/i);
  if (mMatch && Number(mMatch[1]) > 0) return Number(mMatch[1]) * 30;
  const dMatch = nameStr.match(/(\d+)\s*(?:D|Days?)/i);
  if (dMatch && Number(dMatch[1]) > 0) return Number(dMatch[1]);
  const yMatch = nameStr.match(/(\d+)\s*(?:Y|Years?)/i);
  if (yMatch && Number(yMatch[1]) > 0) return Number(yMatch[1]) * 365;

  const cycles = Number(purchase.mandate?.totalCycles ?? purchase.pricing?.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  if (cycles > 0) return Math.max((cycles + 1) * 30, 30);

  return 90;
}

/**
 * Format currency consistently as ₹X,XX,XXX
 */
export function formatCurrency(num) {
  return `₹${Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Derive clean purchase reference code (e.g. NM20240812YW7K)
 */
export function derivePurchaseReference(purchase, baseDate = new Date()) {
  if (!purchase) return "Plan Ref";
  if (purchase.purchaseReference) return purchase.purchaseReference;
  if (purchase.orderId && !purchase.orderId.startsWith("order_") && purchase.orderId.length <= 16) {
    return purchase.orderId;
  }
  if (purchase.id && purchase.id.length <= 16 && !purchase.id.includes("-")) {
    return purchase.id.toUpperCase();
  }
  const bDate = baseDate instanceof Date ? baseDate : new Date(baseDate);
  const y = bDate.getFullYear();
  const m = String(bDate.getMonth() + 1).padStart(2, "0");
  const d = String(bDate.getDate()).padStart(2, "0");
  const seed = String(purchase.id || purchase.orderId || purchase.razorpayOrderId || "YW7K").replace(/[^a-zA-Z0-9]/g, "");
  const hash = seed.slice(-4).toUpperCase() || "YW7K";
  return `NM${y}${m}${d}${hash}`;
}

/**
 * Copy text to clipboard safely
 */
export async function copyToClipboardSafe(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback if permissions blocked
  }
  return false;
}
