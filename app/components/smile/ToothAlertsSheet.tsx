import { useRef, useState } from "react";
import { View } from "react-native";
import { CheckIcon, ClockIcon, InfoIcon } from "phosphor-react-native";
import { NoticeCard } from "@/components/noticeCard";
import { SectionHeader } from "@/components/sectionHeader";
import { DisclosureCard } from "@/components/disclosureCard";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { ToothAlertItem } from "@/components/smile/ToothAlertItem";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import type { ToothAlertSnooze, ToothMilestone } from "@/lib/toothMilestones";

type ToothAlertsSheetProps = {
  visible: boolean;
  active: ToothMilestone[];
  historical: ToothMilestone[];
  snoozed: ToothMilestone[];
  snoozes: ToothAlertSnooze[];
  stale: boolean;
  actionError?: string | null;
  busy: boolean;
  onClose: () => void;
  onRetry: () => void;
  onRegister: (milestone: ToothMilestone, unknown: boolean) => void;
  onSnooze: (id: string) => void;
};

export function ToothAlertsSheet({
  visible,
  active,
  historical,
  snoozed,
  snoozes,
  stale,
  actionError,
  busy,
  onClose,
  onRetry,
  onRegister,
  onSnooze,
}: ToothAlertsSheetProps) {
  const colors = THEME.light;
  const [showHistorical, setShowHistorical] = useState(false);
  const pendingRegistration = useRef<{
    milestone: ToothMilestone;
    unknown: boolean;
  } | null>(null);
  function close() {
    onClose();
    const next = pendingRegistration.current;
    pendingRegistration.current = null;
    if (next) onRegister(next.milestone, next.unknown);
  }
  function renderItem(
    milestone: ToothMilestone,
    dismiss: () => void,
    allowSnooze = false,
  ) {
    return (
      <ToothAlertItem
        key={milestone.id}
        milestone={milestone}
        snoozedUntil={
          snoozes.find((item) => item.id === milestone.id)?.snoozedUntil
        }
        disabled={busy || stale}
        busy={busy}
        onRegister={(unknown) => {
          pendingRegistration.current = { milestone, unknown };
          dismiss();
        }}
        onSnooze={allowSnooze ? () => onSnooze(milestone.id) : undefined}
      />
    );
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
            Revisar registros
          </Text>
          <Text className="text-xs leading-[18px] text-primary-400">
            Acompanhamento da dentição infantil
          </Text>
        </View>
      }
    >
      {(dismiss) => (
        <View className="gap-5">
          <NoticeCard
            title="Orientações de rotina"
            description="Se o dente já nasceu, confirme o registro. Caso o dente ainda não tenha apontado após o limite estimado, converse com o seu odontopediatra com calma."
            icon={<InfoIcon size={17} color={colors.secondary800} weight="bold" />}
            className="rounded-2xl border-secondary-200 bg-secondary-100"
          />
          {actionError && (
            <View
              accessibilityRole="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/5 p-3"
            >
              <Text className="text-xs leading-5 text-destructive">
                {actionError}
              </Text>
            </View>
          )}
          {stale && (
            <QueryWarningBanner
              message="Atualize os dados antes de registrar ou adiar."
              onRetry={onRetry}
            />
          )}
          <View className="gap-2.5">
            <SectionHeader
              title="Registros para revisar"
              trailing={
                <Text className="text-[11px] text-secondary-900">
                  {active.length}{" "}
                  {active.length === 1 ? "pendência" : "pendências"}
                </Text>
              }
            />
            {active.length ? (
              active.map((item) => renderItem(item, dismiss, true))
            ) : (
              <NoticeCard
                title="Tudo em dia por aqui!"
                description="Nenhum registro pendente para conferência nesta fase."
                icon={
                  <CheckIcon
                    size={17}
                    color={colors.secondary800}
                    weight="bold"
                  />
                }
              />
            )}
          </View>
          <View className="gap-2.5">
            <SectionHeader
              title="Avisos adiados"
              trailing={
                <Text className="text-[11px] text-secondary-900">
                  {snoozed.length}{" "}
                  {snoozed.length === 1 ? "lembrete" : "lembretes"}
                </Text>
              }
            />
            {snoozed.length ? (
              snoozed.map((item) => renderItem(item, dismiss))
            ) : (
              <NoticeCard
                dashed
                description="Nenhum aviso postergado no momento."
                icon={<ClockIcon size={15} color={colors.primary400} />}
              />
            )}
          </View>
          <DisclosureCard
            title="Histórico incompleto"
            description="Marcos anteriores ao acompanhamento ou à fase atual da dentição. Não entram no aviso principal e não indicam ausência de dentes."
            badge={
              <Badge
                variant="outline"
                className="rounded-md border-warning-200 bg-warning-100 px-2 py-0.5"
              >
                <Text className="text-[10px] font-semibold leading-[14px] text-warning-600">
                  {historical.length}{" "}
                  {historical.length === 1 ? "pendência" : "pendências"}
                </Text>
              </Badge>
            }
            expanded={showHistorical}
            expandLabel={`Ver histórico incompleto (${historical.length})`}
            collapseLabel="Recolher histórico"
            onToggle={() => setShowHistorical(!showHistorical)}
          >
            {historical.length ? (
              historical.map((item) => renderItem(item, dismiss))
            ) : (
              <Text className="text-xs leading-5 text-primary-400">
                Nenhum marco anterior sem registro nas referências avaliadas.
              </Text>
            )}
          </DisclosureCard>
        </View>
      )}
    </BottomSheet>
  );
}
