/**
 * Cash Code Data Model
 * Collection: "cash_codes"
 * Document ID: auto-generated Firestore string ID
 *
 * IMPORTANT: This model follows the strict minimal 15-field schema.
 * Do NOT add redundant or derived fields (e.g. value, status, computedStatus, isAvailable, isExpired).
 * All display status and availability calculations must be derived at runtime via cashCode.utils.js.
 */

/**
 * Example Document Representation
 */
export const cashCodeExample = {
  id: "abc123xyz",              // String: Document ID in Firestore
  code: "NM-9X2L-4K7P",          // String: Unique platform redemption code (uppercase)

  amount: 500,                   // Number: Wallet credit value in INR (₹)

  createdBy: "Admin User",       // String: Display name or identifier of admin creator
  createdById: "admin_uid_123",  // String: Firebase Auth UID of the creator

  active: true,                  // Boolean: Administrative active/inactive state
  isUsed: false,                 // Boolean: Single-redemption flag (true once redeemed)
  usedBy: null,                  // String | null: Customer UID who redeemed the code
  isRevoked: false,              // Boolean: Revocation state
  revokeReason: null,            // String | null: Mandatory reason if revoked

  createdAt: null,               // Timestamp: Firestore server timestamp of code generation
  expiresAt: null,               // Timestamp: Firestore timestamp of expiration date
  usedAt: null,                  // Timestamp | null: Firestore timestamp of redemption date

  paymentId: null,               // String | null: Payment gateway reference ID
  purchaseId: null,              // String | null: Associated purchase/order ID
};

/**
 * Blank / Initial Cash Code Object
 */
export const initialCashCodeModel = {
  id: "",
  code: "",
  amount: 0,
  createdBy: "",
  createdById: "",
  active: true,
  isUsed: false,
  usedBy: null,
  isRevoked: false,
  revokeReason: null,
  createdAt: null,
  expiresAt: null,
  usedAt: null,
  paymentId: null,
  purchaseId: null,
};

/**
 * Factory function to produce a valid Cash Code payload for Firestore insertion
 */
export const createCashCodeModel = ({
  id = "",
  code = "",
  amount = 500,
  createdBy = "Admin User",
  createdById = "admin",
  createdAt = null,
  expiresAt = null,
} = {}) => ({
  id,
  code: (code || "").toUpperCase().trim(),
  amount: Number(amount) || 0,
  createdBy: createdBy || "Admin User",
  createdById: createdById || "admin",
  active: true,
  isUsed: false,
  usedBy: null,
  isRevoked: false,
  revokeReason: null,
  createdAt: createdAt || null,
  expiresAt: expiresAt || null,
  usedAt: null,
  paymentId: null,
  purchaseId: null,
});

export default initialCashCodeModel;

