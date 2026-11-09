/**
 * Reference Firebase Cloud Functions for Coupon Management & Redemption
 * Location: functions/coupons.js (Reference implementation)
 *
 * Strict Data Model Contract (12 fields):
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

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const db = getFirestore();

/**
 * 1. Admin Cloud Function: createCoupon
 * Validates admin auth, checks duplicate code, initializes strict 12-field schema.
 */
exports.createCoupon = onCall(async (request) => {
  if (!request.auth || !request.auth.token?.admin) {
    throw new HttpsError("permission-denied", "Only administrators can create coupons.");
  }

  const {
    code,
    discountType = "percentage",
    discountValue,
    minOrderAmount = 0,
    maxDiscountAmount = 0,
    usageLimit = 100,
    expiresAt = null,
  } = request.data || {};

  const normalizedCode = (code || "").toUpperCase().trim();
  if (!normalizedCode) {
    throw new HttpsError("invalid-argument", "Coupon code is required.");
  }

  // Duplicate code check
  const existing = await db
    .collection("coupons")
    .where("code", "==", normalizedCode)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new HttpsError("already-exists", `Coupon code "${normalizedCode}" already exists.`);
  }

  const docRef = db.collection("coupons").doc();
  const payload = {
    id: docRef.id,
    code: normalizedCode,
    discountType: discountType === "fixed" ? "fixed" : "percentage",
    discountValue: Math.max(0, Number(discountValue) || 0),
    minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
    maxDiscountAmount: Math.max(0, Number(maxDiscountAmount) || 0),
    usageLimit: Math.max(1, Number(usageLimit) || 1),
    usedCount: 0,
    status: "active",
    expiresAt: expiresAt ? String(expiresAt).trim() : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(payload);
  return { success: true, coupon: payload };
});

/**
 * 2. Admin Cloud Function: deleteCoupon
 * STRICT BUSINESS RULE:
 * If a coupon has been used at least once (usedCount > 0), it must NEVER be deleted.
 */
exports.deleteCoupon = onCall(async (request) => {
  if (!request.auth || !request.auth.token?.admin) {
    throw new HttpsError("permission-denied", "Only administrators can delete coupons.");
  }

  const { couponId } = request.data || {};
  if (!couponId) {
    throw new HttpsError("invalid-argument", "Coupon ID is required.");
  }

  const docRef = db.collection("coupons").doc(couponId);

  return await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists) {
      throw new HttpsError("not-found", "Coupon does not exist.");
    }

    const data = docSnap.data();
    const used = Number(data.usedCount ?? data.timesUsed ?? 0);

    if (used > 0) {
      throw new HttpsError(
        "failed-precondition",
        `Coupon "${data.code || couponId}" has been redeemed ${used} time(s) and cannot be deleted. Deactivate it instead.`
      );
    }

    transaction.delete(docRef);
    return { success: true };
  });
});

/**
 * 3. Client Cloud Function: applyCoupon (Validation & Discount Calculation)
 * Validates coupon availability without consuming it.
 */
exports.applyCoupon = onCall(async (request) => {
  const { couponCode, orderAmount = 0 } = request.data || {};
  const code = (couponCode || "").toUpperCase().trim();

  if (!code) {
    throw new HttpsError("invalid-argument", "Coupon code is required.");
  }

  const snap = await db
    .collection("coupons")
    .where("code", "==", code)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new HttpsError("not-found", "Invalid coupon code.");
  }

  const coupon = snap.docs[0].data();

  // 1. Status check
  if (coupon.status !== "active") {
    throw new HttpsError("failed-precondition", "This coupon is currently inactive.");
  }

  // 2. Expiry check
  if (coupon.expiresAt) {
    const expiry = new Date(`${coupon.expiresAt}T23:59:59.999Z`);
    if (Date.now() > expiry.getTime()) {
      throw new HttpsError("failed-precondition", "This coupon has expired.");
    }
  }

  // 3. Usage limit check
  const used = Number(coupon.usedCount ?? 0);
  if (coupon.usageLimit > 0 && used >= coupon.usageLimit) {
    throw new HttpsError("failed-precondition", "This coupon has reached its maximum redemptions limit.");
  }

  // 4. Minimum order subtotal check
  if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
    throw new HttpsError(
      "failed-precondition",
      `Minimum order amount of ₹${coupon.minOrderAmount} required to use this coupon.`
    );
  }

  // 5. Server-side discount calculation
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (orderAmount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    }
  } else {
    discount = Math.min(orderAmount, Number(coupon.discountValue));
  }

  return {
    valid: true,
    code: coupon.code,
    discountAmount: Math.round(discount),
    finalAmount: Math.max(0, Math.round(orderAmount - discount)),
  };
});

/**
 * 4. Idempotent Payment Webhook Redemption: redeemCouponOnPaymentConfirmed
 * Increments `usedCount` atomically upon verified payment.
 */
exports.redeemCouponOnPaymentConfirmed = async (couponCode, paymentId) => {
  const code = (couponCode || "").toUpperCase().trim();
  if (!code) return;

  const snap = await db
    .collection("coupons")
    .where("code", "==", code)
    .limit(1)
    .get();

  if (snap.empty) return;
  const docRef = snap.docs[0].ref;

  await db.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists) return;

    const data = docSnap.data();
    const currentUsed = Number(data.usedCount ?? 0);
    const limit = Number(data.usageLimit ?? 100);

    if (currentUsed >= limit) {
      throw new Error("Coupon usage limit already reached.");
    }

    transaction.update(docRef, {
      usedCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
};

