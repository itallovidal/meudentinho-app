import { useContext } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getToothEventsByKid } from "@/api/smile/getToothEvents";
import { retryQuery } from "@/lib/queryRetry";
import { UserContext } from "@/contexts/UserContext";

export const TOOTH_EVENTS_PAGE_SIZE = 10;

export function useToothEventsInfinite(
  kidId: string | null,
  authToken: string | null | undefined,
  perPage: number = TOOTH_EVENTS_PAGE_SIZE,
) {
  const { userId } = useContext(UserContext)!;
  const query = useInfiniteQuery({
    queryKey: [
      "tooth-events",
      userId ?? authToken ?? "",
      kidId,
      "infinite",
      perPage,
    ],
    queryFn: ({ pageParam }) =>
      getToothEventsByKid(kidId!, authToken!, { page: pageParam, perPage }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta && meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
    enabled: !!kidId && !!authToken,
    staleTime: 1000 * 60 * 5,
    retry: retryQuery,
  });

  const events = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.meta?.total ?? 0;

  return { ...query, events, total };
}
