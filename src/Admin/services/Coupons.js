import { db } from "../../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  where,
  limit,
  orderBy,
  startAfter,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";
import { getCouponStatus } from "../utils/coupon.utils";

/**
 * Normalizes a raw Firestore coupon document into the strict 12-field schema contract.
 * Preserves backward compatibility by mapping legacy `timesUsed` to `usedCount`.
 *
 * @param {Object} data - Raw document data from Firestore
 * @param {string} id - Document ID
 * @returns {Object} Strictly typed coupon object
 */
export function normalizeCoupon(data, id) {
  if (!data) return null;
  return {
    id: id || data.id,
    code: (data.code || "").toUpperCase().trim(),
    discountType: data.discountType === "fixed" ? "fixed" : "percentage",
    discountValue: Number(data.discountValue) || 0,
    minOrderAmount: Number(data.minOrderAmount) || 0,
    maxDiscountAmount: Number(data.maxDiscountAmount) || 0,
    usageLimit: Math.max(1, Number(data.usageLimit) || 1),
    usedCount: Math.max(0, Number(data.usedCount ?? data.timesUsed ?? 0)),
    status: data.status === "inactive" ? "inactive" : "active",
    expiresAt: data.expiresAt ? String(data.expiresAt).trim() : null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * Fetches all coupons from Firestore 'coupons' collection.
 * Uses centralized getCouponStatus for tab/status filtering.
 *
 * @param {string} [status="all"] - Optional filter ("all" | "active" | "exhausted" | "expired" | "inactive")
 * @returns {Promise<{ success: boolean, coupons: Array }>}
 */
export const getCoupons = async (status = "all") => {
  try {
    const snap = await getDocs(collection(db, "coupons"));
    let coupons = snap.docs.map((d) => normalizeCoupon(d.data(), d.id));

    // Sort newest first by createdAt
    coupons.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    if (status !== "all") {
      coupons = coupons.filter((c) => getCouponStatus(c) === status);
    }

    return { success: true, coupons };
  } catch (err) {
    console.error("Error fetching coupons from Firestore:", err);
    throw err;
  }
};

/**
 * Server-side cursor-paginated coupon retrieval with status filtering and prefix search.
 * @param {Object} options
 * @param {string} [options.status="all"]
 * @param {string} [options.search=""]
 * @param {number} [options.pageSize=10]
 * @param {any} [options.cursor=null]
 * @returns {Promise<{ success: boolean, coupons: Array, lastDoc: any, hasMore: boolean }>}
 */
export const getCouponsPaginated = async ({
  status = "all",
  search = "",
  pageSize = 10,
  cursor = null,
} = {}) => {
  try {
    const coll = collection(db, "coupons");
    const term = (search || "").trim().toUpperCase();
    const fetchLimit = pageSize + 1;
    const todayStr = new Date().toISOString().slice(0, 10);

    let constraints = [];

    if (term) {
      constraints.push(
        orderBy("code", "asc"),
        where("code", ">=", term),
        where("code", "<=", term + "\uf8ff")
      );
    } else if (status === "inactive") {
      constraints.push(
        where("status", "==", "inactive"),
        orderBy("createdAt", "desc")
      );
    } else if (status === "expired") {
      constraints.push(
        where("expiresAt", "<", todayStr),
        orderBy("expiresAt", "desc")
      );
    } else if (status === "active") {
      constraints.push(
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );
    } else if (status === "exhausted") {
      constraints.push(orderBy("usedCount", "desc"));
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
      console.warn("Paginated coupons query fallback:", queryErr.message);
      const fallbackConstraints = cursor ? [startAfter(cursor), limit(fetchLimit)] : [limit(fetchLimit)];
      snap = await getDocs(query(coll, ...fallbackConstraints));
    }

    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const lastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    let coupons = resultDocs.map((d) => normalizeCoupon(d.data(), d.id));

    if (status && status !== "all") {
      coupons = coupons.filter((c) => getCouponStatus(c) === status);
    }

    return {
      success: true,
      coupons,
      lastDoc,
      hasMore,
    };
  } catch (err) {
    console.error("Error in getCouponsPaginated:", err);
    throw err;
  }
};

/**
 * Returns lightweight server count aggregates for coupon tab badges.
 */
export const getCouponCounts = async () => {
  try {
    const coll = collection(db, "coupons");
    const [totalSnap, inactiveSnap] = await Promise.all([
      getCountFromServer(coll),
      getCountFromServer(query(coll, where("status", "==", "inactive"))),
    ]);

    const total = totalSnap.data().count;
    const inactive = inactiveSnap.data().count;

    return {
      total,
      inactive,
      active: Math.max(0, total - inactive),
    };
  } catch (err) {
    console.error("Error fetching coupon counts:", err);
    return { total: 0, inactive: 0, active: 0 };
  }
};

/**
 * Creates a new coupon following the strict 12-field schema.
 * Enforces duplicate code validation and initializes usedCount to 0.
 *
 * @param {Object} couponData - Coupon creation fields
 * @returns {Promise<{ success: boolean, coupon: Object }>}
 */
export const createCoupon = async (couponData) => {
  try {
    const normalizedCode = (couponData.code || "").toUpperCase().trim();
    if (!normalizedCode) {
      throw new Error("Coupon code is required.");
    }

    // Server-side duplicate coupon code check
    const q = query(
      collection(db, "coupons"),
      where("code", "==", normalizedCode)
    );
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      throw new Error(`A coupon with code "${normalizedCode}" already exists.`);
    }

    const docRef = doc(collection(db, "coupons"));
    const payload = {
      id: docRef.id,
      code: normalizedCode,
      discountType: couponData.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: Number(couponData.discountValue) || 0,
      minOrderAmount: Number(couponData.minOrderAmount) || 0,
      maxDiscountAmount: Number(couponData.maxDiscountAmount) || 0,
      usageLimit: Math.max(1, Number(couponData.usageLimit) || 1),
      usedCount: 0,
      status: "active",
      expiresAt: couponData.expiresAt ? String(couponData.expiresAt).trim() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);
    return { success: true, coupon: payload };
  } catch (err) {
    console.error("Error creating coupon in Firestore:", err);
    throw err;
  }
};

/**
 * Updates an existing coupon's allowable configuration fields.
 * Strictly preserves `usedCount` and `createdAt`.
 *
 * @param {string} id - Coupon document ID
 * @param {Object} couponData - Updated fields
 * @returns {Promise<{ success: boolean }>}
 */
export const updateCoupon = async (id, couponData) => {
  try {
    const docRef = doc(db, "coupons", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Coupon not found.");
    }

    const currentData = snap.data();
    const normalizedCode = (couponData.code || currentData.code || "")
      .toUpperCase()
      .trim();

    // If code is being changed, ensure new code is unique
    if (normalizedCode !== currentData.code) {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", normalizedCode)
      );
      const existingSnap = await getDocs(q);
      const conflict = existingSnap.docs.some((d) => d.id !== id);
      if (conflict) {
        throw new Error(`A coupon with code "${normalizedCode}" already exists.`);
      }
    }

    const updatePayload = {
      code: normalizedCode,
      discountType: couponData.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: Number(couponData.discountValue) || 0,
      minOrderAmount: Number(couponData.minOrderAmount) || 0,
      maxDiscountAmount: Number(couponData.maxDiscountAmount) || 0,
      usageLimit: Math.max(
        Number(currentData.usedCount ?? currentData.timesUsed ?? 0),
        Number(couponData.usageLimit) || 1
      ),
      expiresAt: couponData.expiresAt ? String(couponData.expiresAt).trim() : null,
      status: couponData.status || currentData.status || "active",
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updatePayload);
    return { success: true };
  } catch (err) {
    console.error("Error updating coupon in Firestore:", err);
    throw err;
  }
};

