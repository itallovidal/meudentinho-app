import { TouchableNativeFeedback } from "react-native";
import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("w-full bg-base-100 rounded-lg p-4 border shadow-sm", {
  variants: {
    variant: {
      default: "border-base-200",
      destructive: "border-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

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

type CardProps = VariantProps<typeof cardVariants> & {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive";
  handlePress?: () => void;
};

export function Card({
  icon,
  title,
  children,
  className = "",
  variant,
  handlePress,
}: CardProps) {
  return (
    <TouchableNativeFeedback onPress={handlePress}>
      <Wrapper
        className={cn(cardVariants({ variant }), className)}
        direction="row"
        gap={"gap-4"}
      >
        <Wrapper
          className={iconVariants({ variant })}
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
          <Text variant={"h4"} className={textVariants({ variant })}>{title}</Text>
          <Text>{children}</Text>
        </Wrapper>
      </Wrapper>
    </TouchableNativeFeedback>
  );
}
