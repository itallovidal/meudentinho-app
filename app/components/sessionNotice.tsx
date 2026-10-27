import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";

type SessionNoticeProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function SessionNotice({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: SessionNoticeProps) {
  return (
    <Wrapper
      className="w-full items-center rounded-xl bg-base-100 p-5"
      direction="column"
      align="center"
      justify="center"
      gap="gap-4"
    >
      <Text variant="h4" className="text-center text-primary-500">
        {title}
      </Text>
      <Text className="text-center text-muted-foreground">{message}</Text>
      {actionLabel && onAction && (
        <Button onPress={onAction} className="w-full">
          <Text>{actionLabel}</Text>
        </Button>
      )}
      {secondaryLabel && onSecondary && (
        <Button variant="ghost" onPress={onSecondary} className="w-full">
          <Text>{secondaryLabel}</Text>
        </Button>
      )}
    </Wrapper>
  );
}
