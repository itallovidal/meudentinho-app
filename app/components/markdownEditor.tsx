import { useRef, useState, type ComponentRef } from "react";
import { View, type TextInputSelectionChangeEvent } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import {
  applyMarkdownAction,
  type MarkdownAction,
  type MarkdownSelection,
} from "@/lib/markdownEditing";

const FORMATTING_ACTIONS: {
  action: MarkdownAction;
  label: string;
  accessibilityLabel: string;
  textClassName?: string;
}[] = [
  {
    action: "bold",
    label: "B",
    accessibilityLabel: "Negrito",
    textClassName: "font-bold",
  },
  {
    action: "italic",
    label: "I",
    accessibilityLabel: "Itálico",
    textClassName: "italic",
  },
  {
    action: "strikethrough",
    label: "S",
    accessibilityLabel: "Texto tachado",
    textClassName: "line-through",
  },
  {
    action: "heading1",
    label: "H1",
    accessibilityLabel: "Título principal (H1)",
  },
  { action: "heading", label: "H2", accessibilityLabel: "Subtítulo" },
  {
    action: "heading3",
    label: "H3",
    accessibilityLabel: "Título de seção (H3)",
  },
  {
    action: "bulletList",
    label: "• Lista",
    accessibilityLabel: "Lista com marcadores",
  },
  {
    action: "orderedList",
    label: "1. Lista",
    accessibilityLabel: "Lista numerada",
  },
  { action: "quote", label: "❞", accessibilityLabel: "Citação" },
  { action: "link", label: "Link", accessibilityLabel: "Inserir link" },
];

type MarkdownEditorProps = {
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  label?: string;
  errorMessage?: string;
};

export function MarkdownEditor({
  value,
  onChangeText,
  onBlur,
  editable = true,
  label = "Texto",
  errorMessage,
}: MarkdownEditorProps) {
  const inputRef = useRef<ComponentRef<typeof Textarea>>(null);
  const selectionRef = useRef<MarkdownSelection>({
    start: value.length,
    end: value.length,
  });
  const [selection, setSelection] = useState<MarkdownSelection | undefined>();

  function format(action: MarkdownAction) {
    if (!editable) return;
    const edit = applyMarkdownAction(value, selectionRef.current, action);
    selectionRef.current = edit.selection;
    onChangeText(edit.text);
    setSelection(edit.selection);
    inputRef.current?.focus();
  }

  function handleSelectionChange(event: TextInputSelectionChangeEvent) {
    selectionRef.current = event.nativeEvent.selection;
    setSelection(undefined);
  }

  function handleChangeText(text: string) {
    setSelection(undefined);
    onChangeText(text);
  }

  return (
    <View className="w-full gap-3">
      <Text className="font-bold text-primary-800">{label}</Text>
      <Text className="text-xs leading-5 text-base-500">
        Selecione um trecho e toque em uma opção para formatar. Sem seleção, a
        formatação será inserida no cursor.
      </Text>
      <View className="w-full overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <View
          accessibilityRole="toolbar"
          className="w-full flex-row flex-wrap gap-1 border-b border-base-300 p-2"
        >
          {FORMATTING_ACTIONS.map((item) => (
            <Button
              key={item.action}
              variant="ghost"
              disabled={!editable}
              onPress={() => format(item.action)}
              accessibilityLabel={item.accessibilityLabel}
              accessibilityHint="Aplica a formatação ao texto selecionado ou à posição do cursor"
              className="h-11 min-w-11 rounded-lg px-3"
            >
              <Text
                className={`text-sm text-primary-800 ${item.textClassName ?? "font-semibold"}`}
              >
                {item.label}
              </Text>
            </Button>
          ))}
        </View>
        <Textarea
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          selection={selection}
          onSelectionChange={handleSelectionChange}
          editable={editable}
          accessibilityLabel={label}
          aria-invalid={!!errorMessage}
          placeholder="Escreva o conteúdo que deseja compartilhar..."
          autoCapitalize="sentences"
          autoCorrect
          className="min-h-[240px] rounded-none bg-base-200 px-4 py-3"
        />
      </View>
      {errorMessage && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="text-xs text-destructive"
        >
          {errorMessage}
        </Text>
      )}
      <Text className="text-xs leading-5 text-base-500">
        Use “Visualizar prévia” ao final do formulário para conferir o texto
        formatado. Ao inserir um link, substitua o endereço selecionado pelo
        destino desejado.
      </Text>
    </View>
  );
}
