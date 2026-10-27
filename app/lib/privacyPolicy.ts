import { Linking, Platform } from "react-native";
import * as Crypto from "expo-crypto";
import { ENV } from "@/lib/env";
import type { KidFormValues } from "@/lib/schemas/kid";
import type { KidRequestDTO } from "@/types/dtos/user";

export const PRIVACY_POLICY_VERSION = "1.0";

export function getPrivacyPolicyUrl(): string {
  if (Platform.OS === "web" && typeof globalThis.window !== "undefined") {
    return new URL("/politica-de-privacidade", window.location.origin).href;
  }
  return ENV.PRIVACY_POLICY_URL;
}

export async function openPrivacyPolicy(): Promise<boolean> {
  try {
    const url = getPrivacyPolicyUrl();
    if (Platform.OS !== "web" && !url.startsWith("https:")) {
      return false;
    }
    const supported = Platform.OS === "web" || (await Linking.canOpenURL(url));
    if (!supported) {
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function buildKidRequest(
  data: KidFormValues,
): Promise<KidRequestDTO> {
  const { accepted, isPremature, prematureWeeks, ...kid } = data;
  return {
    ...kid,
    prematureWeeks: isPremature ? prematureWeeks : "0",
    acceptedPolicyVersion: PRIVACY_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
    requestId: Crypto.randomUUID(),
  };
}
