/**
 * Centralized Cash Code Utilities
 * Single source of truth for all derived Cash Code statuses and date helpers.
 *
 * Strict Data Model:
 * {
 *   id: string,
 *   code: string,
 *   amount: number,
 *   createdBy: string,
 *   createdById: string,
 *   active: boolean,
 *   isUsed: boolean,
 *   usedBy: string | null,
 *   isRevoked: boolean,
 *   revokeReason: string | null,
 *   createdAt: Timestamp,
 *   expiresAt: Timestamp,
 *   usedAt: Timestamp | null,
 *   paymentId: string | null,
 *   purchaseId: string | null
 * }
 */

/**
 * Safely parses any date/timestamp format into a JavaScript Date object.
 * Supports Firestore Timestamps, seconds objects, Date instances, ISO strings, and milliseconds.
 *
 * @param {any} val - The timestamp to parse
 * @returns {Date | null} Parsed Date object or null if invalid
 */
export function parseTimestamp(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === "function") return val.toDate();
  if (typeof val.seconds === "number") return new Date(val.seconds * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Checks whether a cash code has passed its expiration time.
 *
 * @param {Object} cashCode - The cash code object
 * @returns {boolean} True if the code has expired
 */
export function isCashCodeExpired(cashCode) {
  if (!cashCode) return false;
  const expiryDate = parseTimestamp(cashCode.expiresAt);
  if (!expiryDate) return false;
  return expiryDate.getTime() < Date.now();
}

/**
 * Checks whether a cash code is currently available for redemption.
 * A cash code is available only when:
 * - active === true
 * - isUsed === false
 * - isRevoked === false
 * - Current time is before expiresAt
 *
 * @param {Object} cashCode - The cash code object
 * @returns {boolean} True if the code can be redeemed
 */
export function isCashCodeAvailable(cashCode) {
  if (!cashCode) return false;

  const isActive = cashCode.active !== false;
  const isUsed = Boolean(cashCode.isUsed);
  const isRevoked = Boolean(cashCode.isRevoked || cashCode.status === "revoked");
  const isExpired = isCashCodeExpired(cashCode);

  return isActive && !isUsed && !isRevoked && !isExpired;
}

/**
 * Calculates the canonical status of a cash code based on strict priority:
 * 1. If isRevoked === true, status is "revoked"
 * 2. If isUsed === true, status is "redeemed"
 * 3. If current time exceeds expiresAt, status is "expired"
 * 4. If active === false, status is "inactive"
 * 5. Otherwise, status is "active"
 *
 * @param {Object} cashCode - The cash code object
 * @returns {"revoked" | "redeemed" | "expired" | "inactive" | "active"}
 */
export function getCashCodeStatus(cashCode) {
  if (!cashCode) return "inactive";

  // 1. Revoked check
  if (cashCode.isRevoked === true || cashCode.status === "revoked") {
    return "revoked";
  }

  // 2. Used / Redeemed check
  if (cashCode.isUsed === true) {
    return "redeemed";
  }

  // 3. Expiration check
  if (isCashCodeExpired(cashCode)) {
    return "expired";
  }

  // 4. Active flag check
  if (cashCode.active === false) {
    return "inactive";
  }

  // 5. Otherwise active
  return "active";
}

/**
 * Returns a human-friendly label for the cash code status.
 *
 * @param {Object} cashCode - The cash code object
 * @returns {string} Human-readable label
 */
export function getCashCodeStatusLabel(cashCode) {
  const status = getCashCodeStatus(cashCode);
  switch (status) {
    case "revoked":
      return "Revoked";
    case "redeemed":
      return "Redeemed";
    case "expired":
      return "Expired";
    case "inactive":
      return "Inactive";
    case "active":
    default:
      return "Active";
  }
}

/**
 * Returns the numeric amount of a cash code, handling legacy fields if necessary.
 *
 * @param {Object} cashCode - The cash code object
 * @returns {number}
 */
export function getCashCodeAmount(cashCode) {
  if (!cashCode) return 0;
  const raw = cashCode.amount ?? cashCode.value ?? 0;
  const num = typeof raw === "number" ? raw : parseFloat(raw);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a timestamp into a localized readable date string.
 *
 * @param {any} timestamp - Firestore Timestamp, Date, or string
 * @param {boolean} includeTime - Whether to include hour/minute
 * @returns {string} Formatted date string
 */
export function formatCashCodeDate(timestamp, includeTime = false) {
  const date = parseTimestamp(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/**
 * Calculates remaining days until expiration.
 *
 * @param {Object} cashCode - The cash code object
 * @returns {number | null} Integer days remaining, negative if expired, or null
 */
export function getDaysRemaining(cashCode) {
  if (!cashCode) return null;
  const expiry = parseTimestamp(cashCode.expiresAt);
  if (!expiry) return null;
  const diffMs = expiry.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

