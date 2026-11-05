import {
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { verifyPaymentCallable } from "./cloudFunctions";
import {
    formatPlanDuration,
    getSafeDurationDays,
    formatPlanTitle,
    sanitizePlanVariant,
    isZeroOrEmptyDuration,
} from "../utils/duration.utils";

export const fetchServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const services = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter out archived or inactive services from storefront
            if (data.status === "archived" || data.isActive === false || data.isArchived === true) {
                return;
            }
            const rawPlans = data.plans || data.variants || [];
            const cleanPlans = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            services.push({
                id: doc.id,
                ...data,
                plans: cleanPlans,
                variants: cleanPlans,
            });
        });
        return services;
    } catch (error) {
        console.error("Error fetching services: ", error);
        return [];
    }
};

export const fetchServiceById = async (serviceId) => {
    try {
        const docRef = doc(db, "services", String(serviceId));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const rawPlans = data.plans || data.variants || [];
            const cleanPlans = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            return {
                id: docSnap.id,
                ...data,
                plans: cleanPlans,
                variants: cleanPlans,
            };
        } else {
            console.log("No such service!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching service: ", error);
        return null;
    }
};

export const fetchReviews = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        return reviews;
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        return [];
    }
};

export const fetchPlans = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const services = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const rawPlans = data.plans || data.variants || [];
            const cleanPlans = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            services.push({
                id: doc.id,
                ...data,
                plans: cleanPlans,
                variants: cleanPlans,
            });
        });
        return services;
    } catch (error) {
        console.error("Error fetching plans from services: ", error);
        return [];
    }
};

export const fetchPlanById = async (planId) => {
    try {
        const idStr = String(planId);

        // 1. Direct document lookup in 'services' collection
        const serviceRef = doc(db, "services", idStr);
        const serviceSnap = await getDoc(serviceRef);
        if (serviceSnap.exists()) {
            const serviceData = serviceSnap.data();
            const rawPlans = serviceData.plans || serviceData.variants || [];
            const plans = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            return {
                id: serviceSnap.id,
                serviceId: serviceSnap.id,
                planId: serviceSnap.id,
                name: serviceData.title || serviceData.name || "Service Plan",
                title: serviceData.title || serviceData.name || "Service Plan",
                description: serviceData.description || "",
                category: serviceData.category || "Digital Marketing",
                tag: serviceData.badge || serviceData.tag || (plans[0]?.tag || "Popular"),
                badge: serviceData.badge || serviceData.tag || (plans[0]?.tag || "POPULAR"),
                imageUrl: serviceData.imageUrl
                    ? (Array.isArray(serviceData.imageUrl) ? serviceData.imageUrl : [serviceData.imageUrl])
                    : (serviceData.image ? [serviceData.image] : []),
                status: serviceData.status || "published",
                isActive: serviceData.isActive !== undefined ? Boolean(serviceData.isActive) : true,
                plans: plans,
                variants: plans,
                datesConfig: serviceData.datesConfig || null,
                notes: serviceData.notes || "",
                createdBy: serviceData.createdBy,
                creatorEmail: serviceData.creatorEmail,
                createdAt: serviceData.createdAt,
                updatedBy: serviceData.updatedBy,
                updatedAt: serviceData.updatedAt,
                source: "services",
            };
        }

        // 2. Fallback: Search all service plans in 'services' collection by variant sub-planId
        const servicesSnapshot = await getDocs(collection(db, "services"));
        for (const sDoc of servicesSnapshot.docs) {
            const serviceData = sDoc.data();
            const serviceId = sDoc.id;

            const rawPlans = serviceData.plans || serviceData.variants || [];
            const plans = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            const foundIndex = plans.findIndex((p) => p.planId === planId || p.id === planId);
            if (foundIndex !== -1) {
                const found = plans[foundIndex];
                return {
                    id: serviceId,
                    serviceId: serviceId,
                    planId: found.planId || planId,
                    name: serviceData.title || found.name || "Service Plan",
                    title: serviceData.title || found.name || "Service Plan",
                    description: found.description || serviceData.description || "",
                    category: serviceData.category || "Digital Marketing",
                    tag: found.tag || serviceData.badge || "Popular",
                    badge: serviceData.badge || "POPULAR",
                    imageUrl: found.imageUrl && found.imageUrl.length > 0 ? found.imageUrl : (serviceData.imageUrl ? (Array.isArray(serviceData.imageUrl) ? serviceData.imageUrl : [serviceData.imageUrl]) : []),
                    status: found.status || serviceData.status || "published",
                    isActive: found.isActive !== undefined ? Boolean(found.isActive) : true,
                    variants: plans,
                    plans: plans,
                    selectedVariantIndex: foundIndex,
                    source: "services",
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching plan by ID: ", error);
        return null;
    }
};

export const fetchCategories = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "service-categories"));
        const categories = [];
        querySnapshot.forEach((doc) => {
            categories.push(doc.data().name || doc.id);
        });
        const uniqueCategories = [...new Set(categories)];
        return ["All", ...uniqueCategories];
    } catch (error) {
        console.error("Error fetching categories: ", error);
        return ["All", "Marketing", "Social Media", "Website", "Branding", "SEO"];
    }
};

