import React from 'react';
import { Camera, RefreshCcw, Printer } from 'lucide-react';

interface CameraControlsProps {
  hasImage: boolean;
  isCapturing: boolean;
  isProcessing: boolean;
  isPrinting: boolean;
  showPrintButton: boolean;
  onCapture: () => void;
  onRetake: () => void;
  onPrint: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  hasImage,
  isCapturing,
  isProcessing,
  isPrinting,
  showPrintButton,
  onCapture,
  onRetake,
  onPrint,
}) => (
  <div className="mt-8 flex justify-center space-x-4">
    {!hasImage ? (
      <button
        onClick={onCapture}
        disabled={isCapturing}
        className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold shadow-button-3d transform active:translate-y-1 flex items-center space-x-2 disabled:opacity-50"
      >
        <Camera className="w-6 h-6" />
        <span>Take Photo</span>
      </button>
    ) : (
      <div className="flex space-x-4">
        <button
          onClick={onRetake}
          disabled={isProcessing || isPrinting}
          className="bg-accent-red hover:bg-accent-red/90 text-white px-8 py-4 rounded-full font-bold shadow-button-3d transform active:translate-y-1 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCcw className="w-6 h-6" />
          <span>Retake</span>
        </button>
        {showPrintButton && (
          <button
            onClick={onPrint}
            disabled={isProcessing || isPrinting}
            className="bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-full font-bold shadow-button-3d transform active:translate-y-1 flex items-center space-x-2 disabled:opacity-50"
          >
            <Printer className="w-6 h-6" />
            <span>{isPrinting ? 'Printing...' : 'Print'}</span>
          </button>
        )}
      </div>
    )}
  </div>
)

export default CameraControls;