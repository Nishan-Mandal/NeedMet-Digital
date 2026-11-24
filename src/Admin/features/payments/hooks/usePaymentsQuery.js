import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { queryKeys } from "../../../../lib/queryClient";
import { filterAndPaginatePayments } from "../services/Payments";

/**
 * Finds cached payments from TanStack Query memory.
 */
export function findCachedPayments(queryClient) {
  try {
    // 1. Check master allPayments cache from useTransactionsData
    const allData = queryClient.getQueryData(["admin", "transactions", "allPayments"]);
    if (Array.isArray(allData?.payments) && allData.payments.length > 0) {
      return allData.payments;
    }
    // 2. Check any query under ["admin", "payments"]
    const matching = queryClient.getQueriesData({ queryKey: ["admin", "payments"] });
    for (const [, val] of matching) {
      if (!val) continue;
      if (Array.isArray(val.payments) && val.payments.length > 0) {
        return val.payments;
      }
      if (Array.isArray(val) && val.length > 0) {
        return val;
      }
    }
  } catch (err) {
    console.warn("Failed reading cached payments:", err);
  }
  return null;
}

/**
 * Custom TanStack Query hook for paginated Payments.
 * Reuses already-cached payments to prevent redundant Firestore network reads.
 */
export function usePaymentsQuery({
  page = 1,
  pageSize = 15,
  status = "all",
  search = "",
} = {}) {
  const queryClient = useQueryClient();

  const resolveFromCache = () => {
    const cachedList = findCachedPayments(queryClient);
    if (!cachedList || cachedList.length === 0) return null;

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      const hasMatch = cachedList.some(
        (p) =>
          (p.id && p.id.toLowerCase() === s) ||
          (p.orderId && p.orderId.toLowerCase() === s) ||
          (p.userId && p.userId.toLowerCase().includes(s)) ||
          (p.userName && p.userName.toLowerCase().includes(s))
      );
      if (hasMatch) {
        return filterAndPaginatePayments(cachedList, { page, pageSize, status, search });
      }
      return null;
    }

    return filterAndPaginatePayments(cachedList, { page, pageSize, status, search });
  };

  return useQuery({
    queryKey: queryKeys.adminPayments.list({
      page,
      pageSize,
      status,
      search,
    }),
    queryFn: async () => {
      // 1. If matching data is in cache, return immediately
      const cachedResult = resolveFromCache();
      if (cachedResult) {
        return cachedResult;
      }

      // 2. Fallback: fetch payments from Firestore
      return await adminApi.getPayments({
        page,
        limit: pageSize,
        status,
        search,
      });
    },
    initialData: () => {
      return resolveFromCache() || undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1m freshness
    gcTime: 10 * 60 * 1000, // 10m in memory
  });
}

/**
 * Mutation hooks for payment transactions status updates.
 */
export function usePaymentMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments.all() });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updatePaymentStatus(id, status),
    onSuccess: invalidateAll,
  });

  return {
    updateStatusMutation,
  };
}

export default usePaymentsQuery;

