export default class TransformationWorker {
  constructor() {
    self.onmessage = this.handleMessage.bind(this);
    // ... rest of worker code ...
  }
  // ... existing methods ...
} 