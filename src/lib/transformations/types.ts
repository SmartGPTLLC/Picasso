import type { TransformationType } from '../../types';

export interface TransformationResult {
  imageData: ImageData;
  metadata?: {
    processingTime: number;
    parameters: Record<string, unknown>;
  };
}

export interface TransformationProcessor {
  name: string;
  initialize(): Promise<void>;
  transform(
    imageData: ImageData,
    type: TransformationType,
    params?: Record<string, unknown>
  ): Promise<TransformationResult>;
  cleanup(): Promise<void>;
}

export interface ProcessorFactory {
  createProcessor(type: string): Promise<TransformationProcessor>;
}