import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useCurrentDate(
  nextChange?: string | readonly string[] | null,
  onResume?: () => void,
): Date {
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      const now = new Date();
      setReferenceDate(now);
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      ).getTime();
      const expirations =
        typeof nextChange === "string" ? [nextChange] : (nextChange ?? []);
      const future = expirations
        .map((value) => new Date(value).getTime())
        .filter((value) => value > now.getTime());
      const next = Math.min(midnight, ...future);
      clearTimeout(timer);
      timer = setTimeout(refresh, Math.max(1, next - now.getTime() + 1));
    }
    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
        onResume?.();
      }
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [nextChange, onResume]);
  return referenceDate;
}
