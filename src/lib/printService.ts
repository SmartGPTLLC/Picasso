import { PrintSize, PrintSettings } from '../types';

const PRINT_DIMENSIONS = {
  '6x9': { width: 1800, height: 2700 },   // 300 DPI
  '8x10': { width: 2400, height: 3000 }   // 300 DPI
} as const;

export const getPrintDimensions = (size: PrintSize) => PRINT_DIMENSIONS[size];

export const printImage = async (
  imageData: string,
  settings: PrintSettings
): Promise<void> => {
  // Add simulated failure mode
  if (imageData.includes('fail-print')) {
    throw new Error('Simulated printer error');
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a temporary image element
      const img = new Image();
      
      // Important: Wait for image to load before processing
      img.onload = () => {
        // Create a temporary canvas for print formatting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size based on print dimensions
        const dimensions = getPrintDimensions(settings.printSize);
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // Fill background with white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scaling to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.width / aspectRatio;

        if (drawHeight > canvas.height) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * aspectRatio;
        }

        // Center the image
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        // Draw image
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        // Create print iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const printDoc = iframe.contentWindow?.document;
        if (!printDoc) {
          reject(new Error('Failed to create print document'));
          return;
        }

        // Get the final image data
        const finalImageUrl = canvas.toDataURL('image/jpeg', 1.0);

        // Write print document with proper dimensions
        printDoc.open();
        printDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                @page {
                  size: ${settings.printSize.split('x')[0]}in ${settings.printSize.split('x')[1]}in;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: white;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                  display: block;
                }
              </style>
            </head>
            <body>
              <img src="${finalImageUrl}" />
            </body>
          </html>
        `);
        printDoc.close();

        // Handle print completion
        const printWindow = iframe.contentWindow;
        if (!printWindow) {
          reject(new Error('Failed to access print window'));
          return;
        }

        const onAfterPrint = () => {
          document.body.removeChild(iframe);
          printWindow.removeEventListener('afterprint', onAfterPrint);
          resolve();
        };

        printWindow.addEventListener('afterprint', onAfterPrint);
        setTimeout(() => {
          printWindow.print();
        }, 100);
      };

      // Set image source after setting up onload handler
      img.src = imageData;

      img.onerror = () => {
        reject(new Error('Failed to load image for printing'));
      };
    } catch (error) {
      reject(error);
    }
  });
};