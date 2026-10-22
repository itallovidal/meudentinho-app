import * as SecureStore from "expo-secure-store";
import { ENV } from "@/lib/env";

function secureKey(key: string): string {
  const raw = legacySecureKey(key);
  const encoded = raw
    .split("")
    .map((character) => character.charCodeAt(0).toString(16).padStart(4, "0"))
    .join("");
  return `secure_v1_${encoded}`;
}

function legacySecureKey(key: string): string {
  return `${ENV.LOCAL_STORAGE_KEY_PREFIX}_${key}`;
}

function isValidSecureKey(key: string): boolean {
  return /^[\w.-]+$/.test(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(secureKey(key), value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  const legacy = legacySecureKey(key);
  if (isValidSecureKey(legacy)) {
    await SecureStore.deleteItemAsync(legacy);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(secureKey(key));
  if (stored !== null) {
    return stored;
  }
  const legacy = legacySecureKey(key);
  if (!isValidSecureKey(legacy)) {
    return null;
  }
  const previous = await SecureStore.getItemAsync(legacy);
  if (previous !== null) {
    await setSecureItem(key, previous);
  }
  return previous;
}

export async function removeSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(secureKey(key));
  const legacy = legacySecureKey(key);
  if (isValidSecureKey(legacy)) {
    await SecureStore.deleteItemAsync(legacy);
  }
}