/**
 * Toggles a coupon's status between "active" and "inactive".
 *
 * @param {string} id - Coupon document ID
 * @returns {Promise<{ success: boolean, status: string }>}
 */
export const toggleCoupon = async (id) => {
  try {
    const docRef = doc(db, "coupons", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Coupon not found.");
    }

    const currentStatus = snap.data()?.status || "active";
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    await updateDoc(docRef, {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });

    return { success: true, status: nextStatus };
  } catch (err) {
    console.error("Error toggling coupon status in Firestore:", err);
    throw err;
  }
};

/**
 * Strict Business Rule Deletion:
 * If a coupon has been used at least once (usedCount > 0), it must NEVER be deleted.
 * Uses a Firestore transaction for atomic check-and-delete.
 *
 * @param {string} id - Coupon document ID
 * @returns {Promise<{ success: boolean }>}
 */
export const deleteCoupon = async (id) => {
  try {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, "coupons", id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) {
        throw new Error("Coupon not found.");
      }

      const data = snap.data();
      const used = Number(data.usedCount ?? data.timesUsed ?? 0);

      // Strict enforcement: block deletion if ever redeemed
      if (used > 0) {
        throw new Error(
          `Coupon "${data.code || id}" has been redeemed ${used} time(s) and cannot be deleted. You can deactivate it instead.`
        );
      }

      transaction.delete(docRef);
    });

    return { success: true };
  } catch (err) {
    console.error("Error deleting coupon in Firestore:", err);
    throw err;
  }
};

export const couponService = {
  normalizeCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
};

export default couponService;
