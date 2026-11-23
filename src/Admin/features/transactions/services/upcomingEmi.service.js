/**
 * NeedMate Digital - Admin Upcoming EMI Payments Service
 *
 * Derives, synthesizes, and normalizes upcoming/pending EMI installments
 * across all customer purchases and payment records.
 *
 * Fully supports:
 * - Purchases with stored mandate.installments
 * - Purchases with empty mandate.installments (synthesizing remaining cycles)
 * - Purchases with pricing.remainingAmount > 0
 * - Cross-referencing payment records to verify cleared cycles
 */

export const TIME_PERIODS = [
  { id: "ALL", label: "All Periods" },
  { id: "OVERDUE", label: "Overdue" },
  { id: "TODAY", label: "Today" },
  { id: "THIS_WEEK", label: "Next 7 Days" },
  { id: "THIS_MONTH", label: "Next 30 Days" },
  { id: "NEXT_MONTH", label: "Next Month" },
  { id: "LATER", label: "Later (60d+)" },
];

export const TIME_PERIOD_ORDER = [
  { id: "OVERDUE", label: "Overdue Installments", color: "rose", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "TODAY", label: "Due Today", color: "amber", badgeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  { id: "THIS_WEEK", label: "Due This Week (Next 7 Days)", color: "blue", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "THIS_MONTH", label: "Due This Month (Next 30 Days)", color: "emerald", badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { id: "NEXT_MONTH", label: "Due Next Month", color: "purple", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "LATER", label: "Later (60+ Days)", color: "slate", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
];

/**
 * Checks if a purchase document represents an EMI purchase or has an outstanding mandate.
 */
export function isEmiPurchase(purchase) {
  if (!purchase) return false;

  const rawMethod = String(
    purchase.paymentMethod || purchase.paymentType || purchase.method || ""
  ).toUpperCase();
  if (rawMethod.includes("EMI")) return true;

  if (purchase.isEmi === true) return true;
  if (purchase.pricing?.isEmi === true) return true;

  // Remaining balance check
  const remaining = Number(
    purchase.pricing?.remainingAmount ??
    purchase.remainingAmount ??
    0
  );
  if (remaining > 0) return true;

  // Mandate presence check
  if (purchase.mandate && typeof purchase.mandate === "object") {
    const total = Number(purchase.mandate.totalCycles || purchase.mandate.totalCount || 0);
    const emiAmt = Number(purchase.mandate.emiAmount || 0);
    if (total > 0 || emiAmt > 0 || Boolean(purchase.mandate.subscriptionId)) return true;
  }

  // Explicit installment array check
  if (Array.isArray(purchase.mandate?.installments) && purchase.mandate.installments.length > 0) return true;
  if (Array.isArray(purchase.pricing?.installments) && purchase.pricing.installments.length > 0) return true;
  if (Array.isArray(purchase.installments) && purchase.installments.length > 0) return true;

  // Mandate pending status check
  const rawStatus = String(purchase.status || purchase.planAccessStatus || "").toUpperCase();
  if (rawStatus.includes("MANDATE")) return true;

  return false;
}

/**
 * Extracts and normalizes all upcoming/pending EMI installments across purchases
 * and cross-references them with payments records.
 *
 * @param {Array} purchases - List of normalized purchase documents
 * @param {Array} payments - Optional list of normalized payment documents
 * @returns {Array} List of upcoming installment records sorted by due date
 */
export function extractUpcomingEmiInstallments(purchases = [], payments = []) {
  const installments = [];
  const now = new Date();
  const nowMs = now.getTime();

  const cleanPhone = (val) => {
    if (!val) return "";
    const s = String(val).trim();
    if (s === "null" || s === "undefined" || s === "NaN" || s === "—" || s === "-") return "";
    return s;
  };

  // Map payments by orderId / purchaseId to count completed recurring debits and extract phones
  const paymentCountsByOrderId = {};
  const phoneByOrderId = {};
  const phoneByUserId = {};

  (payments || []).forEach((p) => {
    const ordId = p.orderId || p.purchaseId;
    if (ordId && p.status === "SUCCESS") {
      const type = String(p.paymentType || "").toUpperCase();
      if (type.includes("RECURRING") || type.includes("EMI")) {
        paymentCountsByOrderId[ordId] = (paymentCountsByOrderId[ordId] || 0) + 1;
      }
    }

    const ph = cleanPhone(
      p.user?.phone ||
      p.phone ||
      p.userPhone ||
      p.customerPhone ||
      p.contact ||
      p.mobile ||
      p.phoneNumber
    );
    if (ph) {
      if (p.orderId && !phoneByOrderId[p.orderId]) phoneByOrderId[p.orderId] = ph;
      if (p.purchaseId && !phoneByOrderId[p.purchaseId]) phoneByOrderId[p.purchaseId] = ph;
      if (p.id && !phoneByOrderId[p.id]) phoneByOrderId[p.id] = ph;
      if (p.userId && !phoneByUserId[p.userId]) phoneByUserId[p.userId] = ph;
      if (p.user?.userId && !phoneByUserId[p.user.userId]) phoneByUserId[p.user.userId] = ph;
    }
  });

  (purchases || []).forEach((p) => {
    const ph = cleanPhone(
      p.user?.phone ||
      p.userPhone ||
      p.customerPhone ||
      p.phone ||
      p.phoneNumber ||
      p.contact ||
      p.mobile ||
      p.upfrontPayment?.contact ||
      p.upfrontPayment?.phone
    );
    if (ph) {
      if (p.id && !phoneByOrderId[p.id]) phoneByOrderId[p.id] = ph;
      if (p.orderId && !phoneByOrderId[p.orderId]) phoneByOrderId[p.orderId] = ph;
      if (p.purchaseId && !phoneByOrderId[p.purchaseId]) phoneByOrderId[p.purchaseId] = ph;
      if (p.userId && !phoneByUserId[p.userId]) phoneByUserId[p.userId] = ph;
      if (p.user?.userId && !phoneByUserId[p.user.userId]) phoneByUserId[p.user.userId] = ph;
    }
  });

  (purchases || []).forEach((purchase) => {
    if (!isEmiPurchase(purchase)) return;

    // Disregard cancelled or refunded purchases from upcoming debits
    const rawStatus = String(purchase.status || "").toUpperCase();
    if (["CANCELLED", "REFUNDED"].includes(rawStatus)) {
      return;
    }

    const mandate = purchase.mandate || {};

    // 1. Check for pre-existing explicit installments in document
    const rawInstallments = (
      Array.isArray(mandate.installments) && mandate.installments.length > 0
        ? mandate.installments
        : Array.isArray(purchase.pricing?.installments) && purchase.pricing.installments.length > 0
        ? purchase.pricing.installments
        : Array.isArray(purchase.installments) && purchase.installments.length > 0
        ? purchase.installments
        : []
    );

    // 2. Determine cycle quantities
    const docTotalCycles = Number(
      mandate.totalCycles ||
      purchase.totalCycles ||
      purchase.pricing?.totalCycles ||
      mandate.totalCount ||
      rawInstallments.length ||
      0
    );
    const totalCycles = docTotalCycles > 0 ? docTotalCycles : 3;

    // Count verified paid cycles
    const docPaidCycles = Number(
      mandate.paidCycles ??
      purchase.paidCycles ??
      mandate.paidCount ??
      0
    );
    const paymentsPaidCount = paymentCountsByOrderId[purchase.id] || 0;
    const paidCycles = Math.max(docPaidCycles, paymentsPaidCount);

    // Determine monthly EMI amount
    const remainingAmount = Number(
      purchase.pricing?.remainingAmount ??
      purchase.remainingAmount ??
      0
    );
    const remainingCycles = Math.max(1, totalCycles - paidCycles);
    const defaultEmiAmount = Number(
      mandate.emiAmount ??
      purchase.pricing?.emiAmount ??
      purchase.emiAmount ??
      (remainingAmount > 0 ? Math.round(remainingAmount / remainingCycles) : 0)
    );

    const resolvedCustomerPhone = (
      cleanPhone(purchase.user?.phone) ||
      cleanPhone(purchase.userPhone) ||
      cleanPhone(purchase.customerPhone) ||
      cleanPhone(purchase.phone) ||
      cleanPhone(purchase.phoneNumber) ||
      cleanPhone(purchase.contact) ||
      cleanPhone(purchase.mobile) ||
      cleanPhone(purchase.customerMobile) ||
      cleanPhone(purchase.upfrontPayment?.contact) ||
      cleanPhone(purchase.upfrontPayment?.phone) ||
      cleanPhone(purchase.mandate?.phone) ||
      cleanPhone(purchase.mandate?.customerPhone) ||
      cleanPhone(phoneByOrderId[purchase.id]) ||
      cleanPhone(phoneByOrderId[purchase.orderId]) ||
      cleanPhone(phoneByOrderId[purchase.purchaseId]) ||
      cleanPhone(phoneByUserId[purchase.userId]) ||
      cleanPhone(phoneByUserId[purchase.user?.userId]) ||
      ""
    );

    const baseDateStr = (
      mandate.nextDebitDate ||
      purchase.accessWindow?.activatedAt ||
      purchase.createdAt ||
      purchase.startDate ||
      purchase.timestamp
    );
    const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();

    // Helper to build installment object
    const buildInstallment = ({ cycleIndex, amount, dueDateStr, status = "PENDING" }) => {
      let dueMs = 0;
      let diffDays = null;
      let urgency = "SCHEDULED";
      let timePeriod = "LATER";
      let timePeriodLabel = "Later";

      if (dueDateStr) {
        const d = new Date(dueDateStr);
        if (!isNaN(d.getTime())) {
          dueMs = d.getTime();
          diffDays = Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24));
        }
      }

      if (status === "FAILED") {
        urgency = "FAILED";
        timePeriod = "OVERDUE";
        timePeriodLabel = "Debit Failed";
      } else if (diffDays !== null) {
        if (diffDays < 0) {
          urgency = "OVERDUE";
          timePeriod = "OVERDUE";
          timePeriodLabel = "Overdue";
        } else if (diffDays === 0) {
          urgency = "DUE_TODAY";
          timePeriod = "TODAY";
          timePeriodLabel = "Due Today";
        } else if (diffDays <= 7) {
          urgency = "DUE_SOON";
          timePeriod = "THIS_WEEK";
          timePeriodLabel = "Due This Week";
        } else if (diffDays <= 30) {
          urgency = "SCHEDULED";
          timePeriod = "THIS_MONTH";
          timePeriodLabel = "Due This Month";
        } else if (diffDays <= 60) {
          urgency = "SCHEDULED";
          timePeriod = "NEXT_MONTH";
          timePeriodLabel = "Due Next Month";
        } else {
          urgency = "SCHEDULED";
          timePeriod = "LATER";
          timePeriodLabel = "Later (60+ Days)";
        }
      }

      return {
        id: `${purchase.id}_inst_${cycleIndex}`,
        purchaseId: purchase.id,
        orderId: purchase.id,
        user: {
          ...(typeof purchase.user === "object" ? purchase.user : {}),
          userId: purchase.user?.userId || purchase.userId || "",
          userName: purchase.user?.userName || purchase.userName || "Customer",
          phone: resolvedCustomerPhone,
        },
        SaleBy: purchase.SaleBy || purchase.saleBy || null,
        userId: purchase.user?.userId || purchase.userId || "",
        userName: purchase.user?.userName || purchase.userName || "Customer",
        customerPhone: resolvedCustomerPhone,
        phone: resolvedCustomerPhone,
        userPhone: resolvedCustomerPhone,
        customerEmail: purchase.user?.email || purchase.userEmail || purchase.email || "",
        serviceTitle: purchase.itemSnapshot?.serviceTitle || purchase.serviceName || "Digital Service",
        planTitle: purchase.itemSnapshot?.planTitle || purchase.planName || "Plan",
        variantName: purchase.itemSnapshot?.variantName || purchase.duration || "",
        cycleIndex,
        totalCycles,
        paidCycles,
        amount: Number(amount || defaultEmiAmount || remainingAmount || 0),
        dueDate: dueDateStr,
        dueMs,
        diffDays,
        urgency,
        timePeriod,
        timePeriodLabel,
        status,
        subscriptionId: mandate.subscriptionId || "",
        mandateStatus: mandate.status || (rawStatus === "ACTIVE" ? "AUTHORIZED" : "PENDING"),
        nextDebitDate: mandate.nextDebitDate || null,
        fullPurchase: purchase,
      };
    };

    // Case 1: Document has explicit installments stored
    if (rawInstallments.length > 0) {
      rawInstallments.forEach((inst, index) => {
        const cycleIndex = Number(inst.cycleIndex ?? index + 1);
        const status = String(inst.status || "PENDING").toUpperCase();

        // Skip settled installments
        if (status === "PAID" || status === "COMPLETED" || (paidCycles > 0 && cycleIndex <= paidCycles)) {
          return;
        }

        const dueDateStr = inst.dueDate || inst.scheduledDate || null;
        const amount = Number(inst.amount || defaultEmiAmount || 0);

        installments.push(
          buildInstallment({ cycleIndex, amount, dueDateStr, status })
        );
      });
    } else {
      // Case 2: Document has no explicit installments array (common client checkout scenario)
      // Synthesize the remaining scheduled cycles from baseDate and cycle count!
      const startCycle = Math.max(1, paidCycles + 1);

      for (let c = startCycle; c <= totalCycles; c++) {
        let dueDate = new Date(baseDate);

        if (c === paidCycles + 1 && mandate.nextDebitDate) {
          dueDate = new Date(mandate.nextDebitDate);
        } else {
          // Add 1 month for each subsequent cycle relative to baseDate
          const monthOffset = c - paidCycles;
          dueDate.setMonth(dueDate.getMonth() + monthOffset);
        }

        const dueDateStr = !isNaN(dueDate.getTime()) ? dueDate.toISOString() : null;
        const amount = Number(defaultEmiAmount || (remainingCycles > 0 ? remainingAmount / remainingCycles : 0));

        installments.push(
          buildInstallment({
            cycleIndex: c,
            amount,
            dueDateStr,
            status: "PENDING",
          })
        );
      }
    }
  });

  // Sort earliest due date first (overdue & imminent at the top)
  return installments.sort((a, b) => {
    if (a.dueMs && b.dueMs) return a.dueMs - b.dueMs;
    if (a.dueMs) return -1;
    if (b.dueMs) return 1;
    return a.cycleIndex - b.cycleIndex;
  });
}

/**
 * Calculates aggregate KPI metrics for Upcoming EMI payments by time period.
 *
 * @param {Array} installments - List of upcoming installments
 * @returns {Object} Calculated KPI figures
 */
export function getUpcomingEmiMetrics(installments = []) {
  const totalCount = installments.length;
  const totalVolume = installments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const overdue = installments.filter((item) => item.timePeriod === "OVERDUE");
  const overdueCount = overdue.length;
  const overdueVolume = overdue.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const today = installments.filter((item) => item.timePeriod === "TODAY");
  const todayCount = today.length;
  const todayVolume = today.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Next 7 days (including today)
  const thisWeek = installments.filter(
    (item) => item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 7
  );
  const thisWeekCount = thisWeek.length;
  const thisWeekVolume = thisWeek.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Next 30 days (including today & next 7 days)
  const thisMonth = installments.filter(
    (item) => item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 30
  );
  const thisMonthCount = thisMonth.length;
  const thisMonthVolume = thisMonth.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const nextMonth = installments.filter(
    (item) => item.diffDays !== null && item.diffDays > 30 && item.diffDays <= 60
  );
  const nextMonthCount = nextMonth.length;
  const nextMonthVolume = nextMonth.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const later = installments.filter(
    (item) => item.diffDays === null || item.diffDays > 60
  );
  const laterCount = later.length;
  const laterVolume = later.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return {
    totalCount,
    totalVolume,
    overdueCount,
    overdueVolume,
    todayCount,
    todayVolume,
    thisWeekCount,
    thisWeekVolume,
    thisMonthCount,
    thisMonthVolume,
    nextMonthCount,
    nextMonthVolume,
    laterCount,
    laterVolume,
  };
}

/**
 * Groups a list of installments by time period bucket.
 *
 * @param {Array} installments - List of upcoming installments
 * @returns {Array} Array of groups with items and total volume
 */
export function groupInstallmentsByPeriod(installments = []) {
  const groupsMap = {};
  TIME_PERIOD_ORDER.forEach((p) => {
    groupsMap[p.id] = { ...p, items: [], totalVolume: 0 };
  });

  installments.forEach((inst) => {
    const pId = inst.timePeriod || "LATER";
    if (!groupsMap[pId]) {
      groupsMap[pId] = {
        id: pId,
        label: inst.timePeriodLabel || pId,
        color: "slate",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        items: [],
        totalVolume: 0,
      };
    }
    groupsMap[pId].items.push(inst);
    groupsMap[pId].totalVolume += Number(inst.amount) || 0;
  });

  return TIME_PERIOD_ORDER.map((p) => groupsMap[p.id]).filter((g) => g && g.items.length > 0);
}

/**
 * Filters and searches upcoming installments.
 *
 * @param {Array} installments - List of upcoming installments
 * @param {Object} options - Filter & search params
 * @returns {Array} Filtered list
 */
export function filterUpcomingEmiInstallments(
  installments = [],
  { filter = "ALL", search = "" } = {}
) {
  let list = [...installments];

  // Quick filter by time period
  const normalizedFilter = String(filter || "ALL").toUpperCase();
  if (normalizedFilter === "OVERDUE") {
    list = list.filter((item) => item.timePeriod === "OVERDUE");
  } else if (normalizedFilter === "TODAY") {
    list = list.filter((item) => item.timePeriod === "TODAY");
  } else if (normalizedFilter === "THIS_WEEK" || normalizedFilter === "DUE_7_DAYS") {
    list = list.filter((item) => item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 7);
  } else if (normalizedFilter === "THIS_MONTH" || normalizedFilter === "DUE_30_DAYS") {
    list = list.filter((item) => item.diffDays !== null && item.diffDays >= 0 && item.diffDays <= 30);
  } else if (normalizedFilter === "NEXT_MONTH") {
    list = list.filter((item) => item.diffDays !== null && item.diffDays > 30 && item.diffDays <= 60);
  } else if (normalizedFilter === "LATER") {
    list = list.filter((item) => item.diffDays === null || item.diffDays > 60);
  }

  // Freeform search across Customer, Phone, Order ID, Plan, Subscription ID
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((item) => {
      return (
        item.purchaseId?.toLowerCase().includes(q) ||
        item.userName?.toLowerCase().includes(q) ||
        item.userId?.toLowerCase().includes(q) ||
        item.customerPhone?.toLowerCase().includes(q) ||
        item.customerEmail?.toLowerCase().includes(q) ||
        item.planTitle?.toLowerCase().includes(q) ||
        item.serviceTitle?.toLowerCase().includes(q) ||
        item.subscriptionId?.toLowerCase().includes(q)
      );
    });
  }

  return list;
}

