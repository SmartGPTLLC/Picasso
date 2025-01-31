import { JSProcessor } from './jsProcessor';
import type { ProcessorFactory, TransformationProcessor } from '../types';

class TransformationProcessorFactory implements ProcessorFactory {
  async createProcessor(type: string): Promise<TransformationProcessor> {
    switch (type) {
      case 'js':
        return new JSProcessor();
      // Add other processors here when needed:
      // case 'opencv':
      //   return new OpenCVProcessor();
      // case 'tensorflow':
      //   return new TensorFlowProcessor();
      default:
        throw new Error(`Unknown processor type: ${type}`);
    }
  }
}

export const processorFactory = new TransformationProcessorFactory();