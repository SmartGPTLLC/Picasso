import { TransformationParams } from '../../../types';

interface PencilSketchParams extends TransformationParams {
  edgeStrength?: number;      // Controls line darkness (0-1)
  edgeThreshold?: number;     // Edge detection sensitivity
  noiseReduction?: number;    // Reduces noise in lines
  lineWeight?: number;        // Controls line thickness
  backgroundWhiteness?: number; // Controls how white the background becomes
  minLineIntensity?: number;  // Minimum intensity for a line to be drawn
  maxLineIntensity?: number;  // Maximum intensity for line darkness
  blurRadius?: number;        // placeholder default
  colorReductionFactor?: number; // placeholder default
  oilRadius?: number;         // placeholder default
  oilIntensity?: number;      // placeholder default
}

const DEFAULT_PARAMS: Required<PencilSketchParams> = {
  edgeStrength: 0.95,        // Very strong edges for defined lines
  edgeThreshold: 8,          // Lower threshold to catch subtle edges
  noiseReduction: 3,         // Higher noise reduction for cleaner lines
  lineWeight: 1.5,           // Thicker lines
  backgroundWhiteness: 1.0,  // Pure white background
  minLineIntensity: 0.1,     // Minimum line intensity
  maxLineIntensity: 0.85,    // Maximum line darkness
  blurRadius: 0,            // placeholder default
  colorReductionFactor: 16,  // placeholder default
  oilRadius: 2,             // placeholder default
  oilIntensity: 10           // placeholder default
};

export async function applyPencilSketch(
  imageData: ImageData,
  customParams: PencilSketchParams = {}
): Promise<ImageData> {
  const params = { ...DEFAULT_PARAMS, ...customParams };
  const width = imageData.width;
  const height = imageData.height;
  
  // Create output buffer
  const output = new ImageData(width, height);
  const inputData = imageData.data;
  const outputData = output.data;

  // Create grayscale and edge detection buffers
  const grayscale = new Float32Array(width * height);
  const edges = new Float32Array(width * height);
  
  // Step 1: Convert to grayscale with enhanced contrast
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let gray = (
        inputData[i] * 0.299 +
        inputData[i + 1] * 0.587 +
        inputData[i + 2] * 0.114
      ) / 255;
      
      // Enhance contrast
      gray = Math.pow(gray, 1.2);
      grayscale[y * width + x] = gray;
    }
  }

  // Step 2: Enhanced edge detection with noise reduction
  const radius = params.noiseReduction;
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let maxGradient = 0;
      let gradientCount = 0;
      
      // Check surrounding pixels for edges with direction consideration
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const gradient = Math.abs(
            grayscale[y * width + x] - 
            grayscale[(y + dy) * width + (x + dx)]
          );
          
          if (gradient > params.edgeThreshold / 255) {
            maxGradient = Math.max(maxGradient, gradient);
            gradientCount++;
          }
        }
      }
      
      // Only keep strong, consistent edges
      edges[y * width + x] = gradientCount > 2 
        ? Math.min(1, maxGradient * params.edgeStrength)
        : 0;
    }
  }

  // Step 3: Generate final pencil sketch with enhanced line quality
  for (let i = 0; i < width * height; i++) {
    const edge = edges[i];
    const x = i % width;
    const y = Math.floor(i / width);
    
    // Skip border pixels
    if (x < radius || x >= width - radius ||
        y < radius || y >= height - radius) {
      outputData[i * 4] = 255;
      outputData[i * 4 + 1] = 255;
      outputData[i * 4 + 2] = 255;
      outputData[i * 4 + 3] = 255;
      continue;
    }

    // Calculate line intensity with enhanced contrast
    let lineIntensity = edge * params.lineWeight;
    
    // Apply minimum and maximum intensity thresholds
    if (lineIntensity > params.minLineIntensity) {
      lineIntensity = Math.min(
        params.maxLineIntensity,
        Math.pow(lineIntensity, 1.5)
      );
    } else {
      lineIntensity = 0;
    }
    
    // Calculate final pixel value
    const value = Math.max(
      255 * params.backgroundWhiteness,
      255 * (1 - lineIntensity)
    );

    // Set pixel values
    outputData[i * 4] = value;     // R
    outputData[i * 4 + 1] = value; // G
    outputData[i * 4 + 2] = value; // B
    outputData[i * 4 + 3] = 255;   // A
  }

  return output;
}