// ===============================================================
// USER PROFILE & PURCHASED PLANS (OPTIMIZED SINGLE-COLLECTION ARCHITECTURE)
// ===============================================================

// In-memory session cache for user purchases (TTL: 60s)
const userPurchasesCache = new Map(); // userId -> { timestamp, data }
const serviceMetadataCache = new Map(); // serviceId -> serviceData

/**
 * Invalidates the in-memory purchases cache when payments, mandates, or profile changes occur.
 */
export const clearUserPurchasesCache = (userId = null) => {
    if (userId) {
        userPurchasesCache.delete(String(userId));
    } else {
        userPurchasesCache.clear();
    }
};

/**
 * Persists an authoritative purchase record in Firestore 'purchases/{purchaseId}'.
 * Also updates userPurchasesCache for immediate availability without network latency.
 */
export const recordPurchase = async (purchaseData) => {
    if (!purchaseData || !purchaseData.purchaseId) {
        console.warn("recordPurchase called without purchaseId:", purchaseData);
        return null;
    }

    const purchaseId = String(purchaseData.purchaseId);
    const docRef = doc(db, "purchases", purchaseId);

    const payload = {
        ...purchaseData,
        id: purchaseId,
        purchaseId: purchaseId,
        updatedAt: serverTimestamp(),
    };

    if (!purchaseData.createdAt) {
        payload.createdAt = serverTimestamp();
    }

    try {
        await setDoc(docRef, payload, { merge: true });
    } catch (err) {
        console.error("Error writing purchase document to Firestore:", err);
    }

    // Invalidate user cache so next read gets latest from Firestore
    if (purchaseData.userId) {
        clearUserPurchasesCache(purchaseData.userId);
    }

    return payload;
};

/**
 * Deletes a draft/pending unfulfilled purchase document from purchases collection
 * when a user cancels payment or closes checkout.
 */
export const deletePendingPurchase = async (purchaseId) => {
    if (!purchaseId) return;
    try {
        await deleteDoc(doc(db, "purchases", String(purchaseId)));
    } catch (e) {
        console.warn("Could not delete pending purchase:", e);
    }
};

/**
 * Fetches all purchases made by a specific user from authoritative 'purchases' collection.
 * - Single collection query with in-memory 60s session cache (0 reads on repeat).
 * - Performs targeted metadata hydration ONLY for missing service details (0 catalog overfetch).
 * - Bypasses redundant full 'services' collection scans.
 */
