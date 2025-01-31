import type { TransformationType, TransformationParams } from '../../types';
import { processorFactory } from './processors';
import type { TransformationResult } from './types';
import { applyPencilSketch } from './pencilSketch';

class TransformationService {
  private currentProcessor?: Awaited<ReturnType<typeof processorFactory.createProcessor>>;
  private processorType: string = 'js';

  async initialize(): Promise<void> {
    if (!this.currentProcessor) {
      this.currentProcessor = await processorFactory.createProcessor(this.processorType);
      await this.currentProcessor.initialize();
    }
  }

  async transform(
    imageData: ImageData,
    type: TransformationType,
    params?: TransformationParams
  ): Promise<TransformationResult> {
    // Direct connection to pencil sketch algorithm
    if (type === 'pencil') {
      const result = await applyPencilSketch(imageData, params);
      return {
        imageData: result,
        metadata: {
          processingTime: 0,
          parameters: params || {}
        }
      };
    }

    // Fallback to processor pipeline for other transformations
    if (!this.currentProcessor) {
      await this.initialize();
    }
    return this.currentProcessor!.transform(imageData, type, params);
  }

  async cleanup(): Promise<void> {
    if (this.currentProcessor) {
      await this.currentProcessor.cleanup();
      this.currentProcessor = undefined;
    }
  }
}

export const transformationService = new TransformationService();