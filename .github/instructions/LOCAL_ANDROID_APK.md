# Build de preview Android (APK local)

Este projeto já possui a pasta `android/`, então você pode gerar APK localmente sem usar build em nuvem.

## Pré-requisitos (Linux)

- Java (JDK) instalado
- Android SDK instalado
- Variáveis de ambiente configuradas (`ANDROID_HOME` e `PATH` com `platform-tools`)
- Celular com **Depuração USB** habilitada
- `adb` funcionando (`adb devices` deve listar o aparelho)

## Scripts adicionados

- `npm run android:apk:preview` -> gera APK release local
- `npm run android:apk:preview:debug` -> gera APK debug local
- `npm run android:apk:install:preview` -> instala APK release no aparelho
- `npm run android:apk:install:debug` -> instala APK debug no aparelho

## Fluxo recomendado (preview no aparelho)

1. Gerar APK release local:
   - `npm run android:apk:preview`
2. Instalar no celular conectado por USB:
   - `npm run android:apk:install:preview`

## Caminho do APK gerado

- Release: `android/app/build/outputs/apk/release/app-release.apk`
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`

## Observação importante

Atualmente o `buildTypes.release` está assinado com **debug keystore** (bom para preview/teste interno).

Isso é ótimo para testar no seu telefone real sem Play Store, mas para distribuição oficial você deve configurar uma keystore de produção.
