import type { TransformationType, TransformationParams } from '../types';
import { canvasRGBA } from 'stackblur-canvas';

export type TransformationType = 'pencil' | 'watercolor' | 'oilpainting';

export interface TransformationParams {
  edgeStrength: number;
  lineWeight: number;
  backgroundWhiteness: number;
  noiseReduction: number;
  blurRadius?: number;
  colorReductionFactor?: number;
  oilRadius?: number;
  oilIntensity?: number;
}

export async function applyTransformation(
  imageData: ImageData,
  type: TransformationType,
  params: TransformationParams
): Promise<ImageData> {
  switch (type) {
    case 'pencil':
      return applyPencilSketch(imageData, params);
    case 'watercolor':
      return applyWatercolorEffect(imageData, params);
    case 'oilpainting':
      return applyOilPaintingEffect(imageData, params);
    default:
      throw new Error(`Unsupported transformation type: ${type}`);
  }
}

function applyPencilSketch(
  imageData: ImageData,
  params: TransformationParams
): ImageData {
  const { edgeStrength, lineWeight, backgroundWhiteness } = params;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Apply edge detection (simple Sobel filter)
  const edgeData = new Uint8ClampedArray(data.length);
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      let k = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx];
          sumX += gray * kernelX[k];
          sumY += gray * kernelY[k];
          k++;
        }
      }

      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      const value = 255 - magnitude * edgeStrength;
      const offset = (y * width + x) * 4;
      edgeData[offset] = edgeData[offset + 1] = edgeData[offset + 2] = value;
      edgeData[offset + 3] = data[offset + 3]; // Copy alpha
    }
  }

  // Copy edge data back to original image data
  data.set(edgeData);

  // Adjust line weight and background whiteness
  for (let i = 0; i < data.length; i += 4) {
    const adjustedValue = data[i] * lineWeight + backgroundWhiteness * 255 * (1 - lineWeight);
    data[i] = data[i + 1] = data[i + 2] = adjustedValue;
  }

  // Apply noise reduction (optional)
  // TODO: Implement noise reduction if needed

  return new ImageData(data, width, height);
}

function applyWatercolorEffect(
  imageData: ImageData,
  params: TransformationParams
): ImageData {
  const { width, height } = imageData;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // Put the original image onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Apply blur using canvasRGBA
  const blurRadius = params.blurRadius || 3;
  canvasRGBA(canvas, 0, 0, width, height, blurRadius);

  // Reduce color depth
  const blurredImageData = ctx.getImageData(0, 0, width, height);
  const data = blurredImageData.data;
  const colorReductionFactor = params.colorReductionFactor || 32;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(data[i] / colorReductionFactor) * colorReductionFactor;
    data[i + 1] = Math.floor(data[i + 1] / colorReductionFactor) * colorReductionFactor;
    data[i + 2] = Math.floor(data[i + 2] / colorReductionFactor) * colorReductionFactor;
  }

  return blurredImageData;
}

function applyOilPaintingEffect(
  imageData: ImageData,
  params: TransformationParams
): ImageData {
  const { width, height, data } = imageData;
  const radius = params.oilRadius ?? 2; // Default radius value
  const intensityLevels = params.oilIntensity ?? 20; // Default intensity levels

  const outputData = new Uint8ClampedArray(data.length);

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const intensityCount = new Array(intensityLevels).fill(0);
      const averageR = new Array(intensityLevels).fill(0);
      const averageG = new Array(intensityLevels).fill(0);
      const averageB = new Array(intensityLevels).fill(0);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const pixelIndex = ((y + dy) * width + (x + dx)) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];

          const intensity = Math.floor(((r + g + b) / 3) * (intensityLevels - 1) / 255);

          intensityCount[intensity]++;
          averageR[intensity] += r;
          averageG[intensity] += g;
          averageB[intensity] += b;
        }
      }

      let maxIndex = 0;
      for (let i = 1; i < intensityLevels; i++) {
        if (intensityCount[i] > intensityCount[maxIndex]) {
          maxIndex = i;
        }
      }

      const pixelIndex = (y * width + x) * 4;
      const count = intensityCount[maxIndex] || 1;

      outputData[pixelIndex] = averageR[maxIndex] / count;
      outputData[pixelIndex + 1] = averageG[maxIndex] / count;
      outputData[pixelIndex + 2] = averageB[maxIndex] / count;
      outputData[pixelIndex + 3] = data[pixelIndex + 3];
    }
  }

  return new ImageData(outputData, width, height);
}