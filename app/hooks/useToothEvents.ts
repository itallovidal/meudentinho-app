import { toothEventReferenceDate } from "@/lib/toothIdentity";
import { isApiError } from "@/types/predicates";
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
        toothEventReferenceDate(b).localeCompare(toothEventReferenceDate(a)) ||
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
  }, [query.data, accountId]);

  const inaccessible =
    isApiError(query.error) &&
    [
      "KID_NOT_LINKED_TO_PARENT",
      "KID_NOT_FOUND",
      "INVALID_CREDENTIALS",
    ].includes(query.error.code);
  return {
    ...query,
    events,
    hasCompleteData:
      !!kidId &&
      !!authToken &&
      !!accountId &&
      query.data !== undefined &&
      !inaccessible,
  };
}
