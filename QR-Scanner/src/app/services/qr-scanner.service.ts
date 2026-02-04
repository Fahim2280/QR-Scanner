import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare var jsQR: any;

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {
  private scanResultSubject = new Subject<string | null>();
  public scanResult$ = this.scanResultSubject.asObservable();

  constructor() {}

  /**
   * Scans a QR code from an image canvas
   * @param canvas HTMLCanvasElement containing the image to scan
   * @returns Promise resolving to the scanned QR code data or null if no QR code found
   */
  async scanQrFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    try {
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR to decode the image data
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        this.scanResultSubject.next(code.data);
        return code.data;
      } else {
        this.scanResultSubject.next(null);
        return null;
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      this.scanResultSubject.next(null);
      return null;
    }
  }

  /**
   * Scans a QR code from a video stream
   * @param video HTMLVideoElement to capture frames from
   * @returns Promise resolving to the scanned QR code data or null if no QR code found
   */
  async scanQrFromVideo(video: HTMLVideoElement): Promise<string | null> {
    // Create a temporary canvas to draw the video frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Scan the canvas for QR codes
    return await this.scanQrFromCanvas(canvas);
  }

  /**
   * Gets available video devices (cameras)
   * @returns Promise resolving to array of MediaDeviceInfo objects
   */
  async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    // Check if running in browser environment
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      console.warn('Media devices not available in this context');
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === 'videoinput');
    } catch (error) {
      console.warn('Error accessing video devices:', error);
      // Fallback: return an empty array indicating no devices available
      return [];
    }
  }

  /**
   * Sets up video stream from selected camera
   * @param videoElement HTMLVideoElement to attach the stream to
   * @param deviceId Optional device ID to use specific camera
   * @returns Promise resolving when video stream is ready
   */
  async setupVideoStream(videoElement: HTMLVideoElement, deviceId?: string): Promise<void> {
    // Check if running in browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available in this context');
    }

    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
      return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement
            .play()
            .then(() => resolve())
            .catch((error) => {
              console.error('Error playing video:', error);
              resolve();
            });
        };
      });
    } catch (err) {
      console.error('Error accessing camera:', err);
      throw err;
    }
  }

  /**
   * Stops the video stream
   * @param videoElement HTMLVideoElement with active stream
   */
  stopVideoStream(videoElement: HTMLVideoElement): void {
    const stream = videoElement.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }
}
