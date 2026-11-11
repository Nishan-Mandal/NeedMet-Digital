/**
 * Coupon Data Model
 * Collection: "coupons"
 * Document ID: auto-generated Firestore string ID
 *
 * Strict 12-field schema contract.
 * Do NOT add redundant, calculated, or extraneous fields.
 * Display statuses (expired, exhausted, available) are derived at runtime via coupon.utils.js.
 */

/**
 * Example Document Representation
 */
export const couponExample = {
  id: "cpn_doc_id_123",            // String: Firestore document ID
  code: "WELCOME50",               // String: Unique coupon code (uppercase, trimmed)

  discountType: "percentage",       // String: "percentage" | "fixed"
  discountValue: 10,               // Number: Discount percentage (%) or flat amount (₹)

  minOrderAmount: 0,               // Number: Minimum order subtotal required to apply
  maxDiscountAmount: 500,          // Number: Maximum discount ceiling in ₹ (for percentage)

  usageLimit: 100,                 // Number: Total maximum redemptions allowed platform-wide
  usedCount: 0,                    // Number: Current redemption count (initialized to 0)

  status: "active",                // String: "active" | "inactive" (admin controlled lifecycle)
  expiresAt: "2026-12-31",         // String: Expiration date in "YYYY-MM-DD" format

  createdAt: null,                 // Timestamp: Firestore server timestamp of creation
  updatedAt: null,                 // Timestamp: Firestore server timestamp of last update
};

/**
 * Blank / Initial Coupon Object
 */
export const initialCouponModel = {
  id: "",
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: 100,
  usedCount: 0,
  status: "active",
  expiresAt: "",
  createdAt: null,
  updatedAt: null,
};

/**
 * Factory to produce a strict Coupon document payload
 */
export const createCouponPayload = ({
  id = "",
  code = "",
  discountType = "percentage",
  discountValue = 0,
  minOrderAmount = 0,
  maxDiscountAmount = 0,
  usageLimit = 100,
  usedCount = 0,
  status = "active",
  expiresAt = "",
  createdAt = null,
  updatedAt = null,
} = {}) => ({
  id,
  code: (code || "").toUpperCase().trim(),
  discountType: discountType === "fixed" ? "fixed" : "percentage",
  discountValue: Number(discountValue) || 0,
  minOrderAmount: Number(minOrderAmount) || 0,
  maxDiscountAmount: Number(maxDiscountAmount) || 0,
  usageLimit: Math.max(1, Number(usageLimit) || 1),
  usedCount: Math.max(0, Number(usedCount) || 0),
  status: status === "inactive" ? "inactive" : "active",
  expiresAt: expiresAt ? String(expiresAt).trim() : null,
  createdAt: createdAt || null,
  updatedAt: updatedAt || null,
});

export default initialCouponModel;

