import React, { useRef, useState, useCallback, useEffect, WheelEvent as ReactWheelEvent } from 'react';
import { Camera, RefreshCcw, Printer, AlertCircle, Upload } from 'lucide-react';
import { applyTransformation } from '../lib/transformations';
import { printImage } from '../lib/printService';
import { useSettings } from '../contexts/SettingsContext';
import CameraSelect from './CameraSelect';
import type { PrintStatus } from '../types';
import TransformationControls from './TransformationControls';
import { toast } from 'react-hot-toast';
import TransformationQueue from './TransformationQueue';
import { DEMO_IMAGES } from '../constants/demoImages';

interface CameraDevice {
  deviceId: string;
  label: string;
}

// Define an interface for OverconstrainedError
interface OverconstrainedError extends Error {
  constraint: string;
}

// Type guard to check if error is OverconstrainedError
function isOverconstrainedError(err: unknown): err is OverconstrainedError {
  return (
    err instanceof Error &&
    err.name === 'OverconstrainedError' &&
    'constraint' in err &&
    typeof (err as OverconstrainedError).constraint === 'string'
  );
}

type StrictTransformationParams = {
  edgeStrength: number;
  lineWeight: number;
  backgroundWhiteness: number;
  noiseReduction: number;
  blurRadius: number;
  colorReductionFactor: number;
  oilRadius: number;
  oilIntensity: number;
};

interface TransformationJob {
  id: string;
  image: ImageData;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ImageData;
  error?: string;
}

