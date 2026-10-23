import { useRef } from "react";
import { View } from "react-native";
import { CheckIcon } from "phosphor-react-native";
import { NoticeCard } from "@/components/noticeCard";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { ToothAlertItem } from "@/components/smile/ToothAlertItem";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import type { ToothAlertSnooze, ToothMilestone } from "@/lib/toothMilestones";

type ToothAlertsSheetProps = {
  visible: boolean;
  title: string;
  description: string;
  items: ToothMilestone[];
  emptyTitle: string;
  emptyDescription: string;
  snoozes: ToothAlertSnooze[];
  stale: boolean;
  busy: boolean;
  onClose: () => void;
  onRetry: () => void;
  onRegister: (milestone: ToothMilestone) => void;
};

export function ToothAlertsSheet({
  visible,
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  snoozes,
  stale,
  busy,
  onClose,
  onRetry,
  onRegister,
}: ToothAlertsSheetProps) {
  const pendingRegistration = useRef<ToothMilestone | null>(null);

  function close() {
    onClose();
    const next = pendingRegistration.current;
    pendingRegistration.current = null;
    if (next) onRegister(next);
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      header={
        <View className="gap-0.5">
          <Text
            variant="h4"
            className="text-xl font-semibold leading-7 text-primary-800"
          >
            {title}
          </Text>
          <Text className="text-xs leading-[18px] text-primary-400">
            {items.length} {items.length === 1 ? "registro" : "registros"}
          </Text>
        </View>
      }
    >
      {(dismiss) => (
        <View className="gap-4">
          <Text className="text-xs leading-5 text-primary-400">
            {description}
          </Text>
          {stale && (
            <QueryWarningBanner
              message="Atualize os dados antes de registrar ou adiar."
              onRetry={onRetry}
            />
          )}
          {items.length ? (
            items.map((milestone) => (
              <ToothAlertItem
                key={milestone.id}
                milestone={milestone}
                snoozedUntil={
                  snoozes.find((item) => item.id === milestone.id)?.snoozedUntil
                }
                disabled={busy || stale}
                onPress={() => {
                  pendingRegistration.current = milestone;
                  dismiss();
                }}
              />
            ))
          ) : (
            <NoticeCard
              title={emptyTitle}
              description={emptyDescription}
              icon={
                <CheckIcon
                  size={17}
                  color={THEME.light.secondary800}
                  weight="bold"
                />
              }
            />
          )}
        </View>
      )}
    </BottomSheet>
  );
}
