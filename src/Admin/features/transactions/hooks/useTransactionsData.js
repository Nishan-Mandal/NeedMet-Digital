import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../services/adminApi";
import { extractUpcomingEmiInstallments, getUpcomingEmiMetrics } from "../services/upcomingEmi.service";

/**
 * Finds already-fetched records from any matching query in TanStack Query cache.
 */
function findCachedList(queryClient, queryPrefix, listProp) {
  try {
    const matching = queryClient.getQueriesData({ queryKey: queryPrefix });
    for (const [, val] of matching) {
      if (!val) continue;
      if (Array.isArray(val[listProp]) && val[listProp].length > 0) {
        return val[listProp];
      }
      if (listProp === "purchases" && Array.isArray(val.orders) && val.orders.length > 0) {
        return val.orders;
      }
      if (Array.isArray(val) && val.length > 0) {
        return val;
      }
    }
  } catch (err) {
    console.warn("Failed reading cached query data:", err);
  }
  return null;
}

/**
 * Central Data Hook for Admin Transactions.
 *
 * Checks TanStack Query cache first for already-fetched purchases and payments.
 * If data is already present in memory/cache, it REUSES IT immediately.
 * Only if data is absent does it fetch fresh data from Firestore / API.
 */
export function useTransactionsData() {
  const queryClient = useQueryClient();

  // 1. Check if purchases are already cached from previous tab or query
  const cachedPurchases = useMemo(() => {
    return findCachedList(queryClient, ["admin", "purchases"], "purchases");
  }, [queryClient]);

  // 2. Check if payments are already cached from previous tab or query
  const cachedPayments = useMemo(() => {
    return findCachedList(queryClient, ["admin", "payments"], "payments");
  }, [queryClient]);

  // Master Purchases Query: Uses cached data as initialData if available
  const {
    data: purchasesData,
    isLoading: purchasesLoading,
    isFetching: purchasesFetching,
    error: purchasesError,
    refetch: refetchPurchases,
  } = useQuery({
    queryKey: ["admin", "transactions", "allPurchases"],
    queryFn: async () => {
      // Re-verify cache at fetch time
      const cached = findCachedList(queryClient, ["admin", "purchases"], "purchases");
      if (cached && cached.length > 0) {
        return { purchases: cached, totalCount: cached.length };
      }
      return await adminApi.getPurchases({ page: 1, limit: 400, status: "all", search: "" });
    },
    initialData: cachedPurchases ? { purchases: cachedPurchases, totalCount: cachedPurchases.length } : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes freshness
    gcTime: 15 * 60 * 1000,
  });

  // Master Payments Query: Uses cached data as initialData if available
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isFetching: paymentsFetching,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["admin", "transactions", "allPayments"],
    queryFn: async () => {
      // Re-verify cache at fetch time
      const cached = findCachedList(queryClient, ["admin", "payments"], "payments");
      if (cached && cached.length > 0) {
        return { payments: cached, totalCount: cached.length };
      }
      return await adminApi.getPayments({ page: 1, limit: 400, status: "all", search: "" });
    },
    initialData: cachedPayments ? { payments: cachedPayments, totalCount: cachedPayments.length } : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const purchases = purchasesData?.purchases || purchasesData?.orders || [];
  const payments = paymentsData?.payments || [];

  // 3. Extract and synthesize upcoming EMI installments from purchases and payments
  const upcomingEmiInstallments = useMemo(() => {
    return extractUpcomingEmiInstallments(purchases, payments);
  }, [purchases, payments]);

  // Aggregate EMI metrics
  const upcomingEmiMetrics = useMemo(() => {
    return getUpcomingEmiMetrics(upcomingEmiInstallments);
  }, [upcomingEmiInstallments]);

  const counts = {
    purchases: purchasesData?.metrics?.totalCount ?? purchases.length,
    payments: paymentsData?.metrics?.totalCount ?? payments.length,
    upcomingEmi: upcomingEmiInstallments.length,
  };

  return {
    purchases,
    purchasesMetrics: purchasesData?.metrics,
    purchasesLoading: purchasesLoading && !purchases.length,
    purchasesError,
    refetchPurchases,

    payments,
    paymentsMetrics: paymentsData?.metrics,
    paymentsLoading: paymentsLoading && !payments.length,
    paymentsError,
    refetchPayments,

    upcomingEmiInstallments,
    upcomingEmiMetrics,
    upcomingEmiLoading: (purchasesLoading || paymentsLoading) && !upcomingEmiInstallments.length,

    counts,
    isLoading: (purchasesLoading || paymentsLoading) && !purchases.length && !payments.length,
    refetchAll: () => {
      refetchPurchases();
      refetchPayments();
    },
  };
}

export default useTransactionsData;
