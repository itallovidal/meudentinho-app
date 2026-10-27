import { cn } from "@/lib/utils";
import { Platform, TextInput } from "react-native";
import { forwardRef } from "react";

const Input = forwardRef<
  React.ComponentRef<typeof TextInput>,
  React.ComponentProps<typeof TextInput>
>(function Input({ className, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "flex h-14 w-full min-w-0 flex-row items-center rounded-md border border-base-200 bg-base-200 px-3 py-2 text-base leading-5 text-base-900 shadow-sm shadow-black/5 dark:bg-input/30",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            }),
          ),
        Platform.select({
          web: cn(
            "outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20 dark:aria-[invalid=true]:ring-destructive/40",
          ),
          native: "placeholder:text-muted-foreground",
        }),
        className,
      )}
      {...props}
    />
  );
});

export { Input };
