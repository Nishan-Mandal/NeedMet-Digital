import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { queryKeys } from "../../../../lib/queryClient";
import { getPurchaseById, filterAndPaginatePurchases } from "../services/Purchases";

/**
 * Finds cached purchases from TanStack Query memory.
 */
export function findCachedPurchases(queryClient) {
  try {
    // 1. Check master allPurchases cache from useTransactionsData
    const allData = queryClient.getQueryData(["admin", "transactions", "allPurchases"]);
    if (Array.isArray(allData?.purchases) && allData.purchases.length > 0) {
      return allData.purchases;
    }
    // 2. Check any query under ["admin", "purchases"]
    const matching = queryClient.getQueriesData({ queryKey: ["admin", "purchases"] });
    for (const [, val] of matching) {
      if (!val) continue;
      if (Array.isArray(val.purchases) && val.purchases.length > 0) {
        return val.purchases;
      }
      if (Array.isArray(val.orders) && val.orders.length > 0) {
        return val.orders;
      }
      if (Array.isArray(val) && val.length > 0) {
        return val;
      }
    }
  } catch (err) {
    console.warn("Failed reading cached purchases:", err);
  }
  return null;
}

/**
 * Custom TanStack Query hook for paginated Purchases.
 * Reuses already-cached purchases to prevent redundant Firestore network reads.
 */
export function usePurchasesQuery({
  page = 1,
  pageSize = 15,
  status = "all",
  search = "",
} = {}) {
  const queryClient = useQueryClient();

  const resolveFromCache = () => {
    const cachedList = findCachedPurchases(queryClient);
    if (!cachedList || cachedList.length === 0) return null;

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      // Check if this purchase exists in the cached list
      const hasMatch = cachedList.some(
        (p) =>
          (p.id && p.id.toLowerCase() === s) ||
          (p.orderId && p.orderId.toLowerCase() === s) ||
          (p.purchaseId && p.purchaseId.toLowerCase() === s) ||
          (p.id && p.id.toLowerCase().includes(s)) ||
          (p.orderId && p.orderId.toLowerCase().includes(s)) ||
          (p.user?.userName && p.user.userName.toLowerCase().includes(s)) ||
          (p.user?.phone && p.user.phone.toLowerCase().includes(s))
      );
      if (hasMatch) {
        return filterAndPaginatePurchases(cachedList, { page, pageSize, status, search });
      }
      return null;
    }

    // No search query: return cached purchases filtered by status & paginated
    return filterAndPaginatePurchases(cachedList, { page, pageSize, status, search });
  };

  return useQuery({
    queryKey: queryKeys.adminPurchases.list({
      page,
      pageSize,
      status,
      search,
    }),
    queryFn: async () => {
      // 1. If matching data is already in cache, return it immediately without fetching Firestore
      const cachedResult = resolveFromCache();
      if (cachedResult) {
        return cachedResult;
      }

      // 2. If search is a specific ID and not in cache, try fetching single document by ID first
      if (search && search.trim() && !search.includes(" ")) {
        const singleDoc = await getPurchaseById(search.trim());
        if (singleDoc) {
          return filterAndPaginatePurchases([singleDoc], { page, pageSize, status, search });
        }
      }

      // 3. Fallback: fetch purchases from Firestore
      return await adminApi.getPurchases({
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
 * Mutation hooks for purchases lifecycle updates.
 */
export function usePurchaseMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPurchases.all() });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, targetCollection }) =>
      adminApi.updatePurchaseStatus(id, status, targetCollection),
    onSuccess: invalidateAll,
  });

  return {
    updateStatusMutation,
  };
}

export default usePurchasesQuery;