export const fetchUserPurchases = async (userId, { forceRefresh = false } = {}) => {
    if (!userId) return [];

    const cacheKey = String(userId);

    // 1. Check in-memory session cache
    if (!forceRefresh && userPurchasesCache.has(cacheKey)) {
        const cached = userPurchasesCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60000) {
            return cached.data;
        }
    }

    let purchases = [];

    // 2. Direct Firestore query on authoritative 'purchases' collection
    try {
        const q = query(
            collection(db, "purchases"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const upfrontStatus = data.upfrontPayment?.status;
            const isPaidOrActive =
                data.status === "active" ||
                data.status === "completed" ||
                data.planAccessStatus === "active" ||
                data.planAccessStatus === "completed" ||
                upfrontStatus === "captured" ||
                upfrontStatus === "success" ||
                Boolean(data.primaryPaymentId) ||
                Boolean(data.paymentId) ||
                Boolean(data.upfrontPayment?.paymentId);

            if (isPaidOrActive && data.status !== "cancelled" && data.planAccessStatus !== "cancelled" && data.status !== "failed") {
                purchases.push({ id: docSnap.id, purchaseId: docSnap.id, ...data });
            }
        });
    } catch {
        // Fallback to server-side callable if client-side security rules restrict query
        try {
            const res = await verifyPaymentCallable({ action: "GET_USER_PURCHASES" });
            if (res?.data?.purchases && Array.isArray(res.data.purchases)) {
                purchases = res.data.purchases;
            }
        } catch {
            // Cloud function not updated yet; continue to fallbacks seamlessly
        }
    }

    // 2b. Resilient fallback: If no records in 'purchases', check 'subscriptions' collection (webhook records)
    if (purchases.length === 0) {
        try {
            const subQ = query(
                collection(db, "subscriptions"),
                where("userId", "==", userId)
            );
            const subSnapshot = await getDocs(subQ);
            subSnapshot.forEach((docSnap) => {
                const subData = docSnap.data();
                purchases.push({
                    id: docSnap.id,
                    purchaseId: docSnap.id,
                    ...subData,
                    serviceName: subData.serviceName || "NeedMet Digital",
                    planName: subData.planName || "Service Plan",
                    planType: subData.durationDays ? `${subData.durationDays} Days Plan` : "Monthly",
                    planAccessStatus: (subData.status || "active").toLowerCase(),
                    status: (subData.status || "active").toLowerCase(),
                    paymentMethod: subData.paymentMethod || "FULL",
                    amount: subData.amount || 0,
                    source: "subscriptions",
                });
            });
        } catch {
            // Ignore subscriptions fallback errors
        }
    }

    // 2c. Resilient fallback: Check 'users/{userId}.plans' (user document entitlements)
    if (purchases.length === 0) {
        try {
            const userPlans = await fetchUserPlans(userId);
            if (userPlans && userPlans.length > 0) {
                userPlans.forEach((planItem, idx) => {
                    const key = planItem.purchaseId || planItem.paymentId || `user-plan-${idx}`;
                    purchases.push({
                        id: key,
                        purchaseId: key,
                        planName: planItem.planName || "Service Plan",
                        serviceName: planItem.serviceName || "NeedMet Digital",
                        planType: planItem.planType || "Monthly",
                        amount: planItem.amount || 0,
                        paymentMethod: planItem.paymentType || "FULL",
                        planAccessStatus: planItem.status || "active",
                        status: planItem.status || "active",
                        startDate: planItem.startDate,
                        endDate: planItem.endDate,
                        createdAt: planItem.startDate || null,
                        source: "users.plans",
                    });
                });
            }
        } catch {
            // Ignore user doc fallback errors
        }
    }

    // Sort descending by createdAt
    purchases.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
    });

    // 2c. Unpack embedded display snapshots (0 Firestore reads)
    purchases.forEach((p) => {
        if (p.display) {
            if (!p.imageUrl && p.display.serviceImageUrl) p.imageUrl = p.display.serviceImageUrl;
            if (!p.description && p.display.serviceDescription) p.description = p.display.serviceDescription;
            if (!p.category && p.display.category) p.category = p.display.category;
            if (!p.serviceName && p.display.serviceTitle) p.serviceName = p.display.serviceTitle;
            if (!p.title && p.display.serviceTitle) p.title = p.display.serviceTitle;
            if (!p.planName && p.display.planName) p.planName = p.display.planName;
        }
    });

    // 3. Targeted Service Metadata Hydration ONLY for purchases missing display metadata (no catalog overfetch)
    const missingServiceIds = [
        ...new Set(
            purchases
                .filter((p) => (!p.imageUrl || !p.description) && (p.serviceId || p.service?.id))
                .map((p) => String(p.serviceId || p.service?.id))
        ),
    ];

    if (missingServiceIds.length > 0) {
        await Promise.all(
            missingServiceIds.map(async (sId) => {
                if (!serviceMetadataCache.has(sId)) {
                    try {
                        const sSnap = await getDoc(doc(db, "services", sId));
                        if (sSnap.exists()) {
                            serviceMetadataCache.set(sId, sSnap.data());
                        }
                    } catch {
                        // ignore network/doc errors for optional display metadata
                    }
                }
            })
        );

        purchases.forEach((p) => {
            const sId = String(p.serviceId || p.service?.id || "");
            const cachedService = serviceMetadataCache.get(sId);
            if (cachedService) {
                if (!p.description && cachedService.description) p.description = cachedService.description;
                if (!p.category && cachedService.category) p.category = cachedService.category;
                if (!p.imageUrl && cachedService.imageUrl) p.imageUrl = cachedService.imageUrl;
                if (!p.title && cachedService.title) p.title = cachedService.title;
            }
        });
    }

    // 4. Update session cache
    userPurchasesCache.set(cacheKey, { timestamp: Date.now(), data: purchases });

    return purchases;
};

