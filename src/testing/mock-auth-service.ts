import { signal } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { of } from 'rxjs';

/**
 * Mock AuthService for testing
 * Provides default authenticated state and spy methods
 */
export class MockAuthService {
  isAuthenticated = signal(true);
  currentUser = signal({ email: 'test@example.com', name: 'Test User' });
  
  login = jasmine.createSpy('login').and.returnValue(of({ 
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh-token'
  }));
  
  register = jasmine.createSpy('register').and.returnValue(of({ 
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh-token'
  }));
  
  logout = jasmine.createSpy('logout').and.returnValue(of(void 0));
  
  refreshToken = jasmine.createSpy('refreshToken').and.returnValue(of({ 
    accessToken: 'new-mock-token',
    refreshToken: 'new-mock-refresh-token'
  }));
  
  getToken = jasmine.createSpy('getToken').and.returnValue('mock-token');

  /**
   * Set authenticated state
   */
  setAuthenticated(authenticated: boolean) {
    this.isAuthenticated.set(authenticated);
  }

  /**
   * Set current user
   */
  setCurrentUser(user: any) {
    this.currentUser.set(user);
  }

  /**
   * Reset all spies
   */
  reset() {
    this.login.calls.reset();
    this.register.calls.reset();
    this.logout.calls.reset();
    this.refreshToken.calls.reset();
    this.getToken.calls.reset();
  }
}

/**
 * Helper function to provide MockAuthService in tests
 */
export function provideMockAuthService() {
  const mockService = new MockAuthService();
  return { provide: AuthService, useValue: mockService };
}
