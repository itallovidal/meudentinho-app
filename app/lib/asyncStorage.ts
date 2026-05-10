import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "./env";

export async function setLocalStorageItem(
  key: string,
  value: string,
): Promise<void> {
  await AsyncStorage.setItem(`${ENV.LOCAL_STORAGE_KEY_PREFIX}_${key}`, value);
}

export async function getLocalStorageItem(key: string): Promise<string | null> {
  return await AsyncStorage.getItem(`${ENV.LOCAL_STORAGE_KEY_PREFIX}_${key}`);
}

export async function removeLocalStorageItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${ENV.LOCAL_STORAGE_KEY_PREFIX}_${key}`);
}

export async function clearAllLocalStorage(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const filteredKeys = keys.filter((key) =>
    key.startsWith(`${ENV.LOCAL_STORAGE_KEY_PREFIX}_`),
  );
  await AsyncStorage.multiRemove(filteredKeys);
}
