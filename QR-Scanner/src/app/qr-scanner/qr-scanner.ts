import {
  Component,
  OnInit,
  PLATFORM_ID,
  Inject,
  afterNextRender,
  signal,
  computed,
  runInInjectionContext,
  Injector,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { QrCode, QrScanResult, QrCodeType } from '../models/qr-code.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, FormsModule],
  templateUrl: './qr-scanner.html',
  styleUrls: ['./qr-scanner.css'],
})
export class QrScannerComponent implements OnInit {
  // Signals for state management
  availableDevices = signal<MediaDeviceInfo[]>([]);
  currentDevice = signal<MediaDeviceInfo | undefined>(undefined);
  qrResult = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  isBrowser = signal<boolean>(false);
  hasCameraSupport = signal<boolean>(false);

  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  private injector = inject(Injector);

  // Add permission signal
  hasPermission = signal<boolean | null>(null);

  // Track if user manually selected a device to avoid overwriting it
  private userHasSelectedDevice = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Always assume we might be in browser and use afterNextRender for definitive check
    console.log('QR Scanner ngOnInit - Initial state');

    // Set initial loading state
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Use afterNextRender as the definitive way to detect browser environment
    // This runs after hydration is complete
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        console.log('afterNextRender: Running browser detection');

        const windowExists = typeof window !== 'undefined';
        const documentExists = typeof document !== 'undefined';

