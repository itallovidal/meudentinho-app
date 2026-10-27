interface PwaInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function initializePwa() {
  if (!window.isSecureContext || !("serviceWorker" in navigator)) {
    return;
  }

  const standalone = window.matchMedia("(display-mode: standalone)");
  let installEvent: PwaInstallEvent | null = null;
  let registration: ServiceWorkerRegistration | null = null;
  let applyingUpdate = false;
  let snapshot: import("../../app/types/pwa").PwaSnapshot = {
    canInstall: false,
    installed:
      standalone.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    updateAvailable: false,
    isIos:
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
  };

  function notify() {
    window.dispatchEvent(new Event("janelinha:pwa"));
    const button =
      document.querySelector<HTMLButtonElement>("[data-pwa-install]");
    if (button) {
      button.hidden = snapshot.installed;
      button.textContent = snapshot.canInstall
        ? "Instalar Janelinha"
        : "Como instalar no dispositivo";
    }
  }

  window.janelinhaPwa = {
    getSnapshot: () => snapshot,
    async install() {
      const prompt = installEvent;
      if (!prompt) {
        return;
      }
      installEvent = null;
      snapshot = { ...snapshot, canInstall: false };
      notify();
      await prompt.prompt();
      await prompt.userChoice;
    },
    update() {
      if (!registration?.waiting) {
        return false;
      }
      applyingUpdate = true;
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return true;
    },
  };

  window.addEventListener(
    "beforeinstallprompt",
    function captureInstall(event) {
      event.preventDefault();
      installEvent = event as PwaInstallEvent;
      snapshot = { ...snapshot, canInstall: true };
      notify();
    },
  );
  window.addEventListener("appinstalled", function markInstalled() {
    installEvent = null;
    snapshot = { ...snapshot, canInstall: false, installed: true };
    notify();
  });
  standalone.addEventListener("change", function detectDisplayMode(event) {
    snapshot = { ...snapshot, installed: event.matches };
    notify();
  });
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    function reload() {
      if (applyingUpdate) {
        window.location.reload();
      }
    },
  );

  const installButton =
    document.querySelector<HTMLButtonElement>("[data-pwa-install]");
  if (installButton) {
    installButton.hidden = snapshot.installed;
    installButton.addEventListener(
      "click",
      async function installFromLanding() {
        const instructions = document.querySelector<HTMLElement>(
          "[data-pwa-instructions]",
        );
        try {
          if (snapshot.canInstall) {
            await window.janelinhaPwa!.install();
          } else if (instructions) {
            instructions.hidden = false;
          }
        } catch {
          if (instructions) {
            instructions.hidden = false;
          }
        }
      },
    );
  }

  async function registerWorker() {
    try {
      registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      function detectWaiting() {
        snapshot = {
          ...snapshot,
          updateAvailable:
            !!registration?.waiting && !!navigator.serviceWorker.controller,
        };
        notify();
      }
      detectWaiting();
      registration.addEventListener(
        "updatefound",
        function trackInstallation() {
          registration?.installing?.addEventListener(
            "statechange",
            detectWaiting,
          );
        },
      );
      document.addEventListener("visibilitychange", function checkForUpdate() {
        if (document.visibilityState === "visible") {
          void registration?.update().catch(() => undefined);
        }
      });
    } catch {
      window.dispatchEvent(new Event("janelinha:pwa-unavailable"));
    }
  }

  notify();
  void registerWorker();
}

initializePwa();
