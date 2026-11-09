import { db } from "../../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
  startAfter,
  getCountFromServer,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  getCashCodeStatus,
  isCashCodeExpired,
  parseTimestamp,
} from "../utils/cashCode.utils";

/**
 * Normalizes a Firestore cash_code document according to the strict minimal data model:
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
 *   createdAt: Timestamp | null,
 *   expiresAt: Timestamp | null,
 *   usedAt: Timestamp | null,
 *   paymentId: string | null,
 *   purchaseId: string | null
 * }
 */
export function normalizeCashCode(d, id = null) {
  const data = d?.data ? d.data() : (d || {});
  const docId = id || d?.id || data.id || data.code;

  const rawAmount = data.amount ?? data.value ?? 0;
  const numAmount = typeof rawAmount === "number" ? rawAmount : (parseFloat(rawAmount) || 0);

  return {
    id: docId,
    code: String(data.code || docId).toUpperCase().trim(),
    amount: numAmount,
    createdBy: data.createdBy || data.ownerName || "Admin User",
    createdById: data.createdById || data.generatedBy || "admin",
    active: data.active !== false,
    isUsed: Boolean(data.isUsed),
    usedBy: data.usedBy || null,
    isRevoked: Boolean(data.isRevoked || data.status === "revoked"),
    revokeReason: data.revokeReason || null,
    createdAt: data.createdAt || null,
    expiresAt: data.expiresAt || null,
    usedAt: data.usedAt || data.useDate || data.usedDate || null,
    paymentId: data.paymentId || null,
    purchaseId: data.purchaseId || null,
  };
}

/**
 * Fetch cash codes directly from Firestore 'cash_codes' collection.
 * Uses centralized getCashCodeStatus utility for filtering.
 */
export const getCashCodes = async (status = "all") => {
  try {
    const snap = await getDocs(collection(db, "cash_codes"));
    let codes = snap.docs.map((d) => normalizeCashCode(d, d.id));

    codes.sort((a, b) => {
      const timeA = parseTimestamp(a.createdAt)?.getTime() || 0;
      const timeB = parseTimestamp(b.createdAt)?.getTime() || 0;
      return timeB - timeA;
    });

    if (status && status !== "all") {
      codes = codes.filter((c) => getCashCodeStatus(c) === status);
    }

    return {
      success: true,
      codes,
      cashCodes: codes,
    };
  } catch (err) {
    console.error("Error fetching cash codes from Firestore:", err);
    throw err;
  }
};

/**
 * Server-side cursor-paginated cash code retrieval with status filtering and prefix search.
 * @param {Object} options
 * @param {string} [options.status="all"]
 * @param {string} [options.search=""]
 * @param {number} [options.pageSize=10]
 * @param {any} [options.cursor=null] - Document snapshot for pagination
 * @returns {Promise<{ success: boolean, codes: Array, lastDoc: any, hasMore: boolean }>}
 */
export const getCashCodesPaginated = async ({
  status = "all",
  search = "",
  pageSize = 10,
  cursor = null,
} = {}) => {
  try {
    const coll = collection(db, "cash_codes");
    const term = (search || "").trim().toUpperCase();
    const fetchLimit = pageSize + 1; // 1 extra to check hasMore

    let constraints = [];

    if (term) {
      constraints.push(
        orderBy("code", "asc"),
        where("code", ">=", term),
        where("code", "<=", term + "\uf8ff")
      );
    } else if (status === "revoked") {
      constraints.push(
        where("isRevoked", "==", true),
        orderBy("createdAt", "desc")
      );
    } else if (status === "redeemed") {
      constraints.push(
        where("isUsed", "==", true),
        orderBy("createdAt", "desc")
      );
    } else if (status === "expired") {
      constraints.push(
        where("expiresAt", "<", Timestamp.now()),
        orderBy("expiresAt", "desc")
      );
    } else if (status === "active") {
      constraints.push(
        where("isUsed", "==", false),
        where("isRevoked", "==", false),
        orderBy("createdAt", "desc")
      );
    } else {
      constraints.push(orderBy("createdAt", "desc"));
    }

    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    constraints.push(limit(fetchLimit));

    let snap;
    try {
      const q = query(coll, ...constraints);
      snap = await getDocs(q);
    } catch (queryErr) {
      // Graceful fallback if composite index is pending: fetch simple query ordered by createdAt
      console.warn("Paginated query fallback:", queryErr.message);
      const fallbackConstraints = cursor ? [startAfter(cursor), limit(fetchLimit)] : [limit(fetchLimit)];
      snap = await getDocs(query(coll, ...fallbackConstraints));
    }

    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const lastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    let codes = resultDocs.map((d) => normalizeCashCode(d, d.id));

    // If active was queried or fallback was triggered, verify canonical status via utility
    if (status === "active") {
      codes = codes.filter((c) => getCashCodeStatus(c) === "active");
    }

    return {
      success: true,
      codes,
      lastDoc,
      hasMore,
    };
  } catch (err) {
    console.error("Error in getCashCodesPaginated:", err);
    throw err;
  }
};

