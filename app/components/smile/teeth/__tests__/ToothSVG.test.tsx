import { describe, expect, it, jest } from "@jest/globals";
import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
import { FDI_TEETH, type FdiNumber } from "@/components/smile/teeth/fdiTeeth";
import {
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
  type ToothMapStateKey,
} from "@/components/smile/teeth/toothStyle";

jest.mock("react-native-css-interop/jsx-runtime", () =>
  jest.requireActual("react/jsx-runtime"),
);
jest.mock("react-native", () => ({ View: "View" }));
jest.mock("react-native-web/dist/exports/View", () => "View", {
  virtual: true,
});
jest.mock("react-native-svg", () => ({ SvgXml: "SvgXml" }));

const { act, create } = require("react-test-renderer");

describe("ToothSVG stroke transitions", () => {
  it.each(Object.keys(FDI_TEETH) as FdiNumber[])(
    "clears the milk dash on tooth %s without changing its paths",
    async (fdi) => {
      Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
      const tooth = FDI_TEETH[fdi];
      function render(state: ToothMapStateKey) {
        return (
          <ToothSVG
            {...tooth}
            {...TOOTH_STYLE[state]}
            strokeDasharray={isMilkSymbol(state) ? MILK_SYMBOL_DASH : undefined}
          />
        );
      }
      let renderer: ReturnType<typeof create>;
      await act(async () => {
        renderer = create(render("bornMilk"));
      });
      for (const state of [
        "bornMilk",
        "unregistered",
        "fell",
        "eruptionWindow",
        "bornPermanent",
      ] as const) {
        const previous = renderer.root.findByType("SvgXml");
        const previouslyDashed = previous.props.xml.includes(
          `stroke-dasharray="${MILK_SYMBOL_DASH}"`,
        );
        await act(async () => {
          renderer.update(render(state));
        });
        const svg = renderer.root.findByType("SvgXml");
        const paths = svg.props.xml.match(/<path[^>]*\/>/g) as string[];
        expect(paths).toHaveLength(tooth.details.length + 2);
        expect(paths[1]).toContain(`d="${tooth.contour}"`);
        if (isMilkSymbol(state)) {
          expect(paths[0]).toContain(`stroke-dasharray="${MILK_SYMBOL_DASH}"`);
          expect(paths[1]).toContain(`stroke-dasharray="${MILK_SYMBOL_DASH}"`);
        } else {
          for (const path of paths) {
            expect(path).toContain('stroke-dasharray="none"');
          }
          if (previouslyDashed) {
            expect(svg).not.toBe(previous);
          }
        }
        for (const path of paths.slice(2)) {
          expect(path).toContain('stroke-dasharray="none"');
        }
      }
      await act(async () => {
        renderer.unmount();
      });
    },
  );
});
