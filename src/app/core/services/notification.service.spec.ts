import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    
    // Mock the return value of snackBar.open()
    const mockSnackBarRef = {} as MatSnackBarRef<any>;
    mockSnackBar.open.and.returnValue(mockSnackBarRef);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        NotificationService,
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });

    service = TestBed.inject(NotificationService);
  });

  describe('showSuccess', () => {
    it('should open snackbar with success message', () => {
      service.showSuccess('Operation successful');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Operation successful',
        'Close',
        jasmine.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar']
        })
      );
    });

    it('should use custom duration if provided', () => {
      service.showSuccess('Success', 5000);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Success',
        'Close',
        jasmine.objectContaining({
          duration: 5000
        })
      );
    });

    it('should use default duration when not provided', () => {
      service.showSuccess('Success');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Success',
        'Close',
        jasmine.objectContaining({
          duration: 3000
        })
      );
    });
  });

  describe('showError', () => {
    it('should open snackbar with error message', () => {
      service.showError('Operation failed');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Operation failed',
        'Close',
        jasmine.objectContaining({
          duration: 7000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top'
        })
      );
    });

    it('should use longer default duration for errors', () => {
      service.showError('Error occurred');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error occurred',
        'Close',
        jasmine.objectContaining({
          duration: 7000
        })
      );
    });

    it('should position error snackbar at top', () => {
      service.showError('Error');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error',
        'Close',
        jasmine.objectContaining({
          verticalPosition: 'top'
        })
      );
    });

    it('should use custom duration for errors if provided', () => {
      service.showError('Error', 10000);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error',
        'Close',
        jasmine.objectContaining({
          duration: 10000
        })
      );
    });
  });

  describe('showInfo', () => {
    it('should open snackbar with info message', () => {
      service.showInfo('Information message');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Information message',
        'Close',
        jasmine.objectContaining({
          duration: 3000,
          panelClass: ['info-snackbar']
        })
      );
    });

    it('should use default duration for info messages', () => {
      service.showInfo('Info');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Info',
        'Close',
        jasmine.objectContaining({
          duration: 3000
        })
      );
    });

    it('should use custom duration for info if provided', () => {
      service.showInfo('Info', 4000);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Info',
        'Close',
        jasmine.objectContaining({
          duration: 4000
        })
      );
    });
  });

  describe('Multiple notifications', () => {
    it('should be able to show multiple notifications', () => {
      service.showSuccess('Success 1');
      service.showError('Error 1');
      service.showInfo('Info 1');

      expect(mockSnackBar.open).toHaveBeenCalledTimes(3);
    });

    it('should show different types of notifications with correct styling', () => {
      service.showSuccess('Success');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Success',
        'Close',
        jasmine.objectContaining({ panelClass: ['success-snackbar'] })
      );

      service.showError('Error');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error',
        'Close',
        jasmine.objectContaining({ panelClass: ['error-snackbar'] })
      );

      service.showInfo('Info');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Info',
        'Close',
        jasmine.objectContaining({ panelClass: ['info-snackbar'] })
      );
    });
  });
});
