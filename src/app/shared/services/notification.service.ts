import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, duration: number = 7000) {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-snackbar'],
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['info-snackbar']
    });
  }
}