// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // As regras do React Compiler abaixo geram falsos positivos em padrões
    // legítimos deste app: a API imperativa de `useSharedValue().value` do
    // Reanimated (immutability), callbacks de gesto/dismiss que fecham sobre
    // refs (refs) e a hidratação assíncrona da sessão no mount (set-state-in-effect).
    // Ficam como warning para continuarem visíveis sem falhar o lint.
    files: [
      "app/components/ui/bottomSheet.tsx",
      "app/components/ui/toast.tsx",
      "app/contexts/UserContext.tsx",
    ],
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
