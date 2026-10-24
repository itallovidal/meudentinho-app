module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:4173/app/perfil/dependentes/kid-1/editar",
    pretendToBeVisual: true,
  },
  testMatch: ["<rootDir>/web/__tests__/**/*.test.ts"],
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
};
