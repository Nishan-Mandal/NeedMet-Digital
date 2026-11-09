import { QueryClient } from "@tanstack/react-query";

/**
 * Global TanStack QueryClient with production caching defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default freshness
      gcTime: 10 * 60 * 1000, // 10 minutes in memory before garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Deterministic query key hierarchy for cache isolation across users, pages, and filters.
 */
export const queryKeys = {
  // User Profile Plans
  userPurchases: {
    all: (userId) => ["user", userId, "purchases"],
    list: (userId, { status = "all", pageSize = 6, cursor = null } = {}) => [
      "user",
      userId,
      "purchases",
      "list",
      { status, pageSize, cursor },
    ],
    detail: (userId, purchaseId) => ["user", userId, "purchases", "detail", purchaseId],
  },

  // Admin Cash Codes
  cashCodes: {
    all: () => ["admin", "cash-codes"],
    list: ({ status = "all", search = "", pageSize = 10, cursor = null } = {}) => [
      "admin",
      "cash-codes",
      "list",
      {
        status,
        search: (search || "").trim().toUpperCase(),
        pageSize,
        cursor,
      },
    ],
    detail: (codeId) => ["admin", "cash-codes", "detail", codeId],
    counts: () => ["admin", "cash-codes", "counts"],
  },

  // Admin Coupons
  coupons: {
    all: () => ["admin", "coupons"],
    list: ({ status = "all", search = "", pageSize = 10, cursor = null } = {}) => [
      "admin",
      "coupons",
      "list",
      {
        status,
        search: (search || "").trim().toUpperCase(),
        pageSize,
        cursor,
      },
    ],
    detail: (couponId) => ["admin", "coupons", "detail", couponId],
    counts: () => ["admin", "coupons", "counts"],
  },

  // Admin Plans & Services
  adminPlans: {
    all: () => ["admin", "plans"],
    list: ({ status = "all", search = "", category = "all", pageSize = 10, cursor = null } = {}) => [
      "admin",
      "plans",
      "list",
      {
        status,
        search: (search || "").trim().toLowerCase(),
        category,
        pageSize,
        cursor,
      },
    ],
    detail: (planId) => ["admin", "plans", "detail", planId],
    metrics: () => ["admin", "plans", "metrics"],
  },
};