const PhotoBooth: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [printStatus, setPrintStatus] = useState<PrintStatus>({
    isPrinting: false,
    error: null,
    lastPrintTime: null
  });
  const { settings } = useSettings();
  const [isFullView, setIsFullView] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [transformationParams, setTransformationParams] = useState<StrictTransformationParams>({
    edgeStrength: 0.95,
    lineWeight: 1.5,
    backgroundWhiteness: 1.0,
    noiseReduction: 3,
    blurRadius: 0,
    colorReductionFactor: 16,
    oilRadius: 2,
    oilIntensity: 10,
  });
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [cropRect] = useState({ top: 50, left: 50, width: 300, height: 300 });
  const [shouldCrop, setShouldCrop] = useState(false);
  const [cameraState, setCameraState] = useState<
    'initializing' | 'active' | 'error' | 'disabled'
  >('initializing');
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [fallbackMode, setFallbackMode] = useState(false);
  const transformationQueue = useRef<TransformationJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<TransformationJob[]>([]);
  const worker = useRef<Worker>();

  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      
      console.log('Available cameras:', videoDevices);
      
      setCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  }, [selectedCamera]);

  const startCamera = useCallback(async (retryCount = 0) => {
    try {
      setCameraState('initializing');
      
      // Check permission state
      const status = await navigator.permissions.query({ name: 'camera' });
      setPermissionStatus(status.state);
      
      if (status.state === 'denied') {
        throw new Error('PERMISSION_DENIED');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject(new Error('Component unmounted'));

        const onPlaying = () => {
          videoRef.current?.removeEventListener('playing', onPlaying);
          resolve();
        };

        videoRef.current.addEventListener('playing', onPlaying);
        videoRef.current.play().catch(reject);
      });

      setIsCameraInitialized(true);
      await getCameras();

      setCameraState('active');
    } catch (err) {
      console.error('Camera error:', err);
      
      if (retryCount < 2) {
        console.log(`Retrying camera (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return startCamera(retryCount + 1);
      }

      setCameraState('error');
      setCameraError(
        err instanceof Error ? 
        getCameraErrorMessage(err) : 
        'Camera initialization failed'
      );
    }
  }, [selectedCamera, getCameras]);

  const stopCamera = useCallback((fullCleanup = false) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
        track.dispatchEvent(new Event('ended'));
      });
      streamRef.current = null;
    }
    
    if (fullCleanup && videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reset video element
    }
  }, []);

  const handlePrint = async (imageUrl: string) => {
    if (printStatus.isPrinting) return;

    setPrintStatus((prev: PrintStatus) => ({ ...prev, isPrinting: true, error: null }));
    try {
      await printImage(imageUrl, {
        printSize: settings.printSize,
        printDPI: settings.printDPI,
        autoprint: settings.autoPrint
      });
      setPrintStatus((prev: PrintStatus) => ({
        ...prev,
        isPrinting: false,
        lastPrintTime: new Date()
      }));
    } catch (error) {
      setPrintStatus((prev: PrintStatus) => ({
        ...prev,
        isPrinting: false,
        error: {
          code: 'PRINTER_ERROR',
          message: 'Failed to print image',
          details: {
            technical: error instanceof Error ? error.message : 'Unknown error',
            userAction: 'Please try printing again'
          }
        }
      }));
    }
  };

  const transformAndPrint = useCallback(async (imageData: ImageData) => {
    setIsTransforming(true);
    try {
      const transformedImageData = await applyTransformation(
        imageData,
        settings.transformationType,
        settings.transformationParams
      );

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = transformedImageData.width;
      canvas.height = transformedImageData.height;
      ctx.putImageData(transformedImageData, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);

      if (settings.autoPrint) {
        await handlePrint(dataUrl);
      }
    } catch (err) {
      console.error('Transformation error:', err);
    } finally {
      setIsTransforming(false);
    }
  }, [settings, handlePrint]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        void transformAndPrint(imageData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraInitialized) return;

    setIsCapturing(true);
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        queueTransformation(imageData);
        setIsCapturing(false);
        stopCamera();
      }
    }, 1000);
  }, [isCameraInitialized, transformAndPrint, stopCamera]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setPrintStatus({
      isPrinting: false,
      error: null,
      lastPrintTime: null
    });
    void startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!capturedImage) {
      void startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [capturedImage, selectedCamera, startCamera]);

  useEffect(() => {
    if (selectedCamera && !capturedImage) {
      void startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedCamera, startCamera, stopCamera, capturedImage]);

  useEffect(() => {
    if (selectedCamera && !capturedImage) {
      void startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedCamera, startCamera, stopCamera, capturedImage]);

  async function applyDynamicTransformation(base64: string) {
    try {
      const originalImageData = await base64ToImageData(base64);

      let workingData = originalImageData;
      if (shouldCrop) {
        // Crop first
        workingData = await cropImageData(originalImageData, cropRect);
      }

      // Then transform the (possibly) cropped data
      const result = await applyTransformation(
        workingData,
        'pencil',
        transformationParams
      );

      const updatedBase64 = await imageDataToBase64(result);
      setTransformedImage(updatedBase64);
    } catch (err) {
      console.error('Transformation error:', err);
    }
  }

  useEffect(() => {
    if (capturedImage) {
      void applyDynamicTransformation(capturedImage);
    }
  }, [transformationParams]);

  useEffect(() => {
    navigator.permissions.query({ name: 'camera' }).then(permission => {
      permission.onchange = () => {
        setPermissionStatus(permission.state);
        if (permission.state === 'granted') startCamera();
      };
    });
  }, [startCamera]);

  useEffect(() => {
    if (!streamRef.current || cameraState !== 'active') return;

    const monitorInterval = setInterval(() => {
      const tracks = streamRef.current?.getVideoTracks() || [];
      const track = tracks[0];
      
      if (!track) {
        console.error('No video tracks found');
        startCamera();
      }

      // Check track status
      if (track.readyState === 'ended') {
        console.log('Track ended unexpectedly');
        startCamera();
      }

      // Check frame rate health
      const settings = track.getSettings();
      if (settings.frameRate && settings.frameRate < 15) {
        console.warn('Low frame rate detected', settings.frameRate);
        toast('Camera performance degraded - adjusting settings...');
        startCamera(); // Reinitialize with simpler constraints
      }
    }, 5000);

    return () => clearInterval(monitorInterval);
  }, [cameraState, startCamera]);

  const CameraFallback = () => (
    <div className="camera-fallback">
      <div className="fallback-content">
        <AlertCircle className="w-16 h-16 text-accent-red" />
        <h3>Camera Unavailable</h3>
        <p>Using demo mode with sample images</p>
        
        {permissionStatus === 'denied' && (
          <button 
            className="settings-button"
            onClick={() => window.open('chrome://settings/content/camera')}
          >
            Open Camera Settings
          </button>
        )}
        
        <div className="demo-images">
          {DEMO_IMAGES.map((img) => (
            <img
              key={img}
              src={img}
              onClick={() => setCapturedImage(img)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Initialize Web Worker
  useEffect(() => {
    // Use vite's built-in worker handling
    worker.current = new Worker(new URL('../../workers/image-processor.worker.js', import.meta.url), {
      type: 'module'
    });
    
    worker.current.onmessage = (e) => {
      const { jobId, progress, result, error } = e.data;
      setActiveJobs(jobs => jobs.map(job => {
        if (job.id === jobId) {
          if (progress) return { ...job, progress };
          if (error) return { ...job, status: 'failed', error };
          if (result) return { ...job, status: 'completed', result };
        }
        return job;
      }));
    };
    
    return () => worker.current?.terminate();
  }, []);

  // Process queue
  const processQueue = useCallback(() => {
    const concurrentLimit = 2;
    const availableSlots = concurrentLimit - activeJobs.filter(j => 
      j.status === 'processing'
    ).length;

    transformationQueue.current.slice(0, availableSlots).forEach(job => {
      if (job.status === 'queued') {
        worker.current?.postMessage({
          jobId: job.id,
          imageData: job.image,
          transformation: {
            type: settings.transformationType,
            params: settings.transformationParams
          }
        });
        setActiveJobs(jobs => 
          jobs.map(j => j.id === job.id ? { ...j, status: 'processing' } : j)
        );
      }
    });
  }, [activeJobs, settings]);

  // Add to queue
  const queueTransformation = (imageData: ImageData) => {
    const job: TransformationJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      image: imageData,
      status: 'queued',
      progress: 0
    };
    
    transformationQueue.current = [...transformationQueue.current, job];
    setActiveJobs(prev => [...prev, job]);
    processQueue();
  };

  // Retry failed job
  const retryJob = (jobId: string) => {
    transformationQueue.current = transformationQueue.current.map(job => 
      job.id === jobId ? { ...job, status: 'queued', error: undefined } : job
    );
    setActiveJobs(jobs => 
      jobs.map(job => 
        job.id === jobId ? { ...job, status: 'queued', error: undefined } : job
      )
    );
    processQueue();
  };

  // Add dev-mode controls
  const simulateCameraFailure = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.dispatchEvent(new Event('ended'));
      });
      setCameraState('error');
      toast.error('Simulated camera failure');
    }
  };

  const stressTestQueue = () => {
    const dummyImage = new ImageData(100, 100);
    for (let i = 0; i < 10; i++) {
      queueTransformation(dummyImage);
    }
    toast('Queued 10 test transformations');
  };

  const simulateNetworkFailure = () => {
    const originalWorker = worker.current;
    
    // Create broken worker
    worker.current = {
      postMessage: () => {
        setTimeout(() => {
          worker.current?.onmessage?.({
            data: { 
              jobId: 'failed-job', 
              error: 'Network error' 
            }
          });
        }, 1000);
      },
      terminate: () => {}
    } as unknown as Worker;

    setTimeout(() => {
      worker.current = originalWorker;
    }, 5000);
  };

  const testMemoryLeaks = async () => {
    const highResImage = await fetch('/demo/high-res-sample.jpg')
      .then(res => res.blob());
    
    for (let i = 0; i < 20; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(highResImage);
      // Intentionally don't release references
    }
    
    toast('Allocated 20 high-res images');
  };

  // Add performance monitoring
  useEffect(() => {
    const monitor = setInterval(() => {
      const metrics = {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        fps: 0,
        jobs: activeJobs.length,
        cameraState
      };

      if (videoRef.current) {
        const video = videoRef.current;
        metrics.fps = Math.round(
          video.getVideoPlaybackQuality?.()?.totalVideoFrames || 0
        );
      }

      console.table(metrics);
    }, 1000);

    return () => clearInterval(monitor);
  }, [activeJobs, cameraState]);

  useEffect(() => {
    return () => {
      stopCamera(true);
    };
  }, [stopCamera]);

  return (
    <div className="photo-booth-container">
      {cameraState === 'error' || fallbackMode ? (
        <CameraFallback />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-canvas p-4">
          <div className="relative w-full max-w-[calc(9/16*70vh)] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-lg">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8">
                <AlertCircle className="w-16 h-16 text-accent-red mb-4" />
                <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                <p className="text-center text-gray-300 mb-4">{cameraError}</p>
                <button
                  onClick={() => void startCamera()}
                  className="px-6 py-2 bg-accent-teal text-white rounded-full hover:bg-accent-teal/90 transition-colors shadow-button-3d"
                >
                  Retry Camera Access
                </button>
              </div>
            ) : !capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span className="text-6xl text-white font-bold">{countdown}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsFullView(true)}
                />
                
                {transformedImage && (
                  <img
                    src={transformedImage}
                    alt="Transformed Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-300"
                  />
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!capturedImage && cameras.length > 1 && (
            <div className="mt-4">
              <CameraSelect
                cameras={cameras}
                selectedCamera={selectedCamera}
                onSelect={setSelectedCamera}
                onRefresh={getCameras}
              />
            </div>
          )}

          <div className="mt-6 flex gap-4">
            {!capturedImage ? (
              <div className="flex gap-4">
                <button
                  onClick={captureImage}
                  disabled={isCapturing || !!cameraError || !isCameraInitialized}
                  className="px-6 py-3 bg-primary text-black rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-button-3d"
                >
                  <Camera className="w-5 h-5" />
                  {isCapturing ? 'Capturing...' : 'Take Photo'}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-accent-teal text-white rounded-full font-semibold flex items-center gap-2 hover:bg-accent-teal/90 transition-colors shadow-button-3d"
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleRetake}
                  className="px-6 py-3 bg-accent-red text-white rounded-full font-semibold flex items-center gap-2 hover:bg-accent-red/90 transition-colors shadow-button-3d"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Retake
                </button>
                <button
                  onClick={() => void handlePrint(capturedImage)}
                  disabled={printStatus.isPrinting}
                  className="px-6 py-3 bg-accent-teal text-white rounded-full font-semibold flex items-center gap-2 hover:bg-accent-teal/90 transition-colors disabled:opacity-50 shadow-button-3d"
                >
                  <Printer className="w-5 h-5" />
                  {printStatus.isPrinting ? 'Printing...' : 'Print'}
                </button>
              </div>
            )}
          </div>

          {isTransforming && (
            <div className="mt-4 text-lg font-semibold text-accent-teal">
              Applying artistic transformation...
            </div>
          )}

          {printStatus.error && (
            <div className="mt-4 text-accent-red">
              {printStatus.error.message}
            </div>
          )}

          {isFullView && capturedImage && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-80 p-4 flex flex-col">
              <div className="ml-auto pb-2">
                <button
                  onClick={() => setIsFullView(false)}
                  className="px-4 py-2 bg-accent-red rounded-full text-white font-semibold transition-colors hover:bg-accent-red/90 shadow-button-3d"
                >
                  Close Preview
                </button>
              </div>

              <div
                className="relative flex-1 overflow-auto"
                onWheel={(e: ReactWheelEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  if (e.deltaY < 0) {
                    setZoomScale(prev => Math.min(prev + 0.1, 5));
                  } else {
                    setZoomScale(prev => Math.max(prev - 0.1, 1));
                  }
                }}
              >
                <img
                  src={capturedImage}
                  alt="Full View"
                  className="block cursor-zoom-out mx-auto"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </div>
            </div>
          )}

          <TransformationControls
            params={transformationParams}
            onChange={(newParams) => 
              setTransformationParams(newParams as StrictTransformationParams)
            }
            onReset={() => setTransformationParams({
              edgeStrength: 0.95,
              lineWeight: 1.5,
              backgroundWhiteness: 1.0,
              noiseReduction: 3,
              blurRadius: 0,
              colorReductionFactor: 16,
              oilRadius: 2,
              oilIntensity: 10,
            })}
          />

          <button
            onClick={() => setShouldCrop((prev) => !prev)}
            className="px-4 py-2 bg-accent-teal text-white rounded-full"
          >
            {shouldCrop ? 'Disable Crop' : 'Enable Crop'}
          </button>

          <TransformationQueue 
            jobs={activeJobs} 
            onRetry={retryJob}
          />

          {process.env.NODE_ENV === 'development' && (
            <div className="dev-controls">
              <button onClick={simulateCameraFailure}>
                Simulate Camera Failure
              </button>
              <button onClick={stressTestQueue}>
                Queue 10 Test Jobs
              </button>
              <button onClick={simulateNetworkFailure}>
                Simulate Network Failure
              </button>
              <button onClick={testMemoryLeaks}>
                Test Memory Leaks
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;

async function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No 2D context'));
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = () => reject(new Error('Image load error'));
    img.src = base64;
  });
}

async function imageDataToBase64(imageData: ImageData): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');
    ctx.putImageData(imageData, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
}

async function cropImageData(
  imageData: ImageData,
  cropRect: { top: number; left: number; width: number; height: number }
): Promise<ImageData> {
  const { top, left, width, height } = cropRect;
  // Make sure dimensions are valid
  const validWidth = Math.min(width, imageData.width - left);
  const validHeight = Math.min(height, imageData.height - top);

  const canvas = document.createElement('canvas');
  canvas.width = validWidth;
  canvas.height = validHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context for crop');

  // Put entire imageData onto our crop canvas, then cut out the region
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) throw new Error('Cannot get 2D context for tempCanvas');
  tempCtx.putImageData(imageData, 0, 0);

  // Draw the sub-region onto our final canvas
  ctx.drawImage(
    tempCanvas,
    left,
    top,
    validWidth,
    validHeight,
    0,
    0,
    validWidth,
    validHeight
  );

  return ctx.getImageData(0, 0, validWidth, validHeight);
}

const getCameraErrorMessage = (error: Error) => {
  const messages: Record<string, string> = {
    'NotAllowedError': 'Camera access denied - enable in browser settings',
    'NotFoundError': 'No camera devices found',
    'NotReadableError': 'Camera is already in use',
    'OverconstrainedError': 'Camera doesn\'t support required settings',
    'PERMISSION_DENIED': 'Camera access permanently denied'
  };
  
  return messages[error.name] || 'Camera error occurred';
};