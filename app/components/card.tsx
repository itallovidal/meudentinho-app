import { TouchableOpacity, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { Link, useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";

export function Card({
  icon,
  title,
  children,
  className = "",
  handlePress,
}: {
  icon: React.ReactNode;
  title: string;
  children: string;
  className?: string;
  handlePress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Wrapper
      className={`w-full bg-base-100 rounded-lg p-4 border border-base-200 shadow-sm
        ${className}`}
      direction="row"
      gap={"gap-4"}
    >
      <Wrapper
        className="bg-primary-100 rounded-lg p-2"
        align="center"
        justify="center"
      >
        {icon}
      </Wrapper>
      <Wrapper
        className="flex-1"
        direction="column"
        align="start"
        gap={"gap-2"}
      >
        <Text variant={"h4"}>{title}</Text>
        <Text>{children}</Text>
      </Wrapper>
    </Wrapper>
    </TouchableOpacity>
  );
}
