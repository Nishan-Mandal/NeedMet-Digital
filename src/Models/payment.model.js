const pyament={
  // 1. Transaction Context
  userId: "user_abc123",
  userName: "Rahul Sharma",            // ✨ Added: Customer name on transaction ledger
  orderId: "order_xyz123",            // Foreign key -> purchases/{orderId}
  subscriptionId: "sub_mandate123",   // Present for recurring EMI debits

  // 2. Gateway Event Data
  gateway: "RAZORPAY",
  paymentType: "FULL" | "EMI_UPFRONT" | "EMI_RECURRING",
  status: "SUCCESS" | "FAILED" | "REFUNDED",
  currency: "INR",
  amount: 4000,                       // Amount in Rupees

  // 3. Payment Method Details
  method: "upi",                      // "upi" | "card" | "netbanking"
  bank: "HDFC",
  cardLast4: null,

  // 4. Failure Context (If status === "FAILED")
  error: {
    code: "BAD_REQUEST_ERROR",
    description: "Payment failed due to insufficient funds"
  },

  // 5. Refund Context (If refunded)
  refund: {
    refundId: "rfnd_abc123",
    amount: 4000,
    refundedAt: Timestamp
  },

  createdAt: Timestamp
}