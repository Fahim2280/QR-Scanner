import { Routes } from '@angular/router';
import { QrScannerComponent } from './qr-scanner/qr-scanner';

export const routes: Routes = [
  { path: 'qr-scanner', component: QrScannerComponent },
  { path: '', redirectTo: '/qr-scanner', pathMatch: 'full' },
];
