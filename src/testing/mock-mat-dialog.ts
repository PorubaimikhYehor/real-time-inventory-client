/// <reference types="jasmine" />
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';

/**
 * Mock MatDialogRef for testing
 */
export class MockMatDialogRef<T = any> {
  close = jasmine.createSpy('close');
  afterClosed = jasmine.createSpy('afterClosed').and.returnValue(of(undefined));
  
  /**
   * Set the value returned when dialog is closed
   */
  setAfterClosedValue(value: any) {
    this.afterClosed.and.returnValue(of(value));
  }

  reset() {
    this.close.calls.reset();
    this.afterClosed.calls.reset();
  }
}

/**
 * Helper function to provide MockMatDialogRef in tests
 */
export function provideMockMatDialogRef<T = any>(componentType?: any) {
  const mockDialogRef = new MockMatDialogRef<T>();
  return { provide: MatDialogRef, useValue: mockDialogRef };
}

/**
 * Helper function to provide MAT_DIALOG_DATA in tests
 */
export function provideMockMatDialogData(data: any = {}) {
  return { provide: MAT_DIALOG_DATA, useValue: data };
}
