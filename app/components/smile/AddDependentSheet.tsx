import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { ApiError } from "@/types/domain";
import { KidRequestDTO } from "@/types/dtos/user";

const colors = THEME.light;

type AddDependentSheetProps = {
  visible: boolean;
  submitError: ApiError | null;
  onClose: () => void;
  onSubmit: (data: KidRequestDTO) => void | Promise<void>;
};

export function AddDependentSheet({
  visible,
  submitError,
  onClose,
  onSubmit,
}: AddDependentSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          className="absolute inset-0"
        />
        <SafeAreaView
          edges={["bottom"]}
          className="w-full rounded-t-3xl bg-base-100"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 24,
              gap: 20,
            }}
          >
            <View className="h-1 w-12 self-center rounded-full bg-base-300" />

            <View className="flex-row items-start gap-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-base-900">
                  Adicionar Dependente
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                hitSlop={8}
                className="h-8 w-8 items-end justify-start"
              >
                <XIcon size={24} color={colors.base500} weight="bold" />
              </Pressable>
            </View>

            <RegisterKidForm
              onSubmit={onSubmit}
              submitError={submitError}
              submittingLabel="Adicionando..."
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
