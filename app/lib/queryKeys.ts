import { getUserIdFromToken } from "@/lib/utils";

export function resolveAccountId(
  userId: string | null | undefined,
  authToken: string | null | undefined,
): string | null {
  if (userId) {
    return userId;
  }
  if (!authToken) {
    return null;
  }
  try {
    return getUserIdFromToken(authToken) ?? null;
  } catch {
    return null;
  }
}

export function kidsQueryKey(accountId: string | null | undefined) {
  return ["kids", accountId ?? "anon"] as const;
}

export function toothEventsQueryKey(
  accountId: string | null | undefined,
  kidId: string | null | undefined,
) {
  return ["tooth-events", accountId ?? "anon", kidId ?? ""] as const;
}

export function toothEventsInfiniteQueryKey(
  accountId: string | null | undefined,
  kidId: string | null | undefined,
  perPage: number,
) {
  return [
    "tooth-events",
    accountId ?? "anon",
    kidId ?? "",
    "infinite",
    perPage,
  ] as const;
}
