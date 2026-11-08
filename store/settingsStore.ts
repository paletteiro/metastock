import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  selectedPlatforms: string[];
  autoKeywords: boolean;
  releaseDetect: boolean;
  colorPalette: boolean;
  exportFormat: 'csv' | 'json' | 'xml';
  keywordCount: '25' | '40' | '50';
  togglePlatform: (platform: string) => void;
  setAutoKeywords: (val: boolean) => void;
  setReleaseDetect: (val: boolean) => void;
  setColorPalette: (val: boolean) => void;
  setExportFormat: (val: 'csv' | 'json' | 'xml') => void;
  setKeywordCount: (val: '25' | '40' | '50') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      selectedPlatforms: ['Shutterstock', 'Adobe Stock', 'Getty Images'],
      autoKeywords: true,
      releaseDetect: true,
      colorPalette: true,
      exportFormat: 'csv',
      keywordCount: '40',
      togglePlatform: (platform) =>
        set((s) => ({
          selectedPlatforms: s.selectedPlatforms.includes(platform)
            ? s.selectedPlatforms.filter((p) => p !== platform)
            : [...s.selectedPlatforms, platform],
        })),
      setAutoKeywords: (val) => set({ autoKeywords: val }),
      setReleaseDetect: (val) => set({ releaseDetect: val }),
      setColorPalette: (val) => set({ colorPalette: val }),
      setExportFormat: (val) => set({ exportFormat: val }),
      setKeywordCount: (val) => set({ keywordCount: val }),
    }),
    {
      name: 'metastock-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
