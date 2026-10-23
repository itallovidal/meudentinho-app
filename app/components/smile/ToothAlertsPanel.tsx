import { useState } from "react";
import { View } from "react-native";
import { CaretRightIcon, ClockIcon } from "phosphor-react-native";
import { ToothAlertsSheet } from "@/components/smile/ToothAlertsSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { SkeletonText } from "@/skeletons/components/skeletonText";
import { THEME } from "@/lib/theme";
import type { ToothAlertSnooze, ToothMilestone } from "@/lib/toothMilestones";

type ToothAlertsPanelProps = {
  active: ToothMilestone[];
  historical: ToothMilestone[];
  snoozed: ToothMilestone[];
  snoozes: ToothAlertSnooze[];
  ready: boolean;
  stale: boolean;
  loading: boolean;
  errorMessage?: string | null;
  actionError?: string | null;
  busy: boolean;
  onRetry: () => void;
  onRegister: (milestone: ToothMilestone, unknown: boolean) => void;
  onSnooze: (id: string) => void;
};

export function ToothAlertsPanel({
  active,
  historical,
  snoozed,
  snoozes,
  ready,
  stale,
  loading,
  errorMessage,
  actionError,
  busy,
  onRetry,
  onRegister,
  onSnooze,
}: ToothAlertsPanelProps) {
  const [open, setOpen] = useState(false);
  const colors = THEME.light;
  if (!ready) {
    return (
      <View className="w-full gap-3 rounded-2xl bg-base-100 p-5">
        {(loading || errorMessage) && (
          <>
            <SkeletonText />
            <SkeletonText />
          </>
        )}
        {errorMessage && (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        )}
      </View>
    );
  }
  return (
    <>
      <View className="w-full gap-4 rounded-3xl border border-primary-100 bg-base-100 p-6">
        <Text variant="h4" className="text-xl font-bold text-primary-800">
          {active.length
            ? "Vamos revisar os dentinhos?"
            : "Revisão dos registros"}
        </Text>
        <Text className="text-base-600">
          {active.length
            ? `${active.length} ${active.length === 1 ? "registro pendente" : "registros pendentes"} após o limite estimado pelo app.`
            : "Nenhuma pendência atual após os limites estimados avaliados."}
        </Text>
        <View className="h-px w-full bg-base-200" />
        <View className="flex-row flex-wrap items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <ClockIcon size={15} color={colors.primary400} />
            <Text className="text-sm text-primary-400">
              {snoozed.length} adiados
            </Text>
          </View>
          <View className="h-1 w-1 rounded-full bg-primary-200" />
          <Badge
            variant="outline"
            className="rounded-lg border-warning-200 bg-warning-100 px-2.5 py-1"
          >
            <Text className="text-xs font-semibold text-warning-600">
              {historical.length} no histórico incompleto
            </Text>
          </Badge>
        </View>
        {stale && (
          <QueryWarningBanner
            message="Os dados estão desatualizados. Atualize antes de revisar os avisos."
            onRetry={onRetry}
          />
        )}
        <Button
          variant="outline"
          onPress={() => setOpen(true)}
          className="h-14 w-full justify-between rounded-2xl border-primary-100 bg-base-100 px-5"
        >
          <Text className="font-semibold text-primary-800">
            Ver registros para revisar
          </Text>
          <CaretRightIcon size={18} color={colors.secondary800} weight="bold" />
        </Button>
      </View>
      <ToothAlertsSheet
        visible={open}
        active={active}
        historical={historical}
        snoozed={snoozed}
        snoozes={snoozes}
        stale={stale}
        actionError={actionError}
        busy={busy}
        onClose={() => setOpen(false)}
        onRetry={onRetry}
        onRegister={onRegister}
        onSnooze={onSnooze}
      />
    </>
  );
}
