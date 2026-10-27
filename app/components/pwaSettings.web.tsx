import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Text } from "@/components/ui/text";
import type { PwaSnapshot } from "@/types/pwa";

const unavailable: PwaSnapshot = {
  canInstall: false,
  installed: false,
  updateAvailable: false,
  isIos: false,
};

function readPwaState() {
  return window.janelinhaPwa?.getSnapshot() ?? unavailable;
}

function subscribeToPwa(notify: () => void) {
  window.addEventListener("janelinha:pwa", notify);
  return () => window.removeEventListener("janelinha:pwa", notify);
}

export function PwaSettings() {
  const state = useSyncExternalStore(
    subscribeToPwa,
    readPwaState,
    () => unavailable,
  );
  const [sheet, setSheet] = useState<"install" | "update" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!window.janelinhaPwa) {
    return null;
  }

  async function install() {
    setError(null);
    if (!state.canInstall) {
      setSheet("install");
      return;
    }
    try {
      await window.janelinhaPwa!.install();
    } catch {
      setError(
        "Não foi possível iniciar a instalação. Tente novamente pelo menu do navegador.",
      );
      setSheet("install");
    }
  }

  function update() {
    setError(null);
    if (!window.janelinhaPwa?.update()) {
      setError(
        "A atualização não está mais disponível. Feche e abra o aplicativo novamente.",
      );
    }
  }

  function closeSheet() {
    setSheet(null);
    setError(null);
  }

  return (
    <>
      <View className="mb-4 w-full gap-3 rounded-xl border border-base-200 bg-base-100 p-4">
        <Text variant="h4" className="text-primary-500">
          {state.installed
            ? "Janelinha instalado"
            : "Janelinha no seu dispositivo"}
        </Text>
        <Text className="text-sm text-base-600">
          {state.installed
            ? "Você já está usando o aplicativo instalado. Consultas e alterações precisam de internet."
            : "Adicione o Janelinha à tela inicial para abrir como aplicativo, com seu próprio ícone."}
        </Text>
        {!state.installed && (
          <Button
            onPress={() => void install()}
            className="h-auto min-h-12 w-full py-3"
          >
            <Text>
              {state.canInstall ? "Instalar Janelinha" : "Como instalar"}
            </Text>
          </Button>
        )}
        {state.updateAvailable && (
          <>
            <Text
              accessibilityLiveRegion="polite"
              className="text-sm text-primary-500"
            >
              Uma nova versão do Janelinha está disponível.
            </Text>
            <Button
              variant="outline"
              onPress={() => setSheet("update")}
              className="h-auto min-h-12 w-full py-3"
            >
              <Text>Atualizar aplicativo</Text>
            </Button>
          </>
        )}
      </View>
      <BottomSheet
        visible={sheet !== null}
        onClose={closeSheet}
        header={
          <Text variant="h4">
            {sheet === "update" ? "Atualizar Janelinha" : "Instalar Janelinha"}
          </Text>
        }
      >
        <Text className="text-base text-base-600">
          {sheet === "update"
            ? "A atualização vai recarregar o aplicativo. Salve suas alterações antes de continuar."
            : state.isIos
              ? "Abra o site no Safari, toque em Compartilhar e selecione Adicionar à Tela de Início. Se aparecer a opção Abrir como App, mantenha-a ativada e toque em Adicionar."
              : "No menu do navegador, escolha Instalar aplicativo ou Adicionar à tela inicial. No computador, você também pode usar o ícone de instalação na barra de endereço. Se a opção não aparecer, tente pelo Chrome ou Edge."}
        </Text>
        {error && (
          <Text accessibilityRole="alert" className="text-destructive">
            {error}
          </Text>
        )}
        {sheet === "update" && (
          <Button onPress={update} className="h-auto min-h-12 w-full py-3">
            <Text>Salvei minhas alterações, atualizar</Text>
          </Button>
        )}
        <Button
          variant="outline"
          onPress={closeSheet}
          className="h-auto min-h-12 w-full py-3"
        >
          <Text>{sheet === "update" ? "Agora não" : "Entendi"}</Text>
        </Button>
      </BottomSheet>
    </>
  );
}
