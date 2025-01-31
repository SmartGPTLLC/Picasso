import type { TransformationType } from '../../../types';
import type { TransformationProcessor, TransformationResult } from '../types';
import { applyPencilSketch } from '../algorithms/pencilSketch';

export class JSProcessor implements TransformationProcessor {
  name = 'JavaScript';

  async initialize(): Promise<void> {
    // No initialization needed for pure JS implementation
  }

  async transform(
    imageData: ImageData,
    type: TransformationType,
    params?: Record<string, unknown>
  ): Promise<TransformationResult> {
    const startTime = performance.now();

    let result: ImageData;
    switch (type) {
      case 'pencil':
        result = await applyPencilSketch(imageData, params);
        break;
      default:
        throw new Error(`Unsupported transformation type: ${type}`);
    }

    return {
      imageData: result,
      metadata: {
        processingTime: performance.now() - startTime,
        parameters: params || {}
      }
    };
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for pure JS implementation
  }
}