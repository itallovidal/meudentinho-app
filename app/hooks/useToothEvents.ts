import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllToothEventsByKid } from "@/api/smile/getToothEvents";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { retryQuery } from "@/lib/queryRetry";
import { UserContext } from "@/contexts/UserContext";

export function useToothEvents(
  kidId: string | null,
  authToken: string | null | undefined,
) {
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
  const query = useQuery({
    queryKey: toothEventsQueryKey(accountId, kidId),
    queryFn: () => getAllToothEventsByKid(kidId!, authToken!),
    enabled: !!kidId && !!authToken && !!accountId,
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const events = useMemo(() => {
    const data = accountId ? (query.data ?? []) : [];
    return [...data].sort(
      (a, b) =>
        Date.parse(b.occurrenceDate) - Date.parse(a.occurrenceDate) ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  }, [query.data, accountId]);

  return { ...query, events };
}
