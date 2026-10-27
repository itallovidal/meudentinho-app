export interface PwaSnapshot {
  canInstall: boolean;
  installed: boolean;
  updateAvailable: boolean;
  isIos: boolean;
}

export interface PwaController {
  getSnapshot: () => PwaSnapshot;
  install: () => Promise<void>;
  update: () => boolean;
}

declare global {
  interface Window {
    janelinhaPwa?: PwaController;
  }
}
