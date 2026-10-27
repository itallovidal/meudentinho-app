import { toothEventReferenceDate } from "@/lib/toothIdentity";
import { useCurrentDate } from "@/hooks/useCurrentDate";
import { useCallback, useContext, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getAllToothEventsByKid } from "@/api/smile/getToothEvents";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { retryQuery } from "@/lib/queryRetry";
import { buildSmileSummary, type SmileSummary } from "@/lib/smileSummary";
import { UserContext } from "@/contexts/UserContext";
import type { KidResponseDTO } from "@/types/dtos/user";
import type { ToothEvent } from "@/types/teeth";

const RECENT_EVENTS_PER_KID = 2;

export interface KidSmileSummary {
  kid: KidResponseDTO;
  summary: SmileSummary;
  recentEvents: ToothEvent[];
  isPending: boolean;
  isError: boolean;
}

function sortEvents(events: ToothEvent[]): ToothEvent[] {
  return [...events].sort(
    (a, b) =>
      toothEventReferenceDate(b).localeCompare(toothEventReferenceDate(a)) ||
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}

export function useKidsSmileSummaries(
  kids: KidResponseDTO[],
  authToken: string | null | undefined,
) {
  const referenceDate = useCurrentDate();
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);

  const queries = useQueries({
    queries: kids.map((kid) => ({
      queryKey: toothEventsQueryKey(accountId, kid.id),
      queryFn: () => getAllToothEventsByKid(kid.id, authToken ?? ""),
      enabled: !!authToken && !!accountId,
      staleTime: 1000 * 60 * 5,
      retry: retryQuery,
    })),
  });

  const items = useMemo<KidSmileSummary[]>(
    () =>
      kids.map((kid, index) => {
        const events = sortEvents(queries[index]?.data ?? []);
        return {
          kid,
          summary: buildSmileSummary(
            kid.birthDate,
            events,
            kid.gender ?? null,
            referenceDate,
          ),
          recentEvents: events.slice(0, RECENT_EVENTS_PER_KID),
          isPending: queries[index]?.isLoading ?? false,
          isError: queries[index]?.isLoadingError ?? false,
        };
      }),
    [kids, queries, referenceDate],
  );

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isLoadingError);
  const isRefreshing = queries.some(
    (query) => query.isFetching && !query.isPending,
  );

  const refetch = useCallback(async () => {
    await Promise.all(queries.map((query) => query.refetch()));
  }, [queries]);

  return { items, isLoading, isError, isRefreshing, refetch };
}
