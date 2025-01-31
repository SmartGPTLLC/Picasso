// Add these types if they don't exist already
export type TransformationType = 'pencil' | 'watercolor' | 'oilpainting';

export interface TransformationParams {
  [key: string]: number | undefined;
}