import { create } from 'zustand';

export interface CheckerSettings {
  displayWidth: number;
  displayHeight: number;
  deviceMode: 'desktop' | 'mobile' | 'tablet';
  anonymousMode: boolean;
  fakeIp: boolean;
  delayMode: boolean;
  delaySeconds: number;
  darkMode: boolean;
  userAgent: string;
}

interface SettingsStore {
  settings: CheckerSettings;
  updateSettings: (newSettings: Partial<CheckerSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: CheckerSettings = {
  displayWidth: 1024,
  displayHeight: 768,
  deviceMode: 'desktop',
  anonymousMode: false,
  fakeIp: false,
  delayMode: false,
  delaySeconds: 10,
  darkMode: false,
  userAgent: '',
};

export const useSettings = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  resetSettings: () => set({ settings: defaultSettings }),
}));
