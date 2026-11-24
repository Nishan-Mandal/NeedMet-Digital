import { useMemo } from "react";
import { useTransactionsData } from "./useTransactionsData";
import {
  filterUpcomingEmiInstallments,
  paginateUpcomingEmi,
} from "../services/upcomingEmi.service";

/**
 * Hook for Upcoming EMI Payments view.
 *
 * Uses already-fetched purchases and payments from the cache;
 * only fetches new data from Firestore if the cache is empty.
 */
export function useUpcomingEmiQuery({
  page = 1,
  pageSize = 20,
  filter = "ALL",
  search = "",
} = {}) {
  const {
    upcomingEmiInstallments: allInstallments,
    upcomingEmiMetrics: metrics,
    upcomingEmiLoading: isLoading,
    purchasesError,
    paymentsError,
    refetchAll: refetch,
  } = useTransactionsData();

  // Filter & Search
  const filteredInstallments = useMemo(() => {
    return filterUpcomingEmiInstallments(allInstallments, { filter, search });
  }, [allInstallments, filter, search]);

  // Pagination
  const paginatedResult = useMemo(() => {
    return paginateUpcomingEmi(filteredInstallments, page, pageSize);
  }, [filteredInstallments, page, pageSize]);

  return {
    installments: paginatedResult.items,
    filteredInstallments,
    allCount: allInstallments.length,
    metrics,
    pagination: paginatedResult.pagination,
    isLoading,
    error: purchasesError || paymentsError,
    refetch,
  };
}

export default useUpcomingEmiQuery;
