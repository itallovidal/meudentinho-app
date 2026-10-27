import { parseLocalDate, toLocalDateKey } from "@/lib/utils";
import { useCallback, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/contexts/UserContext";
import { getToothAlertSnoozes } from "@/api/smile/getToothAlertSnoozes";
import { snoozeToothAlert } from "@/api/smile/snoozeToothAlert";
import { useCurrentDate } from "@/hooks/useCurrentDate";
import {
  buildToothMilestones,
  partitionToothAlerts,
} from "@/lib/toothMilestones";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { retryQuery } from "@/lib/queryRetry";
import type { ToothEvent } from "@/types/teeth";
import type { ChronologyGender } from "@/lib/toothChronology";

export function useToothPredictionAlerts({
  kid,
  events,
  eventsReady,
  eventsStale,
}: {
  kid?: {
    id: string;
    birthDate: string;
    gender?: ChronologyGender | null;
    createdAt?: string;
  };
  events: ToothEvent[];
  eventsReady: boolean;
  eventsStale: boolean;
}) {
  const { userId, authToken } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
  const queryClient = useQueryClient();
  const queryKey = [
    ...toothEventsQueryKey(accountId, kid?.id),
    "alert-preferences",
  ];
  const enabled = !!kid && !!authToken && !!accountId;
  const preferences = useQuery({
    queryKey,
    queryFn: () => getToothAlertSnoozes(kid!.id, authToken!),
    enabled,
    retry: retryQuery,
  });
  const expirations = useMemo(
    () => preferences.data?.map((item) => item.snoozedUntil),
    [preferences.data],
  );
  const refreshOnResume = useCallback(() => {
    if (enabled)
      void queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, kid?.id),
      });
  }, [enabled, queryClient, accountId, kid?.id]);
  const referenceDate = useCurrentDate(expirations, refreshOnResume);
  const milestones = useMemo(
    () =>
      kid && eventsReady
        ? buildToothMilestones({
            kidId: kid.id,
            birthDate: kid.birthDate,
            events,
            gender: kid.gender,
            referenceDate,
            trackingStartedAt: kid.createdAt,
          })
        : [],
    [kid, events, eventsReady, referenceDate],
  );
  const birth = kid ? parseLocalDate(kid.birthDate) : null;
  const evaluationError =
    kid && (!birth || toLocalDateKey(birth) > toLocalDateKey(referenceDate))
      ? "Corrija a data de nascimento do dependente para avaliar os avisos."
      : null;
  const ready =
    enabled &&
    eventsReady &&
    preferences.data !== undefined &&
    !evaluationError;
  const groups = useMemo(
    () =>
      partitionToothAlerts(milestones, preferences.data ?? [], referenceDate),
    [milestones, preferences.data, referenceDate],
  );
  const snooze = useMutation({
    mutationFn: (id: string) => snoozeToothAlert(id, authToken ?? ""),
    onSuccess: (_data, id) =>
      queryClient.invalidateQueries({
        queryKey: [
          ...toothEventsQueryKey(accountId, id.split("|")[0]),
          "alert-preferences",
        ],
      }),
  });
  return {
    ...groups,
    milestones,
    ready,
    stale: eventsStale || preferences.isRefetchError,
    error: preferences.error,
    evaluationError,
    loading: enabled && preferences.isPending,
    snoozes: preferences.data ?? [],
    referenceDate,
    refetch: preferences.refetch,
    snooze,
  };
}
