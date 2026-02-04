import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;

  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  qrResult: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      console.log('QR Scanner initialized in browser');
    } else {
      console.warn('QR Scanner is not available in server-side environment');
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.availableDevices = devices;
    if (devices && devices.length > 0) {
      // Select the first camera as default
      this.currentDevice = devices[0];
    }
    this.isLoading = false;
  }

  onCameraError(error: any) {
    this.errorMessage = 'Camera error: ' + error.message || 'Unable to access camera';
    console.error('Camera error:', error);
    this.isLoading = false;
  }
    
  onScanSuccess(content: string) {
    this.qrResult = content;
    this.processScanResult(content);
  }
    
  onDeviceChange(event: Event) {
    // Handle device change if needed
    console.log('Camera device changed');
  }
  
  onDeviceSelected(event: any) {
    const selectedIndex = event.target.value;
    this.currentDevice = this.availableDevices[selectedIndex];
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

    if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined' && urlString && this.isValidUrl(urlString)) {
      window.open(urlString, '_blank');
    }
  }
}
