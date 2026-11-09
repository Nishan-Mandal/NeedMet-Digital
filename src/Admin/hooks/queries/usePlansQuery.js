import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import { queryKeys } from "../../../lib/queryClient";

/**
 * Custom TanStack Query hook for cursor-paginated Admin Plans & Services.
 */
export function usePlansQuery({
  status = "all",
  search = "",
  category = "all",
  pageSize = 10,
  cursor = null,
} = {}) {
  const cursorKey = cursor ? (cursor.id || cursor) : null;

  return useQuery({
    queryKey: queryKeys.adminPlans.list({
      status,
      search,
      category,
      pageSize,
      cursor: cursorKey,
    }),
    queryFn: () =>
      adminApi.fetchAdminPlansPaginated({
        status,
        search,
        category,
        pageSize,
        cursor,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5m freshness
    gcTime: 30 * 60 * 1000, // 30m in memory
  });
}

/**
 * Service metrics query hook.
 */
export function usePlanMetricsQuery() {
  return useQuery({
    queryKey: queryKeys.adminPlans.metrics(),
    queryFn: () => adminApi.fetchAdminPlansMetrics(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation hooks with targeted cache invalidation for plans.
 */
export function usePlanMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans.all() });
  };

  const publishMutation = useMutation({
    mutationFn: ({ id, currentUser }) => adminApi.publishPlan(id, currentUser),
    onSuccess: invalidateAll,
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, currentUser }) => adminApi.archivePlan(id, currentUser),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deletePlan(id),
    onSuccess: invalidateAll,
  });

  return {
    publishMutation,
    archiveMutation,
    deleteMutation,
  };
}

