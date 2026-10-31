import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

/**
 * Fetches a service by ID and its corresponding pricing plans from 'services' collection ONLY.
 * 
 * @param {string} serviceId - The ID of the service document to fetch
 * @returns {Promise<{ service: any, plans: any[] }>} Object containing the service and sorted array of merged plans
 */
export const fetchServiceWithPlans = async (serviceId) => {
    try {
        // Fetch the service document by its ID from 'services' collection only
        const serviceRef = doc(db, "services", String(serviceId));
        const serviceSnap = await getDoc(serviceRef);

        if (!serviceSnap.exists()) {
            throw new Error(`Service with ID ${serviceId} not found.`);
        }

        const serviceData = { id: serviceSnap.id, ...serviceSnap.data() };
        
        // Extract duration variants / plans
        let plans = serviceData.plans || serviceData.variants || [];

        // Add 'id' field to each plan (mapped from planId or id) for backward compatibility
        // and sort by durationDays ascending
        plans = plans.map(p => ({ ...p, id: p.planId || p.id })).sort((a, b) => (a.durationDays || 0) - (b.durationDays || 0));

        return {
            service: serviceData,
            plans: plans
        };

    } catch (error) {
        console.error("Error in fetchServiceWithPlans:", error);
        throw error;
    }
};

/**
 * Fetches the WhatsApp support number from the "home" collection.
 * 
 * @returns {Promise<string|null>} The support number string or null if not found
 */
export const fetchSupportNumber = async () => {
    try {
        // Try getting a specific document named "whatsappSupport" first
        const docRef = doc(db, "home", "whatsappSupport");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const num = data.number || data.whatsappSupport || data.phone;
            if (num) {
                return String(num);
            }
        }

        // Fallback: Query all documents in the "home" collection and look for a whatsappSupport field
        const querySnapshot = await getDocs(collection(db, "home"));
        let fallbackNum = null;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const num = data.whatsappSupport || data.number || data.phone;
            if (num) {
                fallbackNum = String(num);
            }
        });
        return fallbackNum;
    } catch (error) {
        console.error("Error in fetchSupportNumber:", error);
        return null;
    }
};