/**
 * Paginates a list of installments.
 *
 * @param {Array} list - Filtered list
 * @param {number} page - 1-based page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Paginated items and pagination metadata
 */
export function paginateUpcomingEmi(list = [], page = 1, pageSize = 20) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const items = list.slice(startIndex, startIndex + pageSize);

  return {
    items,
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Exports upcoming EMI installment details to CSV, structured time-period wise.
 *
 * @param {Array} installments - List of upcoming EMI installment objects
 * @param {string} filterPeriod - Active period filter (ALL, OVERDUE, TODAY, THIS_WEEK, etc.)
 */
export function exportUpcomingEmiCsv(installments = [], filterPeriod = "ALL") {
  if (!installments || installments.length === 0) {
    alert("No EMI installments available to download for this selection.");
    return;
  }

  // Define sort priority for time periods
  const periodRank = {
    OVERDUE: 1,
    TODAY: 2,
    THIS_WEEK: 3,
    THIS_MONTH: 4,
    NEXT_MONTH: 5,
    LATER: 6,
  };

  // Sort installments time-period wise
  const sorted = [...installments].sort((a, b) => {
    const rankA = periodRank[a.timePeriod] || 99;
    const rankB = periodRank[b.timePeriod] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return (a.dueMs || 0) - (b.dueMs || 0);
  });

  const headers = [
    "Time Period",
    "Customer Name",
    "Customer Phone",
    "Customer Email",
    "Due Date",
    "Amount (INR)",
    "Installment Cycle",
    "Service Name",
    "Plan Title",
    "Salesman (Sold By)",
    "Urgency Status",
    "Order / Purchase ID",
    "User ID",
    "Subscription ID",
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = sorted.map((inst) => [
    escapeCsv(inst.timePeriodLabel || inst.timePeriod || "Scheduled"),
    escapeCsv(inst.user?.userName || inst.userName || "Customer"),
    escapeCsv(inst.user?.phone || inst.customerPhone || inst.phone || ""),
    escapeCsv(inst.user?.email || inst.customerEmail || ""),
    escapeCsv(
      inst.dueDate
        ? new Date(inst.dueDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Scheduled"
    ),
    escapeCsv(inst.amount || 0),
    escapeCsv(
      `Cycle ${inst.cycleIndex}${inst.totalCycles ? ` of ${inst.totalCycles}` : ""}`
    ),
    escapeCsv(inst.serviceTitle || ""),
    escapeCsv(inst.planTitle || ""),
    escapeCsv(inst.SaleBy || inst.saleBy || inst.fullPurchase?.SaleBy || "Direct / Online"),
    escapeCsv(inst.urgency || inst.status || "SCHEDULED"),
    escapeCsv(inst.purchaseId || inst.orderId || ""),
    escapeCsv(inst.user?.userId || inst.userId || ""),
    escapeCsv(inst.subscriptionId || "None"),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const dateStr = new Date().toISOString().slice(0, 10);
  const periodSlug =
    filterPeriod && filterPeriod !== "ALL"
      ? `-${filterPeriod.toLowerCase().replace(/_/g, "-")}`
      : "-all-periods";
  const filename = `upcoming-emi-details${periodSlug}-${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
