import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import { queryKeys } from "../../../lib/queryClient";

/**
 * Custom TanStack Query hook for cursor-paginated Cash Codes.
 */
export function useCashCodesQuery({
  status = "all",
  search = "",
  pageSize = 10,
  cursor = null,
} = {}) {
  const cursorKey = cursor ? (cursor.id || cursor) : null;

  return useQuery({
    queryKey: queryKeys.cashCodes.list({
      status,
      search,
      pageSize,
      cursor: cursorKey,
    }),
    queryFn: () =>
      adminApi.getCashCodesPaginated({
        status,
        search,
        pageSize,
        cursor,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s freshness
    gcTime: 5 * 60 * 1000, // 5m in memory
  });
}

/**
 * Tab count aggregates query hook.
 */
export function useCashCodeCountsQuery() {
  return useQuery({
    queryKey: queryKeys.cashCodes.counts(),
    queryFn: () => adminApi.getCashCodeCounts(),
    staleTime: 3 * 60 * 1000, // 3m freshness
  });
}

/**
 * Mutation hooks with targeted cache invalidation.
 */
export function useCashCodeMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cashCodes.all() });
  };

  const issueMutation = useMutation({
    mutationFn: (data) => adminApi.issueCashCode(data),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateCashCode(id, data),
    onSuccess: invalidateAll,
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.revokeCashCode(id, reason),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCashCode(id),
    onSuccess: invalidateAll,
  });

  return {
    issueMutation,
    updateMutation,
    revokeMutation,
    deleteMutation,
  };
}

