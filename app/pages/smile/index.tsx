import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import DentalMap from "@/components/smile/DentalMap";
import { TouchableOpacity } from "react-native";
import ToothSVG from "@/components/smile/teeth/ToothSVG";
import { TOOTH_PATHS } from "@/components/smile/teeth/paths";

export function Smile() {
  // const path = TOOTH_PATHS["upper_central_incisor"]; // Example tooth path, you can loop through or select based on user interaction

  // console.log("Selected tooth path:", path);

  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />

      {/* <TouchableOpacity
        className="mt-4"
        onPress={() => console.log("Tooth pressed")}
      >
        <ToothSVG
          viewBox={path.viewBox}
          content={path.content}
          width={48}
          height={48}
          // stroke={"black"}
          flipHorizontal={false}
        />
      </TouchableOpacity> */}
      <DentalMap />
    </Wrapper>
  );
}
