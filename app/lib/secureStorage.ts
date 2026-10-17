import * as SecureStore from "expo-secure-store";
import { ENV } from "@/lib/env";

function secureKey(key: string): string {
  return `${ENV.LOCAL_STORAGE_KEY_PREFIX}_${key}`;
}

export async function setSecureItem(
  key: string,
  value: string,
): Promise<void> {
  await SecureStore.setItemAsync(secureKey(key), value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(secureKey(key));
}

export async function removeSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(secureKey(key));
}
