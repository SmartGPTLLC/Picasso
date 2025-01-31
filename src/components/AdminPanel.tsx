import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Save, Printer, Image, Sliders, Check, RotateCcw } from 'lucide-react';
import type { Settings, PrintSize, TransformationType, TransformationParams } from '../types';

interface TransformationControl {
  id: keyof TransformationParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const AdminPanel: React.FC = () => {
  const { settings, updateSettings, updateTransformationParams, resetTransformationParams } = useSettings();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    updateSettings({ [key]: value });
  };

  const transformationControls: TransformationControl[] = [
    {
      id: 'edgeStrength',
      label: 'Edge Strength',
      min: 0,
      max: 1,
      step: 0.05
    },
    {
      id: 'lineWeight',
      label: 'Line Weight',
      min: 0.5,
      max: 3,
      step: 0.1
    },
    {
      id: 'backgroundWhiteness',
      label: 'Background Whiteness',
      min: 0.8,
      max: 1,
      step: 0.01
    },
    {
      id: 'noiseReduction',
      label: 'Noise Reduction',
      min: 0,
      max: 5,
      step: 0.5
    },
    {
      id: 'blurRadius',
      label: 'Blur Radius',
      min: 0,
      max: 10,
      step: 0.5,
    },
    {
      id: 'colorReductionFactor',
      label: 'Color Reduction',
      min: 8,
      max: 64,
      step: 8,
    },
    {
      id: 'oilRadius',
      label: 'Oil Radius',
      min: 1,
      max: 5,
      step: 1,
    },
    {
      id: 'oilIntensity',
      label: 'Oil Intensity Levels',
      min: 5,
      max: 50,
      step: 5,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-accent-red mb-8 flex items-center">
          <Sliders className="w-8 h-8 mr-2" />
          Booth Settings
        </h2>

        <div className="space-y-8">
          {/* Image Settings */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-accent-teal flex items-center">
              <Image className="w-6 h-6 mr-2" />
              Image Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transformation Type
                </label>
                <select
                  value={settings.transformationType}
                  onChange={(e) =>
                    handleSettingChange('transformationType', e.target.value as TransformationType)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-teal focus:ring focus:ring-accent-teal/20"
                >
                  <option value="pencil">Pencil Sketch</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="oilpainting">Oil Painting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Enabled
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.previewEnabled}
                      onChange={(e) =>
                        handleSettingChange('previewEnabled', e.target.checked)
                      }
                      className="h-4 w-4 text-accent-teal focus:ring-accent-teal rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Show preview before printing
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Transformation Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">Transformation Parameters</h4>
                <button
                  onClick={resetTransformationParams}
                  className="flex items-center gap-2 text-sm text-accent-teal hover:text-accent-teal/80"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transformationControls
                  .filter(({ id }) => {
                    if (settings.transformationType === 'pencil') {
                      return ['edgeStrength', 'lineWeight', 'backgroundWhiteness', 'noiseReduction'].includes(id);
                    } else if (settings.transformationType === 'watercolor') {
                      return ['blurRadius', 'colorReductionFactor'].includes(id);
                    } else if (settings.transformationType === 'oilpainting') {
                      return ['oilRadius', 'oilIntensity'].includes(id);
                    }
                    return false;
                  })
                  .map(({ id, label, min, max, step }) => (
                    <div key={id} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <span className="text-sm text-gray-500">
                          {settings.transformationParams[id]?.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={settings.transformationParams[id] ?? 0}
                        onChange={(e) => updateTransformationParams({ 
                          [id]: parseFloat(e.target.value) 
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-teal"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* Print Settings */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-accent-teal flex items-center">
              <Printer className="w-6 h-6 mr-2" />
              Print Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Size
                </label>
                <select
                  value={settings.printSize}
                  onChange={(e) =>
                    handleSettingChange('printSize', e.target.value as PrintSize)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-teal focus:ring focus:ring-accent-teal/20"
                >
                  <option value="6x9">6x9 inches</option>
                  <option value="8x10">8x10 inches</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print DPI
                </label>
                <select
                  value={settings.printDPI}
                  onChange={(e) =>
                    handleSettingChange('printDPI', Number(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-teal focus:ring focus:ring-accent-teal/20"
                >
                  <option value="300">300 DPI (Recommended)</option>
                  <option value="600">600 DPI (High Quality)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-print
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoPrint}
                      onChange={(e) =>
                        handleSettingChange('autoPrint', e.target.checked)
                      }
                      className="h-4 w-4 text-accent-teal focus:ring-accent-teal rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Automatically print after transformation
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
              className="bg-primary hover:bg-primary/90 text-black px-8 py-4 rounded-full font-bold shadow-button-3d transform active:translate-y-1 flex items-center space-x-2 disabled:opacity-50"
            >
              {saveStatus === 'saved' ? (
                <Check className="w-6 h-6" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              <span>
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                  ? 'Saved!'
                  : 'Save Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;