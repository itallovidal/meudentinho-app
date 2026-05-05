import { forwardRef } from "react";
import { View, ViewProps } from "react-native";

const directionClassNames = {
  row: "flex-row",
  column: "flex-col",
} as const;

const alignClassNames = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;

const justifyClassNames = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

interface Args extends ViewProps {
  children: React.ReactNode;
  className?: View["props"]["className"];
  direction?: "row" | "column";
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between";
  gap?: `gap-${number}`;
  style?: View["props"]["style"];
}

export const Wrapper = forwardRef<View, Args>(function Wrapper(
  {
    children,
    className = "",
    direction = "row",
    align = "start",
    justify = "start",
    gap = "gap-2",
    style,
    ...rest
  },
  ref,
) {
  return (
    <View
      ref={ref}
      className={`flex ${directionClassNames[direction]} ${alignClassNames[align]} ${justifyClassNames[justify]} ${gap} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
});
