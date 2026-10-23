import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
import { FDI_TEETH, type FdiNumber } from "@/components/smile/teeth/fdiTeeth";
import { THEME } from "@/lib/theme";
import type { ToothType } from "@/types/teeth";

const TOOTH_TYPE_FDI: Record<ToothType, FdiNumber> = {
  central_incisor: "11",
  lateral_incisor: "12",
  canine: "13",
  first_premolar: "14",
  second_premolar: "15",
  first_molar: "16",
  second_molar: "17",
  third_molar: "18",
};

type ToothTypeSVGProps = {
  toothType: ToothType;
  size?: number;
  fill?: string;
  stroke?: string;
};

export function ToothTypeSVG({
  toothType,
  size = 24,
  fill = THEME.light.base100,
  stroke = THEME.light.primary500,
}: ToothTypeSVGProps) {
  const tooth = FDI_TEETH[TOOTH_TYPE_FDI[toothType]];

  return (
    <ToothSVG
      viewBox={tooth.viewBox}
      contour={tooth.contour}
      details={tooth.details}
      fill={fill}
      stroke={stroke}
      width={size}
      height={size}
    />
  );
}
