import type { KidResponseDTO } from "@/types/dtos/user";

export type KidsChangedType = "created" | "updated" | "deleted";

export type KidsChangedEvent = {
  type: KidsChangedType;
  kidId?: string;
  kid?: KidResponseDTO | null;
};

export type KidsChangedListener = (event: KidsChangedEvent) => void;

function createKidsSubject() {
  const listeners = new Set<KidsChangedListener>();

  function subscribe(listener: KidsChangedListener) {
    listeners.add(listener);
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function notify(event: KidsChangedEvent) {
    Array.from(listeners).forEach((listener) => listener(event));
  }

  function listenerCount() {
    return listeners.size;
  }

  return { subscribe, notify, listenerCount };
}

export const kidsSubject = createKidsSubject();

export function subscribeKidsChanged(listener: KidsChangedListener) {
  return kidsSubject.subscribe(listener);
}

export function notifyKidsChanged(event: KidsChangedEvent) {
  kidsSubject.notify(event);
}
