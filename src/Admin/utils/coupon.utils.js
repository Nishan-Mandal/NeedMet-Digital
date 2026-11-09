/**
 * Centralized Coupon Utilities
 * Single source of truth for derived Coupon statuses, availability, and formatting.
 *
 * Strict Data Model Contract:
 * {
 *   id: string,
 *   code: string,
 *   discountType: "percentage" | "fixed",
 *   discountValue: number,
 *   minOrderAmount: number,
 *   maxDiscountAmount: number,
 *   usageLimit: number,
 *   usedCount: number,
 *   status: "active" | "inactive",
 *   expiresAt: string, // "YYYY-MM-DD"
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

/**
 * Safely parses any date, timestamp, or "YYYY-MM-DD" date string into a Date object.
 * When parsing an expiration date string "YYYY-MM-DD", treats it as inclusive until 23:59:59.999.
 *
 * @param {any} val - The date or timestamp to parse
 * @param {boolean} [isEndOfDay=false] - Whether to set time to the end of the day for date-only strings
 * @returns {Date | null} Parsed Date object or null
 */
export function parseCouponDate(val, isEndOfDay = false) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === "function") return val.toDate();
  if (typeof val.seconds === "number") return new Date(val.seconds * 1000);

  if (typeof val === "string") {
    const trimmed = val.trim();
    // Match "YYYY-MM-DD" format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      if (isEndOfDay) {
        return new Date(year, month - 1, day, 23, 59, 59, 999);
      }
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Checks if a coupon has expired based on its expiresAt field.
 *
 * @param {Object} coupon - The coupon document
 * @returns {boolean} True if the coupon is expired
 */
export function isCouponExpired(coupon) {
  if (!coupon || !coupon.expiresAt) return false;
  const expiryDate = parseCouponDate(coupon.expiresAt, true);
  if (!expiryDate) return false;
  return expiryDate.getTime() < Date.now();
}

/**
 * Checks if a coupon has reached its total allowed redemptions.
 *
 * @param {Object} coupon - The coupon document
 * @returns {boolean} True if usedCount >= usageLimit
 */
export function isCouponExhausted(coupon) {
  if (!coupon) return false;
  const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);
  const limit = Number(coupon.usageLimit ?? 0);
  return limit > 0 && used >= limit;
}

/**
 * Checks if a coupon is currently available for redemption.
 * A coupon is available only when:
 * - status === "active"
 * - !isCouponExpired
 * - !isCouponExhausted
 *
 * @param {Object} coupon - The coupon document
 * @returns {boolean} True if the coupon can be applied
 */
export function isCouponAvailable(coupon) {
  if (!coupon) return false;
  if (coupon.status !== "active") return false;
  if (isCouponExpired(coupon)) return false;
  if (isCouponExhausted(coupon)) return false;
  return true;
}

/**
 * Derives the canonical operational status of a coupon.
 * Priority:
 * 1. If status === "inactive", status is "inactive"
 * 2. If isCouponExpired(coupon), status is "expired"
 * 3. If isCouponExhausted(coupon), status is "exhausted"
 * 4. Otherwise, status is "active"
 *
 * @param {Object} coupon - The coupon document
 * @returns {"inactive" | "expired" | "exhausted" | "active"}
 */
export function getCouponStatus(coupon) {
  if (!coupon) return "inactive";

  if (coupon.status === "inactive") {
    return "inactive";
  }

  if (isCouponExpired(coupon)) {
    return "expired";
  }

  if (isCouponExhausted(coupon)) {
    return "exhausted";
  }

  return "active";
}

/**
 * Returns human-readable label and UI styling tags for the derived status.
 *
 * @param {Object} coupon - The coupon document
 * @returns {{ label: string, bg: string, text: string, border: string }}
 */
export function getCouponStatusBadge(coupon) {
  const status = getCouponStatus(coupon);

  switch (status) {
    case "inactive":
      return {
        label: "Inactive",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
      };
    case "expired":
      return {
        label: "Expired",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
      };
    case "exhausted":
      return {
        label: "Exhausted",
        bg: "bg-purple-50",
        text: "text-purple-800",
        border: "border-purple-200",
      };
    case "active":
    default:
      return {
        label: "Active",
        bg: "bg-[#e8f5ee]",
        text: "text-[#0f5c3e]",
        border: "border-[#d1fae5]",
      };
  }
}

/**
 * Strict Business Rule:
 * If a coupon has been used at least once (usedCount > 0), it must never be deleted.
 *
 * @param {Object} coupon - The coupon document
 * @returns {boolean} True if the coupon is eligible for deletion
 */
export function canDeleteCoupon(coupon) {
  if (!coupon) return false;
  const used = Number(coupon.usedCount ?? coupon.timesUsed ?? 0);
  return used === 0;
}

/**
 * Formats the discount representation (e.g. "10% OFF" or "₹500 FLAT OFF").
 *
 * @param {Object} coupon - The coupon document
 * @returns {string} Formatted discount string
 */
export function formatCouponDiscount(coupon) {
  if (!coupon) return "—";
  const val = Number(coupon.discountValue || 0);
  if (coupon.discountType === "percentage") {
    return `${val}% OFF`;
  }
  return `₹${val.toLocaleString("en-IN")} FLAT OFF`;
}

/**
 * Calculates days remaining until expiration.
 *
 * @param {Object} coupon - The coupon document
 * @returns {number | null} Number of days remaining or null
 */
export function getCouponDaysRemaining(coupon) {
  if (!coupon || !coupon.expiresAt) return null;
  const expiryDate = parseCouponDate(coupon.expiresAt, true);
  if (!expiryDate) return null;

  const msDiff = expiryDate.getTime() - Date.now();
  return Math.ceil(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Formats date for display.
 *
 * @param {any} val - The date/timestamp value
 * @param {boolean} [includeTime=false] - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatCouponDate(val, includeTime = false) {
  const d = parseCouponDate(val, false);
  if (!d) return "No Expiry";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  });
}

