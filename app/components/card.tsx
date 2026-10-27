import { Pressable, View } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "w-full bg-base-100 rounded-lg border p-4 shadow-sm shadow-base-300 flex flex-row items-center gap-4",
  {
    variants: {
      variant: {
        default: "border-base-200",
        destructive: "border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-base-800",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconVariants = cva("rounded-lg p-2", {
  variants: {
    variant: {
      default: "bg-primary-100",
      destructive: "bg-red-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CardProps = VariantProps<typeof cardVariants> &
  React.ComponentPropsWithoutRef<typeof View> & {
    icon?: React.ReactNode;
    title: string;
    titleIcon?: React.ReactNode;
    titleClassName?: string;
    trailing?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive";
    handlePress?: () => void;
    isDisabled?: boolean;
  };

export function Card({
  icon,
  title,
  titleIcon,
  titleClassName,
  trailing,
  children,
  className = "",
  variant = "default",
  handlePress,
  isDisabled = false,
  ...rest
}: CardProps) {
  const hasLowOpacity = isDisabled ? "opacity-50" : "";
  const onPress = isDisabled ? undefined : handlePress;

  const classes = cn(cardVariants({ variant }), className, hasLowOpacity);

  const content = (
    <>
      {icon && (
        <Wrapper
          className={iconVariants({ variant })}
          align="center"
          justify="center"
        >
          {icon}
        </Wrapper>
      )}
      <Wrapper
        className="flex-1"
        direction="column"
        align="start"
        gap={"gap-2"}
      >
        <View className="w-full flex-row items-center gap-2">
          {titleIcon && (
            <View
              className="shrink-0"
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {titleIcon}
            </View>
          )}
          <Text
            variant={"h4"}
            className={cn(textVariants({ variant }), "shrink", titleClassName)}
          >
            {title}
          </Text>
        </View>
        <Text>{children}</Text>
      </Wrapper>
      {trailing}
    </>
  );

  if (!onPress) {
    return (
      <View className={classes} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={classes}
      {...rest}
    >
      {content}
    </Pressable>
  );
}
