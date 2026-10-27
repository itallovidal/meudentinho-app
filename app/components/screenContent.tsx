import type { ComponentProps } from "react";
import { Wrapper } from "@/components/wrapper";
import { cn } from "@/lib/utils";

type ScreenContentProps = ComponentProps<typeof Wrapper>;

export function ScreenContent({
  className,
  direction = "column",
  ...props
}: ScreenContentProps) {
  return (
    <Wrapper
      direction={direction}
      className={cn(
        "w-full max-w-5xl self-center px-6 md:px-12 lg:px-16",
        className,
      )}
      {...props}
    />
  );
}
