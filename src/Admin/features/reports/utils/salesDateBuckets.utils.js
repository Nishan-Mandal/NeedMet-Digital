/**
 * Date Range & Time Bucket Utilities for Sales Reporting
 * Determines date intervals, previous period windows, and aggregation buckets.
 */

export const TIMEFRAME_PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "this_year", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

/**
 * Returns { start, end, previousStart, previousEnd, interval, label } for a given preset or custom dates.
 */
export function resolveDateRange(timeframe = "30d", customRange = null) {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  let previousStart = new Date();
  let previousEnd = new Date();
  let interval = "daily";
  let label = "Last 30 Days";

  // Normalize end of today to 23:59:59.999
  end.setHours(23, 59, 59, 999);

  switch (timeframe) {
    case "today": {
      label = "Today";
      start.setHours(0, 0, 0, 0);
      interval = "hourly";

      // Previous period: Yesterday
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(end);
      previousEnd.setDate(previousEnd.getDate() - 1);
      break;
    }

    case "7d": {
      label = "Last 7 Days";
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      interval = "daily";

      const diffMs = end.getTime() - start.getTime();
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - diffMs);
      break;
    }

    case "30d":
    default: {
      label = "Last 30 Days";
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      interval = "daily";

      const diffMs = end.getTime() - start.getTime();
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - diffMs);
      break;
    }

    case "this_month": {
      label = "This Month";
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      interval = "daily";

      // Previous month
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }

    case "last_month": {
      label = "Last Month";
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      interval = "daily";

      // Two months ago
      previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      break;
    }

    case "this_year": {
      label = "This Year";
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      interval = "monthly";

      previousStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    }

    case "custom": {
      label = "Custom Range";
      if (customRange?.start) {
        start = new Date(customRange.start);
        start.setHours(0, 0, 0, 0);
      }
      if (customRange?.end) {
        end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
      }

      const diffMs = Math.max(1, end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        interval = "hourly";
      } else if (diffDays <= 60) {
        interval = "daily";
      } else if (diffDays <= 180) {
        interval = "weekly";
      } else {
        interval = "monthly";
      }

      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - diffMs);
      break;
    }
  }

  return {
    timeframe,
    label,
    start,
    end,
    previousStart,
    previousEnd,
    interval,
  };
}

/**
 * Generates empty time buckets for charting along a resolved range and interval.
 */
export function generateTimeBuckets(start, end, interval = "daily") {
  const buckets = [];
  const curr = new Date(start);

  if (interval === "hourly") {
    while (curr <= end) {
      const bucketStart = new Date(curr);
      const bucketEnd = new Date(curr);
      bucketEnd.setMinutes(59, 59, 999);

      const hour12 = curr.getHours() % 12 || 12;
      const ampm = curr.getHours() >= 12 ? "PM" : "AM";

      buckets.push({
        key: `hour-${curr.getHours()}`,
        label: `${hour12}:00 ${ampm}`,
        shortLabel: `${hour12} ${ampm}`,
        start: bucketStart,
        end: bucketEnd,
        grossSales: 0,
        cashCollected: 0,
        netRevenue: 0,
        refundedAmount: 0,
        ordersCount: 0,
        paymentsCount: 0,
      });

      curr.setHours(curr.getHours() + 1, 0, 0, 0);
    }
    return buckets;
  }

  if (interval === "daily") {
    while (curr <= end) {
      const bucketStart = new Date(curr);
      bucketStart.setHours(0, 0, 0, 0);
      const bucketEnd = new Date(curr);
      bucketEnd.setHours(23, 59, 59, 999);

      const dateStr = curr.toISOString().split("T")[0];
      const displayLabel = curr.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      buckets.push({
        key: dateStr,
        label: displayLabel,
        shortLabel: String(curr.getDate()),
        start: bucketStart,
        end: bucketEnd,
        grossSales: 0,
        cashCollected: 0,
        netRevenue: 0,
        refundedAmount: 0,
        ordersCount: 0,
        paymentsCount: 0,
      });

      curr.setDate(curr.getDate() + 1);
    }
    return buckets;
  }

  if (interval === "weekly") {
    let weekIndex = 1;
    while (curr <= end) {
      const bucketStart = new Date(curr);
      const bucketEnd = new Date(curr);
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);

      const label = `W${weekIndex} (${curr.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })})`;

      buckets.push({
        key: `week-${weekIndex}`,
        label,
        shortLabel: `W${weekIndex}`,
        start: bucketStart,
        end: bucketEnd > end ? new Date(end) : bucketEnd,
        grossSales: 0,
        cashCollected: 0,
        netRevenue: 0,
        refundedAmount: 0,
        ordersCount: 0,
        paymentsCount: 0,
      });

      weekIndex += 1;
      curr.setDate(curr.getDate() + 7);
    }
    return buckets;
  }

  // Monthly
  while (curr <= end) {
    const bucketStart = new Date(curr.getFullYear(), curr.getMonth(), 1, 0, 0, 0, 0);
    const bucketEnd = new Date(curr.getFullYear(), curr.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthLabel = curr.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });

    buckets.push({
      key: `${curr.getFullYear()}-${curr.getMonth() + 1}`,
      label: monthLabel,
      shortLabel: monthLabel,
      start: bucketStart,
      end: bucketEnd > end ? new Date(end) : bucketEnd,
      grossSales: 0,
      cashCollected: 0,
      netRevenue: 0,
      refundedAmount: 0,
      ordersCount: 0,
      paymentsCount: 0,
    });

    curr.setMonth(curr.getMonth() + 1, 1);
  }

  return buckets;
}