        if (windowExists && documentExists) {
          console.log('Confirmed: Running in browser environment');
          this.isBrowser.set(true);
          this.checkCameraSupport();
        } else {
          console.warn('Still in server-side environment after hydration');
          this.isBrowser.set(false);
          this.errorMessage.set('Scanner requires a browser environment');
          this.isLoading.set(false);
        }
      });
    });
  }

  private checkCameraSupport() {
    console.log('Checking camera support...');

    // Check if the browser supports getUserMedia
    if (navigator?.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      this.hasCameraSupport.set(true);
      this.isLoading.set(false);
      console.log('Camera API supported - ready to initialize');
    } else {
      this.hasCameraSupport.set(false);
      const errorMsg =
        'Camera access is not supported in this browser. Please use a modern browser with camera support.';
      this.errorMessage.set(errorMsg);
      this.isLoading.set(false);
      console.error('getUserMedia is not supported');
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    console.log('Cameras found:', devices.length, devices);
    this.availableDevices.set(devices);

    if (devices && devices.length > 0) {
      // Clear any previous camera-related errors when cameras are found
      const currentError = this.errorMessage();
      if (currentError && (
        currentError.includes('No camera') ||
        currentError.includes('camera is already in use') ||
        currentError.includes('does not support')
      )) {
        this.errorMessage.set(null);
      }
      
      // If user hasn't selected a device, or current device is no longer available
      const current = this.currentDevice();
      const stillAvailable = current ? devices.some((d) => d.deviceId === current.deviceId) : false;

      if (!this.userHasSelectedDevice || !stillAvailable) {
        console.log('Setting default camera...');
        this.currentDevice.set(devices[0]);
        this.userHasSelectedDevice = false; // Reset if we had to pick a new one
      } else {
        console.log('Keeping existing camera selection:', current?.label);
      }
      
      // Camera found, stop loading
      this.isLoading.set(false);
    } else {
      this.errorMessage.set('No cameras found on this device. Please connect a camera and refresh.');
      console.error('No cameras available');
      this.isLoading.set(false);
    }
  }

  onCameraError(error: any) {
    console.error('Camera error:', error);
    
    // Provide more specific error messages based on error type
    let errorMsg = 'Unable to access camera';
    
    if (error?.name) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
          this.hasPermission.set(false);
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMsg = 'No camera found. Please ensure a camera is connected and try again.';
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          errorMsg = 'Camera is already in use by another application. Please close other apps using the camera.';
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          errorMsg = 'Camera does not support the required settings. Trying alternative camera...';
          // Try to switch to another camera if available
          this.tryAlternativeCamera();
          break;
        case 'NotSupportedError':
          errorMsg = 'Camera access is not supported in this browser.';
          break;
        default:
          errorMsg = `Camera error: ${error?.message || error?.name || 'Unknown error'}`;
      }
    } else if (error?.message) {
      errorMsg = `Camera error: ${error.message}`;
    }
    
    this.errorMessage.set(errorMsg);
    this.isLoading.set(false);
  }
  
  private tryAlternativeCamera() {
    const devices = this.availableDevices();
    if (devices.length > 1) {
      const current = this.currentDevice();
      const alternative = devices.find(d => d.deviceId !== current?.deviceId);
      if (alternative) {
        console.log('Trying alternative camera:', alternative.label);
        setTimeout(() => {
          this.currentDevice.set(alternative);
          this.errorMessage.set(null);
          this.isLoading.set(true);
        }, 500);
      }
    }
  }

  onPermissionResponse(permission: boolean) {
    console.log('Camera permission response:', permission);
    this.hasPermission.set(permission);

    if (!permission) {
      this.errorMessage.set(
        'Camera permission denied. Please allow camera access in your browser settings and refresh the page.'
      );
      this.isLoading.set(false);
      console.error('Camera permission denied by user');
    } else {
      // Permission granted, clear any permission-related errors
      if (this.errorMessage()?.includes('permission')) {
        this.errorMessage.set(null);
      }
    }
  }

  onScanSuccess(content: string) {
    this.qrResult.set(content);
    this.processScanResult(content);
  }

  onDeviceChange(event: Event) {
    // Handle device change if needed
    console.log('Camera device changed');
  }

  onDeviceSelected(event: any) {
    const selectedDeviceId = event.target.value;
    console.log('User selecting device by ID:', selectedDeviceId);

    const devices = this.availableDevices();
    const device = devices.find((d) => d.deviceId === selectedDeviceId);

    if (device) {
      this.currentDevice.set(device);
      this.userHasSelectedDevice = true;
      console.log('Device successfully selected:', device.label);
    } else {
      console.error('Could not find device with ID:', selectedDeviceId);
    }
  }

  private processScanResult(data: string) {
    // Check if the scanned data is a valid URL
    let isValidUrl = false;
    try {
      new URL(data);
      isValidUrl = true;
    } catch (e) {
      isValidUrl = false;
    }

    if (this.isBrowser()) {
      if (isValidUrl) {
        // If it's a URL, show an option to navigate to it
        if (confirm(`QR Code contains URL: ${data}\n\nDo you want to visit this link?`)) {
          window.open(data, '_blank');
        }
      } else {
        // Display other types of data
        alert(`QR Code Data: ${data}`);
      }
    }
  }

  resetScanner() {
    this.qrResult.set(null);
    this.errorMessage.set(null);
  }

  isValidUrl(urlString: string | null): boolean {
    if (!urlString) return false;

    try {
      const url = new URL(urlString);
      return ['http:', 'https:'].includes(url.protocol);
    } catch (e) {
      return false;
    }
  }

  visitLink(urlString: string | null) {
    if (this.isBrowser() && urlString && this.isValidUrl(urlString)) {
      window.open(urlString, '_blank');
    }
  }

  refreshCameraCheck() {
    console.log('Refreshing camera check...');
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.checkCameraSupport();
  }

  forceBrowserMode() {
    console.log('Forcing browser mode...');
    this.isBrowser.set(true);
    this.errorMessage.set(null);
    this.isLoading.set(true);
    // Small delay to ensure state updates
    setTimeout(() => {
      this.checkCameraSupport();
    }, 100);
  }

  manualInitialize() {
    console.log('Manual initialization triggered');
    this.isBrowser.set(true);
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.hasCameraSupport.set(true);

    // Simulate what should happen after successful camera detection
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Manual initialization complete');
    }, 500);
  }

  refreshScanner() {
    console.log('Refreshing scanner...');
    // Reset states to trigger re-initialization
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.hasPermission.set(null);
    this.userHasSelectedDevice = false;
    this.currentDevice.set(undefined);
    this.availableDevices.set([]);

    // Re-check camera support
    setTimeout(() => {
      this.checkCameraSupport();
    }, 100);
  }
  
  reconnectCamera() {
    console.log('Reconnecting camera...');
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Reset current device to trigger reconnection
    const current = this.currentDevice();
    if (current) {
      // Temporarily clear device to force reconnection
      this.currentDevice.set(undefined);
      setTimeout(() => {
        this.currentDevice.set(current);
        this.isLoading.set(false);
      }, 300);
    } else {
      // If no device selected, try to get devices again
      this.refreshScanner();
    }
  }
}
