import { useState } from "react";
import { View } from "react-native";
import {
  CaretRightIcon,
  ClockCountdownIcon,
  ClockCounterClockwiseIcon,
  InfoIcon,
  TimerIcon,
} from "phosphor-react-native";
import { ToothAlertsSheet } from "@/components/smile/ToothAlertsSheet";
import { Card } from "@/components/card";
import { NoticeCard } from "@/components/noticeCard";
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
  busy: boolean;
  onRetry: () => void;
  onRegister: (milestone: ToothMilestone) => void;
};

type AlertCategory = "active" | "snoozed" | "historical";

export function ToothAlertsPanel({
  active,
  historical,
  snoozed,
  snoozes,
  ready,
  stale,
  loading,
  errorMessage,
  busy,
  onRetry,
  onRegister,
}: ToothAlertsPanelProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<AlertCategory | null>(null);
  const colors = THEME.light;
  const categories = [
    {
      key: "active" as const,
      title: "Registros para revisar",
      icon: <ClockCountdownIcon size={18} color={colors.primary400} weight="regular" />,
      description: "Registros pendentes após o limite estimado pelo app.",
      items: active,
      emptyTitle: "Tudo em dia por aqui!",
      emptyDescription: "Nenhum registro pendente para conferência nesta fase.",
    },
    {
      key: "snoozed" as const,
      title: "Avisos adiados",
      icon: <TimerIcon size={18} color={colors.primary400} weight="regular" />,
      description: "Lembretes que você adiou para revisar depois.",
      items: snoozed,
      emptyTitle: "Nenhum aviso adiado",
      emptyDescription: "Nenhum aviso postergado no momento.",
    },
    {
      key: "historical" as const,
      title: "Histórico incompleto",
      icon: <ClockCounterClockwiseIcon size={18} color={colors.primary400} weight="regular" />,
      description:
        "Marcos anteriores ao acompanhamento ou à fase atual da dentição. Não indicam ausência de dentes.",
      items: historical,
      emptyTitle: "Histórico em dia",
      emptyDescription:
        "Nenhum marco anterior sem registro nas referências avaliadas.",
    },
  ];
  const selected = categories.find(
    (category) => category.key === selectedCategory,
  );

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
          Revisar registros
        </Text>
        <NoticeCard
          title="Orientações de rotina"
          description="Se o dente já nasceu, confirme o registro. Caso o dente ainda não tenha apontado após o limite estimado, converse com o seu odontopediatra com calma."
          icon={
            <InfoIcon size={17} color={colors.secondary800} weight="bold" />
          }
          className="rounded-2xl border-secondary-200 bg-secondary-100"
        />
        {stale && (
          <QueryWarningBanner
            message="Os dados estão desatualizados. Atualize antes de revisar os avisos."
            onRetry={onRetry}
          />
        )}
        <View className="gap-3">
          {categories.map((category) => (
            <Card
              key={category.key}
              title={category.title}
              titleIcon={category.icon}
              titleClassName="text-sm font-semibold leading-5 text-primary-800"
              className="gap-3 rounded-2xl border-base-200 shadow-none"
              handlePress={() => setSelectedCategory(category.key)}
              accessibilityLabel={`${category.title}: ${category.items.length}`}
              trailing={
                <View className="shrink-0 flex-row items-center gap-1">
                  <Text className="text-sm font-semibold text-primary">
                    {category.items.length}
                  </Text>
                  <CaretRightIcon
                    size={16}
                    color={colors.primary400}
                    weight="bold"
                  />
                </View>
              }
            >
              <Text className="text-xs leading-5 text-primary">
                {category.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>
      {selected && (
        <ToothAlertsSheet
          visible
          title={selected.title}
          description={selected.description}
          items={selected.items}
          emptyTitle={selected.emptyTitle}
          emptyDescription={selected.emptyDescription}
          snoozes={snoozes}
          stale={stale}
          busy={busy}
          onClose={() => setSelectedCategory(null)}
          onRetry={onRetry}
          onRegister={onRegister}
        />
      )}
    </>
  );
}
