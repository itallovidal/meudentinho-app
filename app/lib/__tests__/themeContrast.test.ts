import postcss from "postcss";
import { TOOTH_STYLE } from "@/components/smile/teeth/toothStyle";
import { THEME, SKELETON_ANIMATION } from "@/lib/themeColors";
import { ARTICLE_MARKDOWN_STYLES } from "@/lib/markdownStyles";
import { buildHistoryReportHtml } from "@/lib/historyReport";

const colors = THEME.light;
type RGB = [number, number, number];
type ColorName = keyof Omit<typeof colors, "radius">;

function rgb(value: string): RGB {
  if (/^#[a-f\d]{6}$/i.test(value)) {
    return [1, 3, 5].map(
      (offset) => parseInt(value.slice(offset, offset + 2), 16) / 255,
    ) as RGB;
  }
  const match = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(value);
  if (!match) throw new Error(`Unsupported color ${value}`);
  const hue = Number(match[1]) / 360;
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const position = hue * 6;
  const secondary = chroma * (1 - Math.abs((position % 2) - 1));
  const offset = lightness - chroma / 2;
  const channels =
    position < 1
      ? [chroma, secondary, 0]
      : position < 2
        ? [secondary, chroma, 0]
        : position < 3
          ? [0, chroma, secondary]
          : position < 4
            ? [0, secondary, chroma]
            : position < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];
  return channels.map((channel) => channel + offset) as RGB;
}

function compose(foreground: RGB, background: RGB, alpha: number): RGB {
  return foreground.map(
    (channel, index) => channel * alpha + background[index] * (1 - alpha),
  ) as RGB;
}

function contrast(foreground: RGB, background: RGB): number {
  function luminance(channels: RGB) {
    const linear = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  const [darker, lighter] = [luminance(foreground), luminance(background)].sort(
    (a, b) => a - b,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

const surfaces: ColorName[] = [
  "background",
  "base200",
  "primary100",
  "secondary100",
  "secondary200",
  "secondary300",
  "warning100",
  "warning200",
];

it.each(surfaces)("keeps text and placeholders readable on %s", (surface) => {
  for (const foreground of [
    "foreground",
    "mutedForeground",
    "primary",
  ] as const) {
    expect(
      contrast(rgb(colors[foreground]), rgb(colors[surface])),
    ).toBeGreaterThanOrEqual(4.5);
  }
});

it.each(["primary", "secondary", "destructive"] as const)(
  "keeps %s button text readable, including hover",
  (surface) => {
    const foreground = rgb(colors[`${surface}Foreground`]);
    const background = rgb(colors[surface]);
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    const hoverAlpha = surface === "secondary" ? 0.8 : 0.9;
    expect(
      contrast(
        foreground,
        compose(background, rgb(colors.background), hoverAlpha),
      ),
    ).toBeGreaterThanOrEqual(4.5);
  },
);

it.each([
  "background",
  "base200",
  "primary100",
  "secondary100",
  "secondary200",
  "warning100",
  "warning200",
] as const)("keeps error messages readable on %s", (surface) => {
  expect(
    contrast(rgb(colors.destructive), rgb(colors[surface])),
  ).toBeGreaterThanOrEqual(4.5);
});

it.each(["background", "base200", "primary100"] as const)(
  "keeps secondary text readable while pressed on %s",
  (surface) => {
    const background = rgb(colors[surface]);
    expect(
      contrast(
        compose(rgb(colors.mutedForeground), background, 0.9),
        background,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  },
);

it.each(["background", "base200", "primary100", "secondary100"] as const)(
  "keeps skeletons distinguishable at their faintest phase on %s",
  (surface) => {
    const background = rgb(colors[surface]);
    expect(
      contrast(
        compose(
          rgb(colors.skeleton),
          background,
          SKELETON_ANIMATION.minOpacity,
        ),
        background,
      ),
    ).toBeGreaterThanOrEqual(1.5);
  },
);

it("shares the native Markdown palette with the application", () => {
  expect(ARTICLE_MARKDOWN_STYLES.link?.color).toBe(colors.primary);
  expect(ARTICLE_MARKDOWN_STYLES.paragraph?.color).toBe(colors.base800);
  expect(ARTICLE_MARKDOWN_STYLES.inlineCode?.backgroundColor).toBe(
    colors.base200,
  );
});

it("provides the same colors to Tailwind CSS and JavaScript", () => {
  const config = jest.requireActual("../../../tailwind.config.js");
  let variables: Record<string, string> = {};
  config.plugins.at(-1).handler({
    addBase(rules: { ":root": Record<string, string> }) {
      variables = rules[":root"];
    },
  });
  for (const [name, value] of Object.entries(colors)) {
    const variable = `--${name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase()}`;
    expect(variables[variable]).toBe(
      name === "radius" ? value : value.slice(4, -1),
    );
  }
  expect(config.theme.extend.colors.primary.DEFAULT).toBe(
    "hsl(var(--primary))",
  );
  expect(config.theme.extend.colors.secondary.DEFAULT).toBe(
    "hsl(var(--secondary))",
  );
  expect(config.theme.extend.colors.muted.DEFAULT).toBe("hsl(var(--muted))");
});

it("keeps every declared history report text color readable on its print surface", () => {
  const html = buildHistoryReportHtml({
    kidName: "Ana",
    kidBirthDate: "2020-01-01",
    kidGender: "female",
    events: [],
    period: { startDate: "2026-01-01", endDate: "2026-10-27" },
    generatedAt: new Date("2026-10-27T12:00:00Z"),
  });
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  expect(css).toBeDefined();
  const root = postcss.parse(css!);
  let textRules = 0;
  root.walkRules((rule) => {
    let foreground: string | undefined;
    let background = colors.background;
    rule.walkDecls((declaration) => {
      if (declaration.prop === "color") foreground = declaration.value;
      if (
        declaration.prop === "background" ||
        declaration.prop === "background-color"
      )
        background = declaration.value;
    });
    if (foreground) {
      expect(contrast(rgb(foreground), rgb(background))).toBeGreaterThanOrEqual(
        4.5,
      );
      textRules++;
    }
  });
  expect(textRules).toBeGreaterThanOrEqual(8);
});

it.each(Object.entries(TOOTH_STYLE))(
  "keeps the dental legend label readable for %s",
  (_state, style) => {
    expect(
      contrast(rgb(colors.primary800), rgb(style.fill)),
    ).toBeGreaterThanOrEqual(4.5);
  },
);
