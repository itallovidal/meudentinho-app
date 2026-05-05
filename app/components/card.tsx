import { View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";

export function Card({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: string;
  className?: string;
}) {
  return (
    <Wrapper
      className={`w-full bg-base-100 rounded-lg p-4 border border-base-200 shadow-sm
        ${className}`}
      direction="row"
      gap={"gap-2"}
    >
      <View className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg ">
        {icon}
      </View>
      <Wrapper direction="column" align="start" gap={"gap-2"}>
        <Text variant={"h3"}>{title}</Text>
        <Text>{children}</Text>
      </Wrapper>
    </Wrapper>
  );
}