/**
 * Fetches user entitlements from users/{userId} (plans array).
 * Preserved for backward compatibility with legacy historical records.
 */
export const fetchUserPlans = async (userId) => {
    if (!userId) return [];
    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return userDocSnap.data().plans || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching user plans from users doc:", error);
        return [];
    }
};

/**
 * Fetches a single purchase by ID:
 * 1. Checks in-memory session cache first (0 reads).
 * 2. Direct fetch from 'purchases/{purchaseId}' document (1 read).
 * 3. Falls back to user query only if not found.
 */
export const fetchPurchaseById = async (purchaseId, userId) => {
    if (!purchaseId) return null;

    const pIdStr = String(purchaseId);

    // 1. Fast Cache Lookup (0 Firestore reads)
    if (userId && userPurchasesCache.has(String(userId))) {
        const cachedList = userPurchasesCache.get(String(userId))?.data || [];
        const foundInCache = cachedList.find(
            (p) =>
                p.id === pIdStr ||
                p.purchaseId === pIdStr ||
                p.orderId === pIdStr ||
                p.razorpayOrderId === pIdStr
        );
        if (foundInCache) return foundInCache;
    }

    // 2. Direct fetch from 'purchases' collection (1 Firestore read)
    try {
        const docRef = doc(db, "purchases", pIdStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (!userId || data.userId === userId) {
                const purchaseRecord = { id: docSnap.id, purchaseId: docSnap.id, ...data };

                // Unpack embedded display snapshot first (0 Firestore reads)
                if (purchaseRecord.display) {
                    if (!purchaseRecord.imageUrl && purchaseRecord.display.serviceImageUrl) purchaseRecord.imageUrl = purchaseRecord.display.serviceImageUrl;
                    if (!purchaseRecord.description && purchaseRecord.display.serviceDescription) purchaseRecord.description = purchaseRecord.display.serviceDescription;
                    if (!purchaseRecord.category && purchaseRecord.display.category) purchaseRecord.category = purchaseRecord.display.category;
                    if (!purchaseRecord.serviceName && purchaseRecord.display.serviceTitle) purchaseRecord.serviceName = purchaseRecord.display.serviceTitle;
                }

                // Enrich missing service metadata if needed (targeted single-doc cache)
                const sId = String(purchaseRecord.serviceId || purchaseRecord.service?.id || "");
                if (sId && (!purchaseRecord.imageUrl || !purchaseRecord.description)) {
                    if (serviceMetadataCache.has(sId)) {
                        const sData = serviceMetadataCache.get(sId);
                        if (!purchaseRecord.description) purchaseRecord.description = sData.description;
                        if (!purchaseRecord.category) purchaseRecord.category = sData.category;
                        if (!purchaseRecord.imageUrl) purchaseRecord.imageUrl = sData.imageUrl;
                    } else {
                        try {
                            const sSnap = await getDoc(doc(db, "services", sId));
                            if (sSnap.exists()) {
                                serviceMetadataCache.set(sId, sSnap.data());
                                const sData = sSnap.data();
                                if (!purchaseRecord.description) purchaseRecord.description = sData.description;
                                if (!purchaseRecord.category) purchaseRecord.category = sData.category;
                                if (!purchaseRecord.imageUrl) purchaseRecord.imageUrl = sData.imageUrl;
                            }
                        } catch {
                            // ignore
                        }
                    }
                }

                return purchaseRecord;
            }
        }
    } catch {
        // Direct fetch failed (e.g. Firestore rules restricted), continue to fallback cleanly
    }

    // 3. Fallback: Search user's purchases
    if (userId) {
        try {
            const allPurchases = await fetchUserPurchases(userId);
            const found = allPurchases.find(
                (p) =>
                    p.id === pIdStr ||
                    p.purchaseId === pIdStr ||
                    p.orderId === pIdStr ||
                    p.razorpayOrderId === pIdStr
            );
            if (found) return found;

            // 4. Legacy Fallback: Search user's plans in users doc
            const userPlans = await fetchUserPlans(userId);
            const planFound = userPlans.find(
                (p) =>
                    p.purchaseId === pIdStr ||
                    p.paymentId === pIdStr ||
                    p.id === pIdStr
            );
            if (planFound) {
                return {
                    id: planFound.purchaseId || planFound.paymentId || pIdStr,
                    purchaseId: planFound.purchaseId || planFound.paymentId || pIdStr,
                    planName: planFound.planName || "Service Plan",
                    serviceName: planFound.serviceName || "NeedMet Digital",
                    planType: planFound.planType || "Monthly",
                    amount: planFound.amount || 0,
                    paymentMethod: planFound.paymentType || "FULL",
                    planAccessStatus: planFound.status || "active",
                    status: planFound.status || "active",
                    startDate: planFound.startDate,
                    endDate: planFound.endDate,
                    createdAt: planFound.startDate,
                };
            }
        } catch (err) {
            console.error("Error searching user purchases by ID:", err);
        }
    }

    return null;
};


