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
  const isMandateAuthorized = purchase.mandate?.status === "authorized";
  const isPlanMarkedActive =
    purchase.planAccessStatus === "active" || purchase.status === "active";

  if (isEmi && !isMandateAuthorized) {
    return {
      label: "Action Required: AutoPay",
      variant: "warning",
      icon: "pending_actions",
      badgeClass: "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200/60",
      dotClass: "bg-amber-500 animate-pulse",
    };
  }

  if (isPlanMarkedActive) {
    return {
      label: "Active Plan",
      variant: "success",
      icon: "verified",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-200/50",
      dotClass: "bg-emerald-500",
    };
  }

  if (purchase.status === "completed" || purchase.planAccessStatus === "completed") {
    return {
      label: "Completed",
      variant: "neutral",
      icon: "task_alt",
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      dotClass: "bg-gray-400",
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
 * Format timestamp or Date object safely as DD MMM YYYY (e.g. 12 Aug 2024)
 */
export function formatPlanDate(dateVal, fallbackVal = null) {
  const target = dateVal || fallbackVal || Date.now();
  try {
    const d = target?.toDate ? target.toDate() : new Date(target);
    if (isNaN(d.getTime())) return "12 Aug 2024";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "12 Aug 2024";
  }
}

/**
 * Safely parse a date from Firestore Timestamp, Date instance, or string
 */
export function getSafeDate(rawDate, fallbackDate = new Date()) {
  if (!rawDate) return fallbackDate;
  if (typeof rawDate.toDate === "function") {
    const d = rawDate.toDate();
    return !isNaN(d.getTime()) ? d : fallbackDate;
  }
  if (rawDate instanceof Date) {
    return !isNaN(rawDate.getTime()) ? rawDate : fallbackDate;
  }
  const d = new Date(rawDate);
  return !isNaN(d.getTime()) ? d : fallbackDate;
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
  if (purchase.durationDays && !isNaN(Number(purchase.durationDays)) && Number(purchase.durationDays) > 0) {
    return Number(purchase.durationDays);
  }
  const nameStr = `${purchase.planName || ""} ${purchase.planType || ""} ${purchase.duration || ""}`;
  const mMatch = nameStr.match(/(\d+)\s*(?:M|Months?)/i);
  if (mMatch) return Number(mMatch[1]) * 30;
  const dMatch = nameStr.match(/(\d+)\s*(?:D|Days?)/i);
  if (dMatch) return Number(dMatch[1]);
  const yMatch = nameStr.match(/(\d+)\s*(?:Y|Years?)/i);
  if (yMatch) return Number(yMatch[1]) * 365;

  const cycles = Number(purchase.pricing?.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  if (cycles > 0) return cycles * 30;

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
