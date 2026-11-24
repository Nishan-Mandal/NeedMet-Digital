import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../../lib/queryClient";
import { getSalesReportData } from "../services/salesReport.service";

/**
 * Custom TanStack Query hook for the Sales Report Dashboard.
 * Caches calculated aggregates for 5 minutes (staleTime) and keeps them in memory for 30 minutes (gcTime).
 */
export function useSalesReportQuery({ timeframe = "30d", customRange = null } = {}) {
  return useQuery({
    queryKey: queryKeys.salesReport.dashboard(timeframe, customRange),
    queryFn: () => getSalesReportData({ timeframe, customRange }),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export default useSalesReportQuery;

