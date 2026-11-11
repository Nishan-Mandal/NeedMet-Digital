const purchases={
  // 1. Customer & Ownership
  userId: "user_abc123",
  userName: "Rahul Sharma",        // ✨ Added: Customer display name for admin tables & receipts
  paymentMethod: "FULL" | "EMI",

  // 2. Authoritative Life-cycle Status (Strict FSM)
  // PENDING_PAYMENT | PENDING_MANDATE | ACTIVE | COMPLETED | CANCELLED | REFUNDED
  status: "ACTIVE",

  // 3. Service & Plan Snapshot (Captured at checkout)
  itemSnapshot: {
    serviceId: "srv_digital_marketing",
    serviceTitle: "NeedMet Digital",
    planId: "plan_pro_6m",
    planTitle: "6-Month Pro Growth",
    category: "Marketing",
    imageUrl: "https://.../cover.png",
    durationDays: 180,
    features: ["SEO Audit", "Weekly Reports", "Dedicated Manager"]
  },

  // 4. Financial Breakdown (All values in INR Rupees)
  pricing: {
    originalPrice: 30000,
    discountAmount: 5000,
    finalPrice: 25000,
    upfrontAmount: 5000,
    remainingAmount: 20000,
    couponCode: "WELCOME5K"
  },

  // 5. Access Window
  accessWindow: {
    activatedAt: Timestamp,
    expiresAt: Timestamp
  },

  // 6. Upfront Settlement Link
  upfrontPayment: {
    paymentId: "pay_xyz789",
    paidAt: Timestamp,
    amount: 5000
  },

  // 7. Mandate & EMI Ledger (null for FULL payment)
  mandate: {
    subscriptionId: "sub_mandate123",
    status: "AUTHORIZED",          // "PENDING" | "AUTHORIZED" | "COMPLETED" | "FAILED"
    totalCycles: 5,
    paidCycles: 1,
    emiAmount: 4000,
    nextDebitDate: Timestamp,
    lastChargedAt: Timestamp,
    installments: [
      {
        cycleIndex: 1,
        dueDate: "2026-12-10T00:00:00Z",
        amount: 4000,
        status: "PAID",
        paymentId: "pay_mandate_001",
        paidAt: Timestamp
      },
      {
        cycleIndex: 2,
        dueDate: "2027-01-10T00:00:00Z",
        amount: 4000,
        status: "PENDING",
        paymentId: null,
        paidAt: null
      }
    ]
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}