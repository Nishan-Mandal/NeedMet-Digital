/**
 * Firebase Cloud Functions (v2 / v1) Reference Implementation for Cash Codes
 * Follows the Strict Minimal Data Model.
 *
 * Strict Firestore Document Schema:
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

// Example Cloud Functions implementation for Node.js / Firebase Functions:

export const cloudFunctionsReference = `
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const db = admin.firestore();

// Helper: check if cash code is expired
function isExpired(timestamp) {
  if (!timestamp) return false;
  const d = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
  return d.getTime() < Date.now();
}

/**
 * 1. Admin Callable: Generate / Issue Cash Code
 */
exports.generateCashCode = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  // Verify Admin privilege
  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userData = userDoc.data() || {};
  if (userData.role !== "admin" && !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Only administrators can issue cash codes.");
  }

  const { code, amount, validityDays = 30 } = request.data;
  if (!code || !amount) {
    throw new HttpsError("invalid-argument", "Cash code and amount are required.");
  }

  const cleanCode = String(code).toUpperCase().trim();
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new HttpsError("invalid-argument", "Amount must be a positive number.");
  }

  // Check unique code
  const existingSnap = await db.collection("cash_codes").where("code", "==", cleanCode).limit(1).get();
  if (!existingSnap.empty) {
    throw new HttpsError("already-exists", "A cash code with this code already exists.");
  }

  const docRef = db.collection("cash_codes").doc();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (parseInt(validityDays, 10) || 30));

  const creatorName = userData.fullName || userData.name || request.auth.token.name || request.auth.token.email || "Admin User";

  // Strict Data Model payload
  const payload = {
    id: docRef.id,
    code: cleanCode,
    amount: numAmount,
    createdBy: creatorName,
    createdById: request.auth.uid,
    active: true,
    isUsed: false,
    usedBy: null,
    isRevoked: false,
    revokeReason: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiry),
    usedAt: null,
    paymentId: null,
    purchaseId: null,
  };

  await docRef.set(payload);
  return { success: true, cashCode: payload };
});

/**
 * 2. Callable: Verify and Redeem Cash Payment
 * Concurrency-safe single-redemption inside a Firestore transaction.
 */
exports.verifyCashPayment = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }
  const userId = request.auth.uid;
  const { serviceId, planId, couponCode = null, code } = request.data;

  if (!serviceId || !planId || !code) {
    throw new HttpsError("invalid-argument", "Missing required purchase fields.");
  }

  // 1. Fetch Service and Plan to verify exact server-side price
  const serviceSnap = await db.collection("services").doc(serviceId).get();
  if (!serviceSnap.exists) {
    throw new HttpsError("not-found", "Service not found.");
  }
  const service = serviceSnap.data();
  const plan = (service.plans || []).find((p) => p.planId === planId);
  if (!plan) {
    throw new HttpsError("not-found", "Plan not found.");
  }

  // 2. Server-side discount calculation (never trust client amounts)
  const originalPrice = Number(plan.price);
  let discountAmount = 0;
  let couponId = null;
  if (couponCode) {
    const couponSnap = await db.collection("coupons").where("code", "==", String(couponCode).toUpperCase().trim()).limit(1).get();
    if (!couponSnap.empty) {
      const cData = couponSnap.docs[0].data();
      if (cData.type === "PERCENTAGE") {
        discountAmount = Math.round((originalPrice * Number(cData.discount || 0)) / 100);
      } else {
        discountAmount = Number(cData.discount || 0);
      }
      couponId = couponSnap.docs[0].id;
    }
  }
  const finalPrice = Math.max(Math.round((originalPrice - discountAmount) * 100) / 100, 0);

  // 3. Find cash code document
  const cleanCode = String(code).toUpperCase().trim();
  const codeSnap = await db.collection("cash_codes").where("code", "==", cleanCode).limit(1).get();
  if (codeSnap.empty) {
    throw new HttpsError("not-found", "Invalid cash code.");
  }
  const codeDoc = codeSnap.docs[0];
  const codeRef = codeDoc.ref;

  const paymentId = \`pay_CASH_\${codeDoc.id}\`;
  const purchaseId = \`purch_CASH_\${codeDoc.id}\`;
  const paymentRef = db.collection("payments").doc(paymentId);
  const purchaseRef = db.collection("purchases").doc(purchaseId);

  // 4. Atomic Concurrency-Safe Transaction
  await db.runTransaction(async (txn) => {
    const freshCodeSnap = await txn.get(codeRef);
    if (!freshCodeSnap.exists) {
      throw new HttpsError("not-found", "Cash code does not exist.");
    }
    const freshCode = freshCodeSnap.data();

    // Priority 1: Revocation
    if (freshCode.isRevoked === true || freshCode.status === "revoked") {
      throw new HttpsError("failed-precondition", "This cash code has been revoked.");
    }

    // Priority 2: Idempotent retry vs Used
    if (freshCode.isUsed === true) {
      if (freshCode.usedBy === userId && freshCode.purchaseId) {
        // Idempotent retry: already safely processed
        return;
      }
      throw new HttpsError("failed-precondition", "This cash code has already been redeemed.");
    }

    // Priority 3: Expiration
    if (isExpired(freshCode.expiresAt)) {
      throw new HttpsError("failed-precondition", "This cash code has expired.");
    }

    // Priority 4: Active check
    if (freshCode.active === false) {
      throw new HttpsError("failed-precondition", "This cash code is inactive.");
    }

    // Price verification
    const codeAmount = Number(freshCode.amount);
    if (codeAmount !== finalPrice) {
      throw new HttpsError("failed-precondition", \`Cash code amount (₹\${codeAmount}) does not match plan price (₹\${finalPrice}).\`);
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan.durationDays || 30));

    // A. Update cash code strictly with single-redemption fields
    txn.update(codeRef, {
      isUsed: true,
      usedBy: userId,
      usedAt: now,
      paymentId: paymentId,
      purchaseId: purchaseId,
    });

    // B. Create payment record
    txn.set(paymentRef, {
      id: paymentId,
      userId,
      amount: finalPrice,
      currency: "INR",
      paymentMethod: "CASH_CODE",
      cashCode: cleanCode,
      status: "COMPLETED",
      purchaseId,
      serviceId,
      planId,
      createdAt: now,
    });

    // C. Create purchase / subscription record
    txn.set(purchaseRef, {
      id: purchaseId,
      userId,
      serviceId,
      serviceName: service.title || service.name || "Digital Service",
      planId,
      planName: plan.name || "Standard Plan",
      paymentMethod: "CASH_CODE",
      cashCode: cleanCode,
      couponId,
      couponCode,
      amountPaid: finalPrice,
      startDate: admin.firestore.Timestamp.fromDate(startDate),
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    });
  });

  return {
    success: true,
    purchaseId,
    paymentId,
    message: "Cash payment verified and plan activated successfully.",
  };
});

/**
 * 3. Admin Callable: Revoke Cash Code
 */
exports.revokeCashCode = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userData = userDoc.data() || {};
  if (userData.role !== "admin" && !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Only administrators can revoke cash codes.");
  }

  const { id, reason = "" } = request.data;
  if (!id) {
    throw new HttpsError("invalid-argument", "Cash code ID is required.");
  }

  const codeRef = db.collection("cash_codes").doc(String(id));
  const snap = await codeRef.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Cash code not found.");
  }

  // Strictly update only isRevoked and revokeReason
  await codeRef.update({
    isRevoked: true,
    revokeReason: String(reason).trim() || "Revoked by admin",
  });

  return { success: true, id, isRevoked: true };
});
\`;

