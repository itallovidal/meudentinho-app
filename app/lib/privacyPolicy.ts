import { Linking } from "react-native";
import * as Crypto from "expo-crypto";
import { ENV } from "@/lib/env";
import type { KidFormValues } from "@/lib/schemas/kid";
import type { KidRequestDTO } from "@/types/dtos/user";

export const PRIVACY_POLICY_VERSION = "1.0";

export async function openPrivacyPolicy(): Promise<boolean> {
  const url = ENV.PRIVACY_POLICY_URL;
  if (!url.startsWith("https:")) {
    return false;
  }
  try {
    const supported = await Linking.canOpenURL(url);
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
