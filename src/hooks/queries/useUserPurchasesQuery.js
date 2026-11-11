import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchUserPurchasesPaginated } from "../../services/db";
import { queryKeys } from "../../lib/queryClient";

/**
 * Custom TanStack Query hook for cursor-paginated User Purchased Plans.
 * Ensures strict user data isolation and instant caching.
 */
export function useUserPurchasesQuery({
  userId,
  status = "all",
  pageSize = 6,
  cursor = null,
} = {}) {
  const cursorKey = cursor ? (cursor.id || cursor) : null;

  return useQuery({
    queryKey: queryKeys.userPurchases.list(userId, {
      status,
      pageSize,
      cursor: cursorKey,
    }),
    queryFn: () =>
      fetchUserPurchasesPaginated(userId, {
        status,
        pageSize,
        cursor,
      }),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000, // 2m freshness
    gcTime: 10 * 60 * 1000, // 10m in memory
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to manually invalidate user purchases (e.g. after successful payment checkout).
 */
export function useInvalidateUserPurchases() {
  const queryClient = useQueryClient();

  return (userId) => {
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPurchases.all(userId),
      });
    }
  };
}

