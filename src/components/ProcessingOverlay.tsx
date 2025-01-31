import React from 'react';

interface ProcessingOverlayProps {
  message: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ message }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="text-white text-xl">{message}</div>
  </div>
);

export default ProcessingOverlay;