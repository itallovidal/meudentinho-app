import { THEME } from "@/lib/themeColors";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Platform, TextInput } from "react-native";

const Textarea = forwardRef<
  React.ComponentRef<typeof TextInput>,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(function Textarea(
  {
    className,
    multiline = true,
    numberOfLines = Platform.select({ web: 2, native: 8 }),
    placeholderTextColor = THEME.light.mutedForeground,
    ...props
  },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "flex  min-h-16 w-full flex-row rounded-md bg-transparent  px-3 py-2 text-base text-foreground shadow-sm shadow-black/5 md:text-sm",
        Platform.select({
          web: "resize-y outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20 dark:aria-[invalid=true]:ring-destructive/40",
        }),
        props.editable === false && "opacity-50",
        className,
      )}
      placeholderTextColor={placeholderTextColor}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
});

export { Textarea };
