import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Illustration } from "@/components/illustration";
import { Pressable } from "react-native";

type SessionCardProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  layout?: "horizontal" | "stacked";
};

export function SessionCard({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  layout = "horizontal",
}: SessionCardProps) {
  const illustration = (
    <Illustration
      source={require("../../assets/tooth.png")}
      width={128}
      height={128}
      accessibilityLabel="Dente segurando uma escova de dentes"
    />
  );

  return (
    <Wrapper
      className="w-full rounded-2xl bg-base-100 p-5 shadow-sm shadow-base-300"
      direction="column"
      justify="start"
      gap="gap-4"
    >
      {layout === "stacked" ? (
        <Wrapper
          className="w-full"
          direction="column"
          align="center"
          justify="center"
          gap="gap-3"
        >
          <Text variant="h4" className="text-center text-primary-800">
            {title}
          </Text>
          {illustration}
          <Text className="text-center text-base-500">{message}</Text>
        </Wrapper>
      ) : (
        <Wrapper
          className="w-full"
          direction="row"
          align="center"
          justify="between"
          gap="gap-3"
        >
          <Wrapper className="flex-1" direction="column" gap="gap-1">
            <Text variant="h4" className="text-primary-800">
              {title}
            </Text>
            <Text className="text-base-500">{message}</Text>
          </Wrapper>
          {illustration}
        </Wrapper>
      )}
      <Button
        className="h-12 w-full rounded-xl bg-primary-800"
        onPress={onAction}
      >
        <Text className="text-base font-bold text-base-100">{actionLabel}</Text>
      </Button>
      {secondaryLabel && onSecondary && (
        <Pressable
          className="self-center"
          onPress={onSecondary}
          hitSlop={8}
          accessibilityRole="link"
        >
          <Text className="text-center text-base font-semibold text-primary-800 underline">
            {secondaryLabel}
          </Text>
        </Pressable>
      )}
    </Wrapper>
  );
}