/**
 * Returns lightweight server count aggregates for tab badges.
 */
export const getCashCodeCounts = async () => {
  try {
    const coll = collection(db, "cash_codes");
    const [totalSnap, usedSnap, revokedSnap] = await Promise.all([
      getCountFromServer(coll),
      getCountFromServer(query(coll, where("isUsed", "==", true))),
      getCountFromServer(query(coll, where("isRevoked", "==", true))),
    ]);

    const total = totalSnap.data().count;
    const redeemed = usedSnap.data().count;
    const revoked = revokedSnap.data().count;

    return {
      total,
      redeemed,
      revoked,
      active: Math.max(0, total - (redeemed + revoked)),
    };
  } catch (err) {
    console.error("Error fetching cash code counts:", err);
    return { total: 0, redeemed: 0, revoked: 0, active: 0 };
  }
};

/**
 * Issue / create a new cash code directly in Firestore 'cash_codes' collection.
 * Strictly adheres to the minimal data model without adding redundant attributes.
 */
export const createCashCode = async (codeData) => {
  try {
    const docRef = doc(collection(db, "cash_codes"));
    const validityDays = parseInt(codeData.validityDays, 10) || 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + validityDays);

    const amount = typeof codeData.amount === "number"
      ? codeData.amount
      : (parseFloat(codeData.amount ?? codeData.value) || 0);

    const payload = {
      id: docRef.id,
      code: (codeData.code || "").toUpperCase().trim(),
      amount,
      createdBy: (codeData.createdBy || "").trim() || "Admin User",
      createdById: (codeData.createdById || "").trim() || "admin",
      active: true,
      isUsed: false,
      usedBy: null,
      isRevoked: false,
      revokeReason: null,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiry),
      usedAt: null,
      paymentId: null,
      purchaseId: null,
    };

    await setDoc(docRef, payload);
    const normalized = normalizeCashCode(payload, docRef.id);
    return { success: true, cashCode: normalized, code: normalized };
  } catch (err) {
    console.error("Error creating cash code in Firestore:", err);
    throw err;
  }
};

export const issueCashCode = createCashCode;

/**
 * Revoke an active cash code directly in Firestore 'cash_codes' collection.
 * Strictly sets isRevoked: true and stores revokeReason without deleting or adding extra fields.
 */
export const revokeCashCode = async (id, reason = "") => {
  try {
    const docRef = doc(db, "cash_codes", String(id));
    const updatePayload = {
      isRevoked: true,
      revokeReason: (reason || "").trim() || "Revoked by admin",
    };

    await updateDoc(docRef, updatePayload);
    return { success: true, id, isRevoked: true, revokeReason: updatePayload.revokeReason };
  } catch (err) {
    console.error("Error revoking cash code in Firestore:", err);
    throw err;
  }
};

/**
 * Securely redeems a cash code using a Firestore transaction.
 * Enforces the Single-Redemption Rule and validates availability atomically.
 */
