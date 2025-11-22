import { NotificationService } from '@app/core/services/notification.service';

/**
 * Mock NotificationService for testing
 * Provides spy methods to verify notification calls
 */
export class MockNotificationService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
  showInfo = jasmine.createSpy('showInfo');
  showWarning = jasmine.createSpy('showWarning');

  /**
   * Reset all spies
   */
  reset() {
    this.showSuccess.calls.reset();
    this.showError.calls.reset();
    this.showInfo.calls.reset();
    this.showWarning.calls.reset();
  }

  /**
   * Verify success notification was called with specific message
   */
  expectSuccess(message: string) {
    expect(this.showSuccess).toHaveBeenCalledWith(message);
  }

  /**
   * Verify error notification was called with specific message
   */
  expectError(message: string) {
    expect(this.showError).toHaveBeenCalledWith(message);
  }
}

/**
 * Helper function to provide MockNotificationService in tests
 */
export function provideMockNotificationService() {
  const mockService = new MockNotificationService();
  return { provide: NotificationService, useValue: mockService };
}
