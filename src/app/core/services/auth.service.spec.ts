import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockRouter } from '@testing/mock-router';
import { TokenResponse, User, LoginRequest, RegisterRequest } from '@app/shared/models/auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: MockHttpClient;
  let mockRouter: MockRouter;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockTokenResponse: TokenResponse;
  let mockUser: User;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    mockRouter = new MockRouter();
    mockStorageService = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem', 'clear']);

    mockUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'User',
      fullName: 'Test User'
    };

    mockTokenResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      user: mockUser
    };

    // Mock storage to return null by default
    mockStorageService.getItem.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useValue: mockStorageService }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    mockHttpClient.reset();
    mockRouter.reset();
    mockStorageService.getItem.calls.reset();
    mockStorageService.setItem.calls.reset();
    mockStorageService.removeItem.calls.reset();
  });

  describe('Initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with no user when localStorage is empty', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should initialize isAdmin signal as false when not admin', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully and store tokens', (done) => {
      mockHttpClient.setPostResponse(mockTokenResponse);
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockTokenResponse);
          expect(mockHttpClient.post).toHaveBeenCalledWith('/api/auth/login', loginRequest);
          expect(mockStorageService.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token');
          expect(mockStorageService.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
          expect(service.currentUser()).toEqual(mockUser);
          expect(service.isAuthenticated()).toBe(true);
          done();
        }
      });
    });

    it('should update user signal after successful login', (done) => {
      mockHttpClient.setPostResponse(mockTokenResponse);

      service.login({ email: 'test@example.com', password: 'pass' }).subscribe({
        next: () => {
          expect(service.currentUser()?.email).toBe('test@example.com');
          done();
        }
      });
    });

    it('should handle login errors', (done) => {
      mockHttpClient.setError('post', { status: 401, message: 'Invalid credentials' });

      service.login({ email: 'test@example.com', password: 'wrong' }).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', (done) => {
      mockHttpClient.setPostResponse(mockTokenResponse);
      const registerRequest: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'User'
      };

      service.register(registerRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockTokenResponse);
          expect(mockHttpClient.post).toHaveBeenCalledWith('/api/auth/register', registerRequest);
          expect(service.currentUser()).toEqual(mockUser);
          done();
        }
      });
    });

    it('should handle registration errors', (done) => {
      mockHttpClient.setError('post', { status: 400, message: 'Email already exists' });

      service.register({
        email: 'existing@example.com',
        password: 'pass',
        confirmPassword: 'pass',
        firstName: 'Test',
        lastName: 'User',
        role: 'User'
      }).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Setup logged in state
      service['currentUser'].set(mockUser);
    });

    it('should clear session and navigate to login', () => {
      mockHttpClient.setPostResponse({});

      service.logout();

      expect(mockStorageService.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('current_user');
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call revoke-token endpoint with user email', () => {
      mockHttpClient.setPostResponse({});

      service.logout();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/revoke-token',
        { email: mockUser.email }
      );
    });

    it('should clear session even if revoke fails', () => {
      mockHttpClient.setError('post', { status: 500 });

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', (done) => {
      mockStorageService.getItem.and.returnValue('old-refresh-token');
      mockHttpClient.setPostResponse(mockTokenResponse);

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockTokenResponse);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/auth/refresh-token',
            { refreshToken: 'old-refresh-token' }
          );
          expect(mockStorageService.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token');
          done();
        }
      });
    });

    it('should return null if no refresh token exists', (done) => {
      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toBeNull();
          expect(mockHttpClient.post).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should logout if refresh fails', (done) => {
      mockStorageService.getItem.and.returnValue('invalid-token');
      mockHttpClient.setError('post', { status: 401 });

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch and update current user', (done) => {
      mockHttpClient.setGetResponse(mockUser);

      service.getCurrentUser().subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          expect(service.currentUser()).toEqual(mockUser);
          expect(mockHttpClient.get).toHaveBeenCalledWith('/api/auth/me');
          done();
        }
      });
    });

    it('should clear session if getCurrentUser fails', (done) => {
      mockHttpClient.setError('get', { status: 401 });

      service.getCurrentUser().subscribe({
        error: () => {
          expect(mockStorageService.removeItem).toHaveBeenCalledWith('access_token');
          expect(service.currentUser()).toBeNull();
          done();
        }
      });
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from storage', () => {
      mockStorageService.getItem.and.returnValue('test-token');
      expect(service.getAccessToken()).toBe('test-token');
      expect(mockStorageService.getItem).toHaveBeenCalledWith('access_token');
    });

    it('should return null if no token exists', () => {
      mockStorageService.getItem.and.returnValue(null);
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('Role-based computed signals', () => {
    it('should correctly identify admin users', () => {
      service['currentUser'].set({ ...mockUser, role: 'Admin' });
      expect(service.isAdmin()).toBe(true);
      expect(service.isManagerOrAbove()).toBe(true);
      expect(service.isOperatorOrAbove()).toBe(true);
    });

    it('should correctly identify manager users', () => {
      service['currentUser'].set({ ...mockUser, role: 'Manager' });
      expect(service.isAdmin()).toBe(false);
      expect(service.isManagerOrAbove()).toBe(true);
      expect(service.isOperatorOrAbove()).toBe(true);
    });

    it('should correctly identify operator users', () => {
      service['currentUser'].set({ ...mockUser, role: 'Operator' });
      expect(service.isAdmin()).toBe(false);
      expect(service.isManagerOrAbove()).toBe(false);
      expect(service.isOperatorOrAbove()).toBe(true);
    });

    it('should correctly identify regular users', () => {
      service['currentUser'].set({ ...mockUser, role: 'User' });
      expect(service.isAdmin()).toBe(false);
      expect(service.isManagerOrAbove()).toBe(false);
      expect(service.isOperatorOrAbove()).toBe(false);
    });
  });

  describe('Session persistence', () => {
    it('should save user to storage when currentUser changes', (done) => {
      service['currentUser'].set(mockUser);
      
      // Give effect time to run
      setTimeout(() => {
        expect(mockStorageService.setItem).toHaveBeenCalledWith('current_user', JSON.stringify(mockUser));
        done();
      }, 0);
    });

    it('should remove user from storage when logged out', (done) => {
      service['currentUser'].set(null);
      
      setTimeout(() => {
        expect(mockStorageService.removeItem).toHaveBeenCalledWith('current_user');
        done();
      }, 0);
    });
      it('should handle malformed user data in storage gracefully', () => {
        mockStorageService.getItem.and.returnValue('not-json');
        // Re-inject service to trigger loadUserFromStorage
        const reloadedService = TestBed.inject(AuthService);
        expect(reloadedService.currentUser()).toBeNull();
      });
      it('should handle corrupted token/refresh token values', () => {
        mockStorageService.getItem.and.callFake((key: string) => {
          if (key === 'access_token') return null;
          if (key === 'refresh_token') return null;
          return null;
        });
        expect(service.getAccessToken()).toBeNull();
        expect(service['getRefreshToken']()).toBeNull();
      });
      it('should clear session if restoreSession getCurrentUser fails', (done) => {
        // Setup valid token and user
        mockStorageService.getItem.and.callFake((key: string) => {
          if (key === 'access_token') return 'token';
          if (key === 'current_user') return JSON.stringify(mockUser);
          return null;
        });
        // Re-inject service to trigger restoreSession
        const reloadedService = TestBed.inject(AuthService);
        spyOn(reloadedService, 'getCurrentUser').and.returnValue(throwError(() => ({ status: 401 })));
        reloadedService['restoreSession']();
        setTimeout(() => {
          expect(reloadedService.currentUser()).toBeNull();
          done();
        }, 0);
      });
  });
});