// ===============================================================
// ADMIN PLAN MANAGEMENT
// ===============================================================

/**
 * Fetches ALL plans for administration from 'services' collection ONLY.
 */
export const fetchAdminPlans = async () => {
    try {
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicePlans = [];

        servicesSnapshot.forEach((sDoc) => {
            const serviceData = sDoc.data();
            const serviceId = sDoc.id;

            const rawPlans = serviceData.plans || serviceData.variants || [];
            const variants = rawPlans.map((p, idx) => sanitizePlanVariant(p, `Option ${idx + 1}`));
            const primaryVariant = variants[0] || {};

            servicePlans.push({
                id: serviceId,
                planId: serviceId,
                name: serviceData.title || serviceData.name || "Service Plan",
                title: serviceData.title || serviceData.name || "Service Plan",
                description: serviceData.description || "",
                serviceId: serviceId,
                serviceName: serviceData.title || serviceData.name || "NeedMet Digital",
                category: serviceData.category || "Digital Marketing",
                status: serviceData.status || "published",
                source: "services",
                imageUrl: serviceData.imageUrl
                    ? (Array.isArray(serviceData.imageUrl) ? serviceData.imageUrl : [serviceData.imageUrl])
                    : (serviceData.image ? [serviceData.image] : []),
                isActive: serviceData.isActive !== undefined ? Boolean(serviceData.isActive) : true,
                price: Number(primaryVariant.price) || Number(serviceData.price) || 0,
                finalPrice: Number(primaryVariant.finalPrice) || Number(primaryVariant.price) || Number(serviceData.finalPrice) || 0,
                duration: primaryVariant.duration || serviceData.duration || "3 Months",
                durationDays: primaryVariant.durationDays || serviceData.durationDays || 92,
                tag: primaryVariant.tag || serviceData.badge || serviceData.tag || "",
                badge: serviceData.badge || primaryVariant.tag || "",
                variants: variants,
                plans: variants,
                datesConfig: serviceData.datesConfig || null,
                notes: serviceData.notes || "",
                createdBy: serviceData.createdBy || "Admin",
                creatorEmail: serviceData.creatorEmail || "",
                createdAt: serviceData.createdAt || null,
                updatedAt: serviceData.updatedAt || null,
                updatedBy: serviceData.updatedBy || "",
            });
        });

        // Sort descending by updatedAt or createdAt
        servicePlans.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
            const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
            return timeB - timeA;
        });

        return servicePlans;
    } catch (error) {
        console.error("Error fetching admin plans from services collection:", error);
        throw error;
    }
};

