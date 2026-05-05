import { View } from "react-native";

export function Wrapper({
  children,
  className = "",
  direction = "row",
  align = "start",
  justify = "start",
  gap = "gap-2",
  style,
}: {
  children: React.ReactNode;
  className?: View["props"]["className"];
  direction?: "row" | "column";
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between";
  gap?: `gap-${number}`;
  style?: View["props"]["style"];
}) {
  return (
    <View
      className={`flex ${direction === "row" ? "flex-row" : "flex-col"} items-${align} justify-${justify} ${gap} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
