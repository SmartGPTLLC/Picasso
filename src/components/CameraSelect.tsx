import React from 'react';
import { Camera } from 'lucide-react';

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface CameraSelectProps {
  cameras: CameraDevice[];
  selectedCamera: string;
  onSelect: (deviceId: string) => void;
  onRefresh: () => void;
}

const CameraSelect: React.FC<CameraSelectProps> = ({
  cameras,
  selectedCamera,
  onSelect,
  onRefresh,
}) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedCamera}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-teal"
      >
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
          </option>
        ))}
      </select>
      <button
        onClick={onRefresh}
        className="p-2 rounded-full bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
        title="Refresh camera list"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CameraSelect;