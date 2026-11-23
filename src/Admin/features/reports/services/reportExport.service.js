/**
 * Report Export Service
 * Formats data sets and triggers client-side file downloads in CSV and structured formats.
 */

/**
 * Escapes values for safe CSV inclusion (handles quotes, commas, newlines).
 */
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser file download of text/csv content.
 */
function downloadFile(content, filename, mimeType = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType }); // \uFEFF is UTF-8 BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Comprehensive Sales & Orders Report
 */
export function exportSalesReportCsv(purchases = [], filename = "needmet-sales-report.csv") {
  const headers = [
    "Purchase ID",
    "Customer Name",
    "User ID",
    "Customer Phone",
    "Sold By",
    "Service Title",
    "Plan Title",
    "Category",
    "Payment Method",
    "Status",
    "Catalog Price (INR)",
    "Discount Amount (INR)",
    "Final Price (INR)",
    "Upfront Paid (INR)",
    "Remaining Balance (INR)",
    "Coupon Code",
    "Purchase Date",
  ];

  const rows = purchases.map((p) => [
    escapeCsv(p.id),
    escapeCsv(p.user?.userName || p.userName || "Customer"),
    escapeCsv(p.user?.userId || p.userId || ""),
    escapeCsv(p.user?.phone || p.phone || p.userPhone || ""),
    escapeCsv(p.SaleBy || p.saleBy || p.itemSnapshot?.SaleBy || "Direct"),
    escapeCsv(p.itemSnapshot?.serviceTitle || ""),
    escapeCsv(p.itemSnapshot?.planTitle || ""),
    escapeCsv(p.itemSnapshot?.category || ""),
    escapeCsv(p.paymentMethod || "FULL"),
    escapeCsv(p.status || ""),
    escapeCsv(p.pricing?.originalPrice || 0),
    escapeCsv(p.pricing?.discountAmount || 0),
    escapeCsv(p.pricing?.finalPrice || 0),
    escapeCsv(p.pricing?.upfrontAmount || 0),
    escapeCsv(p.pricing?.remainingAmount || 0),
    escapeCsv(p.pricing?.couponCode || "None"),
    escapeCsv(p.createdAt || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 2. Gateway Payment Ledger Report
 */
export function exportPaymentLedgerCsv(payments = [], filename = "needmet-payments-report.csv") {
  const headers = [
    "Payment ID",
    "Linked Order ID",
    "Customer Name",
    "User ID",
    "Subscription ID",
    "Gateway",
    "Payment Type",
    "Amount (INR)",
    "Currency",
    "Method",
    "Bank",
    "Status",
    "Refund Amount (INR)",
    "Created Date",
  ];

  const rows = payments.map((p) => [
    escapeCsv(p.id),
    escapeCsv(p.orderId || ""),
    escapeCsv(p.user?.userName || p.userName || "Customer"),
    escapeCsv(p.user?.userId || p.userId || ""),
    escapeCsv(p.subscriptionId || "None"),
    escapeCsv(p.gateway || "RAZORPAY"),
    escapeCsv(p.paymentType || "FULL"),
    escapeCsv(p.amount || 0),
    escapeCsv(p.currency || "INR"),
    escapeCsv(p.method || ""),
    escapeCsv(p.bank || ""),
    escapeCsv(p.status || ""),
    escapeCsv(p.refund?.amount || 0),
    escapeCsv(p.createdAt || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 3. EMI & Installments Delinquency Report
 */
export function exportEmiScheduleCsv(emiLedger = {}, filename = "needmet-emi-report.csv") {
  const headers = [
    "Purchase ID",
    "Customer Name",
    "Plan Title",
    "Subscription ID",
    "Cycle Index",
    "Due Date",
    "Amount (INR)",
    "Status",
    "Payment ID",
    "Paid Date",
    "Category",
  ];

  const overdueRows = (emiLedger.overdue || []).map((item) => [
    escapeCsv(item.purchaseId),
    escapeCsv(item.userName),
    escapeCsv(item.planTitle),
    escapeCsv(item.subscriptionId),
    escapeCsv(item.cycleIndex),
    escapeCsv(item.dueDate || ""),
    escapeCsv(item.amount),
    escapeCsv(item.status),
    escapeCsv(item.paymentId || "None"),
    escapeCsv(item.paidAt || ""),
    escapeCsv("OVERDUE"),
  ]);

  const upcomingRows = (emiLedger.upcoming || []).map((item) => [
    escapeCsv(item.purchaseId),
    escapeCsv(item.userName),
    escapeCsv(item.planTitle),
    escapeCsv(item.subscriptionId),
    escapeCsv(item.cycleIndex),
    escapeCsv(item.dueDate || ""),
    escapeCsv(item.amount),
    escapeCsv(item.status),
    escapeCsv(item.paymentId || "None"),
    escapeCsv(item.paidAt || ""),
    escapeCsv("UPCOMING"),
  ]);

  const csvContent = [headers.join(","), ...overdueRows.map((r) => r.join(",")), ...upcomingRows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 4. Plan Performance Report
 */
export function exportPlanPerformanceCsv(plans = [], filename = "needmet-plan-performance.csv") {
  const headers = [
    "Plan ID",
    "Plan Title",
    "Service Title",
    "Category",
    "Units Sold",
    "Full Payment Units",
    "EMI Units",
    "Active Subscriptions",
    "Gross Revenue (INR)",
    "Average Revenue Per Unit (INR)",
  ];

  const rows = plans.map((p) => [
    escapeCsv(p.planId),
    escapeCsv(p.planTitle),
    escapeCsv(p.serviceTitle),
    escapeCsv(p.category),
    escapeCsv(p.unitsSold),
    escapeCsv(p.fullPaymentCount),
    escapeCsv(p.emiCount),
    escapeCsv(p.activeCount),
    escapeCsv(p.grossRevenue),
    escapeCsv(p.unitsSold > 0 ? Math.round(p.grossRevenue / p.unitsSold) : 0),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 5. Customer Sales Report
 */
export function exportCustomerSalesCsv(customers = [], filename = "needmet-customers-report.csv") {
  const headers = [
    "User ID",
    "Customer Name",
    "Customer Type",
    "Total Orders",
    "Confirmed Purchases",
    "Total Spent LTV (INR)",
    "Outstanding EMI (INR)",
    "Last Purchase Date",
  ];

  const rows = customers.map((c) => [
    escapeCsv(c.userId),
    escapeCsv(c.userName),
    escapeCsv(c.isRepeatCustomer ? "Repeat Buyer" : "New Buyer"),
    escapeCsv(c.totalOrders),
    escapeCsv(c.confirmedPurchases),
    escapeCsv(c.totalSpent),
    escapeCsv(c.outstandingAmount),
    escapeCsv(c.lastPurchaseDate || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 6. Refund Audit Report
 */
export function exportRefundReportCsv(payments = [], filename = "needmet-refunds-report.csv") {
  const headers = [
    "Refund ID",
    "Payment ID",
    "Linked Order ID",
    "Customer Name",
    "User ID",
    "Refund Amount (INR)",
    "Refund Date",
  ];

  const refunded = payments.filter((p) => p.status === "REFUNDED" || Boolean(p.refund?.amount));

  const rows = refunded.map((p) => [
    escapeCsv(p.refund?.refundId || "N/A"),
    escapeCsv(p.id),
    escapeCsv(p.orderId || ""),
    escapeCsv(p.user?.userName || p.userName || "Customer"),
    escapeCsv(p.user?.userId || p.userId || ""),
    escapeCsv(p.refund?.amount || p.amount || 0),
    escapeCsv(p.refund?.refundedAt || p.createdAt || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

/**
 * 7. Daily / Interval Sales Summary
 */
export function exportTimelineSummaryCsv(buckets = [], filename = "needmet-daily-sales-summary.csv") {
  const headers = [
    "Interval",
    "Start Time",
    "End Time",
    "Gross Booked Sales (INR)",
    "Cash Collected (INR)",
    "Refunds (INR)",
    "Net Revenue (INR)",
    "Orders Count",
  ];

  const rows = buckets.map((b) => [
    escapeCsv(b.label),
    escapeCsv(b.start.toISOString()),
    escapeCsv(b.end.toISOString()),
    escapeCsv(b.grossSales),
    escapeCsv(b.cashCollected),
    escapeCsv(b.refundedAmount),
    escapeCsv(b.netRevenue),
    escapeCsv(b.ordersCount),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, filename);
}

export default {
  exportSalesReportCsv,
  exportPaymentLedgerCsv,
  exportEmiScheduleCsv,
  exportPlanPerformanceCsv,
  exportCustomerSalesCsv,
  exportRefundReportCsv,
  exportTimelineSummaryCsv,
};

