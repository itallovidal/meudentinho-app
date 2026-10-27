import tokens from "./themeTokens.json";

type PaletteKey = keyof typeof tokens.palette;
type SemanticKey = keyof typeof tokens.semantic;
type ThemeColorKey = PaletteKey | SemanticKey;
type ThemeColors = Record<ThemeColorKey, string> & { radius: string };

function createLightTheme(): ThemeColors {
  const colors = Object.fromEntries(
    Object.entries(tokens.palette).map(([name, value]) => [
      name,
      `hsl(${value})`,
    ]),
  ) as Record<ThemeColorKey, string>;

  for (const [name, reference] of Object.entries(tokens.semantic)) {
    colors[name as SemanticKey] = colors[reference as PaletteKey];
  }
  return { ...colors, radius: tokens.radius };
}

export const THEME = { light: createLightTheme() };
export const SKELETON_ANIMATION = tokens.skeletonAnimation;