/**
 * Creates or updates a Service (with its child plans: []) in Firestore.
 * Saves to 'services' collection ONLY.
 */
export const saveCustomPlan = async (planData, planId = null, currentUser = null) => {
    try {
        const now = serverTimestamp();
        const rawVariants = planData.plans || planData.variants || [];
        const variants = rawVariants.map((v, idx) => sanitizePlanVariant(v, `Option ${idx + 1}`));
        const primaryVariant = variants[0] || {};

        const serviceTitle = (planData.title || planData.name || primaryVariant.name || "Service").trim();
        const category = planData.category || "Digital Marketing";
        const badge = planData.badge || planData.tag || primaryVariant.tag || "POPULAR";

        let targetId = planId || planData.id || planData.serviceId || planData.planId;
        if (!targetId || targetId === "null" || targetId === "undefined") {
            const slug = serviceTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            targetId = slug ? `${slug}-${Date.now().toString().slice(-4)}` : `service-${Date.now().toString().slice(-6)}`;
        }
        targetId = String(targetId);

        const imagesList = Array.isArray(planData.imageUrl)
            ? planData.imageUrl
            : (typeof planData.imageUrl === "string" && planData.imageUrl.trim() ? [planData.imageUrl.trim()] : []);

        const payload = {
            id: targetId,
            serviceId: targetId,
            planId: targetId,
            title: serviceTitle,
            name: serviceTitle,
            description: planData.description || "",
            category: category,
            categoryId: category.toLowerCase().replace(/ /g, "-"),
            badge: badge,
            tag: badge,
            imageUrl: imagesList,
            image: imagesList[0] || "",
            isActive: planData.isActive !== undefined ? Boolean(planData.isActive) : (planData.status === "published"),
            status: planData.status || "published", // draft, published, archived
            notes: planData.notes || "",

            // SERVICE ARCHITECTURE: Root service has plans: []
            plans: variants,
            variants: variants, // Backward compatibility

            // Pricing summary for Home catalog card & sorting
            pricing: {
                price: Number(primaryVariant.finalPrice) || Number(primaryVariant.price) || 0,
                regularPrice: Number(primaryVariant.price) || 0,
                discount: Number(primaryVariant.discountAmount) || 0,
                emiAvailable: primaryVariant.paymentOptions === "EMI" || primaryVariant.paymentOptions === "BOTH",
            },

            // Primary variant flat summary fields for backward compatibility
            price: Number(planData.price) || Number(primaryVariant.price) || 0,
            discountAmount: Number(planData.discountAmount) || Number(primaryVariant.discountAmount) || 0,
            finalPrice: Number(planData.finalPrice) || Number(primaryVariant.finalPrice) || Number(planData.price) || 0,
            currency: planData.currency || "INR",
            duration: primaryVariant.duration || "3 Months",
            durationDays: primaryVariant.durationDays || 92,
            planType: primaryVariant.planType || "3 Months",
            paymentOptions: planData.paymentOptions || primaryVariant.paymentOptions || "BOTH",
            emiConfig: planData.emiConfig || primaryVariant.emiConfig || {
                enabled: true,
                upfrontType: "percentage",
                upfrontValue: 15,
                upfrontAmount: 0,
                remainingAmount: 0,
                totalCycles: 1,
                emiAmount: 0,
                billingInterval: "monthly",
                firstDebitDays: 30,
            },
            features: planData.features || primaryVariant.features || [],

            // Dates Configuration
            datesConfig: {
                availabilityStart: planData.datesConfig?.availabilityStart || null,
                availabilityEnd: planData.datesConfig?.availabilityEnd || null,
                serviceStart: planData.datesConfig?.serviceStart || null,
                serviceDurationDays: Number(planData.datesConfig?.serviceDurationDays) || Number(primaryVariant.durationDays) || 30,
            },
            updatedAt: now,
            updatedBy: currentUser?.uid || "admin",
            editorEmail: currentUser?.email || "",
        };

        if (!planId) {
            payload.createdAt = now;
            payload.createdBy = currentUser?.uid || "admin";
            payload.creatorEmail = currentUser?.email || "";
        }

        // PRIMARY WRITE: Save directly and ONLY into 'services' collection!
        const serviceRef = doc(db, "services", targetId);
        await setDoc(serviceRef, payload, { merge: true });

        return { id: targetId, ...payload };
    } catch (error) {
        console.error("Error saving service:", error);
        throw error;
    }
};

