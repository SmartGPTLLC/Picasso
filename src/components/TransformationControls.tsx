import React from 'react';
import { Sliders, Save, RotateCcw } from 'lucide-react';
import { TransformationParams } from '../types';

interface TransformationControlsProps {
  params: TransformationParams;
  onChange: (params: TransformationParams) => void;
  onReset: () => void;
  onSavePreset?: () => void;
}

const controls = [
  {
    id: 'edgeStrength',
    label: 'Edge Strength',
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.95
  },
  {
    id: 'lineWeight',
    label: 'Line Weight',
    min: 0.5,
    max: 3,
    step: 0.1,
    defaultValue: 1.5
  },
  {
    id: 'backgroundWhiteness',
    label: 'Background',
    min: 0.8,
    max: 1,
    step: 0.01,
    defaultValue: 0.98
  },
  {
    id: 'noiseReduction',
    label: 'Noise Reduction',
    min: 0,
    max: 5,
    step: 0.5,
    defaultValue: 3
  }
];

const TransformationControls: React.FC<TransformationControlsProps> = ({
  params,
  onChange,
  onReset,
  onSavePreset
}) => {
  const handleChange = (id: string, value: number) => {
    onChange({ ...params, [id]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-72 absolute right-4 top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Controls
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onSavePreset && (
            <button
              onClick={onSavePreset}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Save as preset"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {controls.map(({ id, label, min, max, step, defaultValue }) => (
          <div key={id} className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <span className="text-sm text-gray-500">
                {params[id]?.toFixed(2) ?? defaultValue}
              </span>
            </div>
            <input
              type="range"
              id={id}
              min={min}
              max={max}
              step={step}
              value={params[id] ?? defaultValue}
              onChange={(e) => handleChange(id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-teal"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransformationControls;