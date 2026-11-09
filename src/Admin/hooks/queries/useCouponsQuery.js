import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import { queryKeys } from "../../../lib/queryClient";

/**
 * Custom TanStack Query hook for cursor-paginated Coupons.
 */
export function useCouponsQuery({
  status = "all",
  search = "",
  pageSize = 10,
  cursor = null,
} = {}) {
  const cursorKey = cursor ? (cursor.id || cursor) : null;

  return useQuery({
    queryKey: queryKeys.coupons.list({
      status,
      search,
      pageSize,
      cursor: cursorKey,
    }),
    queryFn: () =>
      adminApi.getCouponsPaginated({
        status,
        search,
        pageSize,
        cursor,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1m freshness
    gcTime: 10 * 60 * 1000, // 10m in memory
  });
}

/**
 * Tab count aggregates query hook for coupons.
 */
export function useCouponCountsQuery() {
  return useQuery({
    queryKey: queryKeys.coupons.counts(),
    queryFn: () => adminApi.getCouponCounts(),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Mutation hooks with targeted cache invalidation for coupons.
 */
export function useCouponMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all() });
  };

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createCoupon(data),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateCoupon(id, data),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCoupon(id),
    onSuccess: invalidateAll,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) => adminApi.toggleCouponStatus(id, currentStatus),
    onSuccess: invalidateAll,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
  };
}