/**
 * Soft archives a plan/service in 'services' collection.
 */
export const archivePlan = async (planId, currentUser = null) => {
    try {
        const idStr = String(planId);
        const updateData = {
            status: "archived",
            isActive: false,
            archivedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            updatedBy: currentUser?.uid || "admin",
        };
        await setDoc(doc(db, "services", idStr), updateData, { merge: true });
        return true;
    } catch (error) {
        console.error("Error archiving service:", error);
        throw error;
    }
};

/**
 * Publishes a draft or archived service in 'services' collection.
 */
export const publishPlan = async (planId, currentUser = null) => {
    try {
        const idStr = String(planId);
        const updateData = {
            status: "published",
            isActive: true,
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            updatedBy: currentUser?.uid || "admin",
        };
        await setDoc(doc(db, "services", idStr), updateData, { merge: true });
        return true;
    } catch (error) {
        console.error("Error publishing service:", error);
        throw error;
    }
};

/**
 * Permanently deletes a service document from 'services' collection.
 */
export const deletePlan = async (planId) => {
    try {
        const idStr = String(planId);
        await deleteDoc(doc(db, "services", idStr));
        return true;
    } catch (error) {
        console.error("Error deleting service from services collection:", error);
        throw error;
    }
};

// --- ONE-TIME UTILITY FUNCTION ---
export const seedDatabase = async (servicesData, reviewsData) => {
    try {
        for (const service of servicesData) {
            await setDoc(doc(db, "services", String(service.id)), service);
        }
        for (const review of reviewsData) {
            await setDoc(doc(db, "reviews", String(review.id)), review);
        }
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database: ", error);
    }
};

