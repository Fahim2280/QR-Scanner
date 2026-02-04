import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QrScannerService } from '../services/qr-scanner.service';
import { QrCode, QrScanResult, QrCodeType } from '../models/qr-code.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.html',
  styleUrls: ['./qr-scanner.css'],
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  qrResult: string | null = null;
  scanningActive = false;
  videoDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string | undefined;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private qrScannerService: QrScannerService, private router: Router) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.videoDevices = await this.qrScannerService.getVideoDevices();
      if (this.videoDevices.length > 0) {
        this.selectedDeviceId = this.videoDevices[0].deviceId;
      }
    } catch (error) {
      this.errorMessage = 'Camera access denied or not available.';
      console.error('Error getting video devices:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.scanningActive) {
      this.stopScanning();
    }
  }

  async startScanning() {
    if (!this.video) {
      return;
    }

    try {
      await this.qrScannerService.setupVideoStream(this.video.nativeElement, this.selectedDeviceId);
      this.scanningActive = true;
      this.errorMessage = null;

      // Start continuous scanning
      this.continuousScan();
    } catch (error) {
      this.errorMessage = 'Failed to start camera.';
      console.error('Error starting camera:', error);
    }
  }

  stopScanning() {
    if (this.video) {
      this.qrScannerService.stopVideoStream(this.video.nativeElement);
    }
    this.scanningActive = false;
  }

  private async continuousScan() {
    if (!this.scanningActive) return;

    try {
      const result = await this.qrScannerService.scanQrFromVideo(this.video.nativeElement);
      if (result) {
        this.qrResult = result;
        this.processScanResult(result);
        this.stopScanning(); // Stop scanning once we get a result
      } else {
        // Continue scanning after delay
        setTimeout(() => this.continuousScan(), environment.qrScanner.scanInterval);
      }
    } catch (error) {
      console.error('Error during scanning:', error);
      setTimeout(() => this.continuousScan(), environment.qrScanner.scanInterval);
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

  onDeviceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDeviceId = target.value;
  }

  async switchCamera() {
    if (this.scanningActive) {
      this.stopScanning();
    }

    // Cycle through available cameras
    if (this.videoDevices.length > 1 && this.selectedDeviceId) {
      const currentIndex = this.videoDevices.findIndex(
        (device) => device.deviceId === this.selectedDeviceId
      );
      const nextIndex = (currentIndex + 1) % this.videoDevices.length;
      this.selectedDeviceId = this.videoDevices[nextIndex].deviceId;

      await this.startScanning();
    }
  }

  resetScanner() {
    this.qrResult = null;
    this.errorMessage = null;
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
    if (urlString && this.isValidUrl(urlString)) {
      window.open(urlString, '_blank');
    }
  }
}
