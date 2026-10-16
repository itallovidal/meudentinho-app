import { Linking } from "react-native";
import { ENV } from "@/lib/env";
import { randomUuid } from "@/lib/utils";
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

export function buildKidRequest(data: KidFormValues): KidRequestDTO {
  const { accepted, ...kid } = data;
  return {
    ...kid,
    acceptedPolicyVersion: PRIVACY_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
    requestId: randomUuid(),
  };
}