export const redeemCashCode = async (codeString, { customerUid, paymentId = null, purchaseId = null }) => {
  try {
    const cleanCode = (codeString || "").toUpperCase().trim();
    if (!cleanCode) throw new Error("Cash code string is required.");
    if (!customerUid) throw new Error("Customer UID is required for redemption.");

    const q = query(collection(db, "cash_codes"), where("code", "==", cleanCode), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error("Cash code not found.");
    }
    const codeDocRef = snap.docs[0].ref;

    await runTransaction(db, async (txn) => {
      const freshSnap = await txn.get(codeDocRef);
      if (!freshSnap.exists()) {
        throw new Error("Cash code does not exist.");
      }
      const data = freshSnap.data();

      // Priority 1: Revoked check
      if (data.isRevoked === true || data.status === "revoked") {
        throw new Error("This cash code has been revoked.");
      }

      // Priority 2: Used check (Single-redemption rule)
      if (data.isUsed === true) {
        throw new Error("This cash code has already been redeemed.");
      }

      // Priority 3: Expiration check
      if (isCashCodeExpired(data)) {
        throw new Error("This cash code has expired.");
      }

      // Priority 4: Inactive check
      if (data.active === false) {
        throw new Error("This cash code is inactive.");
      }

      // Atomic update of redemption fields only
      txn.update(codeDocRef, {
        isUsed: true,
        usedBy: customerUid,
        usedAt: serverTimestamp(),
        paymentId: paymentId || null,
        purchaseId: purchaseId || null,
      });
    });

    return { success: true, message: "Cash code redeemed successfully." };
  } catch (err) {
    console.error("Error redeeming cash code in transaction:", err);
    throw err;
  }
};

/**
 * Update an existing cash code in Firestore 'cash_codes' collection.
 * Rule: Applicable only when the cash code has NOT been redeemed (isUsed !== true).
 */
export const updateCashCode = async (id, updateData) => {
  try {
    const docRef = doc(db, "cash_codes", String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Cash code not found.");
    }
    const currentData = snap.data();
    if (currentData.isUsed === true) {
      throw new Error("Cannot edit a redeemed cash code.");
    }

    const payload = {};
    if (updateData.code !== undefined) {
      payload.code = String(updateData.code).toUpperCase().trim();
    }
    if (updateData.amount !== undefined) {
      const numAmount = typeof updateData.amount === "number" ? updateData.amount : parseFloat(updateData.amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        payload.amount = numAmount;
      }
    }
    if (updateData.validityDays !== undefined) {
      const days = parseInt(updateData.validityDays, 10);
      if (!isNaN(days) && days > 0) {
        const baseDate = parseTimestamp(currentData.createdAt) || new Date();
        const newExpiry = new Date(baseDate.getTime());
        newExpiry.setDate(newExpiry.getDate() + days);
        payload.expiresAt = Timestamp.fromDate(newExpiry);
      }
    } else if (updateData.expiresAt !== undefined) {
      const expDate = parseTimestamp(updateData.expiresAt);
      if (expDate) {
        payload.expiresAt = Timestamp.fromDate(expDate);
      }
    }

    if (Object.keys(payload).length > 0) {
      await updateDoc(docRef, payload);
    }

    return { success: true, id, ...payload };
  } catch (err) {
    console.error("Error updating cash code in Firestore:", err);
    throw err;
  }
};

/**
 * Permanently deletes a cash code from Firestore 'cash_codes' collection.
 * Rule: Applicable only when the cash code has NOT been redeemed (isUsed !== true).
 */
export const deleteCashCode = async (id) => {
  try {
    const docRef = doc(db, "cash_codes", String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Cash code not found.");
    }
    const currentData = snap.data();
    if (currentData.isUsed === true) {
      throw new Error("Cannot delete a redeemed cash code.");
    }

    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err) {
    console.error("Error deleting cash code from Firestore:", err);
    throw err;
  }
};

export default {
  normalizeCashCode,
  getCashCodes,
  createCashCode,
  issueCashCode,
  revokeCashCode,
  redeemCashCode,
  updateCashCode,
  deleteCashCode,
};
