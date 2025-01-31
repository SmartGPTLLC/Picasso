import React, { createContext, useContext, useState } from 'react';
import type { TransformationType, TransformationParams } from '../types';

interface Settings {
  transformationType: TransformationType;
  autoPrint: boolean;
  printSize: '6x9' | '8x10';
  printDPI: number;
  previewEnabled: boolean;
  transformationParams: TransformationParams;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateTransformationParams: (params: Partial<Settings['transformationParams']>) => void;
  resetTransformationParams: () => void;
}

const defaultTransformationParams: TransformationParams = {
  edgeStrength: 0.95,
  lineWeight: 1.5,
  backgroundWhiteness: 0.98,
  noiseReduction: 3,
  blurRadius: 3,
  colorReductionFactor: 32,
  oilRadius: 2,
  oilIntensity: 20,
};

const defaultSettings: Settings = {
  transformationType: 'pencil',
  autoPrint: false,
  printSize: '8x10',
  printDPI: 300,
  previewEnabled: true,
  transformationParams: defaultTransformationParams
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateTransformationParams = (params: Partial<Settings['transformationParams']>) => {
    setSettings(prev => ({
      ...prev,
      transformationParams: { ...prev.transformationParams, ...params }
    }));
  };

  const resetTransformationParams = () => {
    setSettings(prev => ({
      ...prev,
      transformationParams: defaultTransformationParams
    }));
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      updateTransformationParams,
      resetTransformationParams 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};