import { Platform } from "react-native";

export const usesCookieSession = Platform?.OS === "web";

export function authRequestOptions(): RequestInit {
  return usesCookieSession
    ? {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Transport": "cookie",
        },
      }
    : { headers: { "Content-Type": "application/json" } };
}
