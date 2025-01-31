import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransformationType } from './transformations';

interface Settings {
  autoprint: boolean;
  previewEnabled: boolean;
  transformationType: TransformationType;
  printSize: '6x9' | '8x10';
  printDPI: number;
  retakeEnabled: boolean;
  maxFileSize: number;
}

interface AppState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        autoprint: true,
        previewEnabled: true,
        transformationType: 'pencil',
        printSize: '8x10',
        printDPI: 300,
        retakeEnabled: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'photo-booth-settings',
    }
  )
);