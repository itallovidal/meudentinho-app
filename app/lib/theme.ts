import { DefaultTheme, type Theme } from "@react-navigation/native";
import { THEME } from "./themeColors";

export { THEME };

export const NAV_THEME: Record<"light", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
};
