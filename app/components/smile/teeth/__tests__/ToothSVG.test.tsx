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

const { act, create } = jest.requireActual<{
  act: typeof import("react").act;
  create: any;
}>("react-test-renderer");

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

describe("ToothSVG oriented half fill", () => {
  it.each(Object.keys(FDI_TEETH) as FdiNumber[])(
    "splits tooth %s at its own viewBox midpoint and restores a solid fill",
    async (fdi) => {
      Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
      const tooth = FDI_TEETH[fdi];
      const side = Number(fdi[0]) >= 3 ? "top" : "bottom";
      let renderer: ReturnType<typeof create>;
      await act(async () => {
        renderer = create(
          <ToothSVG
            {...tooth}
            {...TOOTH_STYLE.bornMilk}
            halfFill={TOOTH_STYLE.eruptionWindow.fill}
            halfFillSide={side}
            strokeDasharray={MILK_SYMBOL_DASH}
          />,
        );
      });
      const xml: string = renderer.root.findByType("SvgXml").props.xml;
      const [x, y, , height] = tooth.viewBox.split(/\s+/).map(Number);
      expect(xml).toContain(
        `gradientUnits="userSpaceOnUse" x1="${x}" y1="${side === "top" ? y + height : y}" x2="${x}" y2="${side === "top" ? y : y + height}"`,
      );
      expect(xml).toContain(
        `<stop offset="50%" stop-color="${TOOTH_STYLE.bornMilk.fill}"/><stop offset="50%" stop-color="${TOOTH_STYLE.eruptionWindow.fill}"/>`,
      );
      expect(xml).toContain(`stroke-dasharray="${MILK_SYMBOL_DASH}"`);
      const paths = xml.match(/<path[^>]*\/>/g)!;
      expect(paths).toHaveLength(tooth.details.length + 2);
      expect(
        paths.every((path) => path.includes('fill="url(#tooth-fill-')),
      ).toBe(true);
      expect(paths[1]).toContain(`d="${tooth.contour}"`);
      await act(async () =>
        renderer.update(<ToothSVG {...tooth} {...TOOTH_STYLE.bornPermanent} />),
      );
      const solid: string = renderer.root.findByType("SvgXml").props.xml;
      expect(solid).not.toContain("linearGradient");
      expect(solid).not.toContain("url(#");
      expect(solid).toContain(`fill="${TOOTH_STYLE.bornPermanent.fill}"`);
      await act(async () => renderer.unmount());
    },
  );

  it("keeps gradient identities independent between teeth", async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(
        <>
          <ToothSVG
            {...FDI_TEETH["11"]}
            {...TOOTH_STYLE.bornMilk}
            halfFill={TOOTH_STYLE.eruptionWindow.fill}
          />
          <ToothSVG
            {...FDI_TEETH["21"]}
            {...TOOTH_STYLE.fell}
            halfFill={TOOTH_STYLE.eruptionWindow.fill}
          />
        </>,
      );
    });
    const ids = renderer.root
      .findAllByType("SvgXml")
      .map(
        (node: { props: { xml: string } }) =>
          node.props.xml.match(/linearGradient id="([^"]+)"/)![1],
      );
    expect(new Set(ids).size).toBe(2);
    await act(async () => renderer.unmount());
  });
});
