import React from 'react';

interface CountdownOverlayProps {
  countdown: number;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdown }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <span className="text-white text-9xl font-bold">{countdown}</span>
  </div>
)

export default CountdownOverlay;