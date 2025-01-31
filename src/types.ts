export interface PrintError {
  code: string;
  message: string;
  details?: {
    technical: string;
    userAction: string;
  };
}

export interface PrintStatus {
  isPrinting: boolean;
  error: PrintError | null;
  lastPrintTime: Date | null;
}

export type TransformationType = 'pencil' | 'watercolor' | 'oilpainting';

export interface TransformationParams {
  // Existing parameters for pencil sketch
  edgeStrength?: number;
  lineWeight?: number;
  backgroundWhiteness?: number;
  noiseReduction?: number;

  // Parameters for watercolor
  blurRadius?: number;
  colorReductionFactor?: number;

  // Parameters for oil painting
  oilRadius?: number;
  oilIntensity?: number;
}

export type PrintSize = '6x9' | '8x10';

export interface Settings {
  transformationType: TransformationType;
  autoPrint: boolean;
  printSize: PrintSize;
  printDPI: number;
  previewEnabled: boolean;
  transformationParams: TransformationParams;
}

// ... existing exports ... 