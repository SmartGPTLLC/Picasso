// Update the transformation function to accept params
import { TransformationType, TransformationParams } from '../types';

export async function applyTransformation(
  imageData: ImageData,
  type: TransformationType,
  params?: TransformationParams
): Promise<ImageData> {
  const transformationService = await import('./service').then(m => m.transformationService);
  await transformationService.initialize();
  const result = await transformationService.transform(imageData, type, params);
  return result.imageData;
}