import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllToothEventsByKid } from "@/api/smile/getToothEvents";
import { UserContext } from "@/contexts/UserContext";

export function useToothEvents(
  kidId: string | null,
  authToken: string | null | undefined,
) {
  const { userId } = useContext(UserContext)!;
  const query = useQuery({
    queryKey: ["tooth-events", userId ?? authToken ?? "", kidId],
    queryFn: () => getAllToothEventsByKid(kidId!, authToken!),
    enabled: !!kidId && !!authToken,
    staleTime: 1000 * 60 * 5,
  });

  const events = useMemo(() => {
    const data = query.data ?? [];
    return [...data].sort((a, b) =>
      a.occurrenceDate < b.occurrenceDate ? 1 : -1,
    );
  }, [query.data]);

  return { ...query, events };
}
