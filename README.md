# QR Scanner

A modern, feature-rich QR code scanner application built with Angular. This application allows users to scan QR codes using their device's camera, with support for multiple camera devices, error handling, and automatic URL detection.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Components](#components)
- [Services](#services)
- [Models](#models)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Browser Compatibility](#browser-compatibility)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- 📷 **Real-time QR Code Scanning** - Scan QR codes using your device's camera
- 🔄 **Multiple Camera Support** - Switch between available cameras
- 🌐 **URL Detection** - Automatically detects and opens URLs from scanned QR codes
- 🎨 **Modern UI** - Clean, responsive interface with visual scanning overlay
- ⚡ **Error Handling** - Comprehensive error handling with user-friendly messages
- 🔒 **Permission Management** - Proper handling of camera permissions
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔁 **Auto-retry** - Automatically tries alternative cameras on connection failure
- 🚀 **SSR Support** - Server-side rendering compatible

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Angular CLI** (v20.3.15 or higher)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QR-Scanner/QR-Scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

The application will automatically redirect to the QR scanner page.

## Usage

### Basic Scanning

1. **Grant Camera Permission**
   - When you first access the scanner, your browser will prompt for camera permission
   - Click "Allow" to grant access

2. **Scan a QR Code**
   - Point your camera at a QR code
   - The scanner will automatically detect and decode the QR code
   - A green scanning line animation indicates active scanning

3. **View Results**
   - Scanned data appears at the bottom of the screen
   - If the QR code contains a URL, a "Visit Link" button will appear
   - Click "Scan Again" to scan another QR code

### Camera Selection

If multiple cameras are available:

1. A camera selection dropdown will appear at the bottom
2. Select the desired camera from the dropdown
3. The scanner will switch to the selected camera

### Error Recovery

If you encounter camera connection issues:

- **Try Again Button** - Click the "Try Again" button in error messages
- **Refresh Camera Check** - Use the "Refresh Camera Check" button
- **Reconnect Camera** - Use the "Reconnect Camera" button to manually reconnect
- **Refresh Scanner** - Use the "Refresh Scanner" button for a full reset

## Project Structure

```
QR-Scanner/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── qr-code.model.ts      # QR code data models
│   │   ├── qr-scanner/
│   │   │   ├── qr-scanner.ts          # Main scanner component
│   │   │   ├── qr-scanner.html        # Component template
│   │   │   ├── qr-scanner.css         # Component styles
│   │   │   └── qr-scanner.spec.ts     # Component tests
│   │   ├── services/
│   │   │   └── qr-scanner.service.ts  # QR scanning service
│   │   ├── app.ts                     # Root component
│   │   ├── app.routes.ts              # Application routes
│   │   └── app.config.ts              # App configuration
│   ├── environments/
│   │   ├── environment.ts             # Development environment
│   │   └── environment.prod.ts        # Production environment
│   ├── index.html                     # Main HTML file
│   └── main.ts                        # Application entry point
├── angular.json                        # Angular configuration
├── package.json                        # Dependencies and scripts
└── README.md                           # This file
```

## Components

### QrScannerComponent

The main component that handles QR code scanning functionality.

**Location:** `src/app/qr-scanner/qr-scanner.ts`

**Key Features:**
- Camera device detection and selection
- QR code scanning using ZXing library
- Error handling and recovery
- Permission management
- URL detection and navigation

**Signals:**
- `availableDevices` - Array of available camera devices
- `currentDevice` - Currently selected camera device
- `qrResult` - Scanned QR code data
- `errorMessage` - Current error message (if any)
- `isLoading` - Loading state indicator
- `isBrowser` - Browser environment detection
- `hasCameraSupport` - Camera API support detection
- `hasPermission` - Camera permission status

**Methods:**
- `onCamerasFound(devices)` - Called when cameras are detected
- `onCameraError(error)` - Handles camera connection errors
- `onPermissionResponse(permission)` - Handles permission responses
- `onScanSuccess(content)` - Processes successful scans
- `onDeviceSelected(event)` - Handles camera device selection
- `reconnectCamera()` - Manually reconnects the camera
- `refreshScanner()` - Refreshes the scanner state
- `resetScanner()` - Resets the scanner for a new scan

## Services

### QrScannerService

Service providing QR code scanning utilities.

**Location:** `src/app/services/qr-scanner.service.ts`

**Methods:**

#### `scanQrFromCanvas(canvas: HTMLCanvasElement): Promise<string | null>`
Scans a QR code from a canvas element.

**Parameters:**
- `canvas` - HTMLCanvasElement containing the image to scan

**Returns:** Promise resolving to the scanned QR code data or null

#### `scanQrFromVideo(video: HTMLVideoElement): Promise<string | null>`
Scans a QR code from a video stream.

**Parameters:**
- `video` - HTMLVideoElement to capture frames from

**Returns:** Promise resolving to the scanned QR code data or null

#### `getVideoDevices(): Promise<MediaDeviceInfo[]>`
Gets available video devices (cameras).

**Returns:** Promise resolving to array of MediaDeviceInfo objects

#### `setupVideoStream(videoElement: HTMLVideoElement, deviceId?: string): Promise<void>`
Sets up video stream from selected camera.

**Parameters:**
- `videoElement` - HTMLVideoElement to attach the stream to
- `deviceId` - Optional device ID to use specific camera

**Returns:** Promise resolving when video stream is ready

#### `stopVideoStream(videoElement: HTMLVideoElement): void`
Stops the video stream.

**Parameters:**
- `videoElement` - HTMLVideoElement with active stream

## Models

### QrCode

Interface representing a scanned QR code.

```typescript
interface QrCode {
  id?: string;
  data: string;
  timestamp: Date;
  type: QrCodeType;
  isValidUrl?: boolean;
}
```

### QrCodeType

Enumeration of QR code types.

```typescript
enum QrCodeType {
  TEXT = 'text',
  URL = 'url',
  CONTACT = 'contact',
  WIFI = 'wifi',
  EMAIL = 'email',
  SMS = 'sms',
  CALENDAR = 'calendar',
  GEOLOCATION = 'geolocation',
}
```

### QrScanResult

Interface representing scan result.

```typescript
interface QrScanResult {
  success: boolean;
  data?: string;
  error?: string;
  type?: QrCodeType;
  isValidUrl?: boolean;
}
```

## Development

### Running the Development Server

```bash
ng serve
```

The app will be available at `http://localhost:4200/`

### Running Tests

```bash
# Unit tests
ng test

# Watch mode
ng test --watch
```

### Code Scaffolding

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new model/interface
ng generate interface models/model-name
```

### Code Style

The project uses Prettier for code formatting with the following configuration:
- Print width: 100 characters
- Single quotes
- Angular HTML parser for template files

## Building for Production

### Build

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Production Build

```bash
ng build --configuration production
```

This will:
- Optimize the application for performance
- Enable output hashing for cache busting
- Minify code and assets
- Apply production optimizations

### Server-Side Rendering (SSR)

The project includes SSR support. To build and serve:

```bash
# Build for SSR
ng build

# Serve SSR build
npm run serve:ssr:QR-Scanner
```

## Troubleshooting

### Camera Not Connecting

**Symptoms:** Camera fails to initialize or shows "Camera not connected" error.

**Solutions:**
1. **Check Browser Permissions**
   - Ensure camera permissions are granted in browser settings
   - Try refreshing the page and granting permissions again

2. **Check Camera Availability**
   - Verify the camera is not being used by another application
   - Close other applications that might be using the camera

3. **Try Alternative Camera**
   - If multiple cameras are available, try selecting a different one
   - The scanner will automatically try alternative cameras on failure

4. **Use Reconnect Button**
   - Click the "Reconnect Camera" button to manually reconnect
   - Use "Refresh Scanner" for a complete reset

5. **Check HTTPS/Localhost**
   - Camera access requires HTTPS or localhost
   - Ensure you're accessing via `https://` or `http://localhost`

### Permission Denied

**Symptoms:** Browser shows permission denied error.

**Solutions:**
1. Check browser settings for camera permissions
2. Clear browser cache and cookies
3. Try in an incognito/private window
4. Ensure the site is using HTTPS (required for camera access)

### No Cameras Found

**Symptoms:** "No cameras found" error message.

**Solutions:**
1. Verify camera hardware is connected and working
2. Check device manager/system settings
3. Try refreshing the page
4. Test camera in another application to verify it works

### Scanner Not Starting

**Symptoms:** Scanner component doesn't initialize.

**Solutions:**
1. Check browser console for errors
2. Verify ZXing library is properly installed
3. Ensure you're running in a browser environment (not SSR)
4. Check that `navigator.mediaDevices` is available

### Poor Scanning Performance

**Symptoms:** QR codes are not detected quickly or reliably.

**Solutions:**
1. Ensure good lighting conditions
2. Hold the camera steady
3. Ensure QR code is in focus
4. Try adjusting distance from QR code
5. Clean camera lens

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge** (latest versions) ✅
- **Firefox** (latest versions) ✅
- **Safari** (latest versions) ✅
- **Opera** (latest versions) ✅

### Required Features

- **getUserMedia API** - For camera access
- **MediaDevices API** - For device enumeration
- **Canvas API** - For image processing
- **ES6+ Support** - For modern JavaScript features

### HTTPS Requirement

Camera access requires a secure context:
- ✅ `https://` URLs
- ✅ `http://localhost`
- ✅ `http://127.0.0.1`
- ❌ `http://` on non-localhost domains

## Dependencies

### Core Dependencies

- **@angular/core** (^20.3.0) - Angular framework
- **@angular/common** (^20.3.0) - Angular common utilities
- **@angular/router** (^20.3.0) - Angular routing
- **@zxing/ngx-scanner** (^21.0.0) - ZXing QR scanner for Angular
- **@zxing/library** (^0.21.3) - ZXing barcode library
- **rxjs** (~7.8.0) - Reactive extensions

### Development Dependencies

- **@angular/cli** (^20.3.15) - Angular CLI
- **@angular/build** (^20.3.15) - Angular build tools
- **typescript** (^5.9.2) - TypeScript compiler
- **karma** (~6.4.0) - Test runner
- **jasmine** (~5.1.0) - Testing framework

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Angular style guide
- Write tests for new features
- Update documentation as needed
- Ensure code passes linting
- Test on multiple browsers

## License

This project is open source and available under the [MIT License](LICENSE).

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started in minutes
- **[API Documentation](docs/API.md)** - Detailed API reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System architecture and design
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [ZXing Library Documentation](https://github.com/zxing-js/library)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ using Angular and ZXing**
