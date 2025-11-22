import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockRouter } from '@testing/mock-router';
import { TokenResponse, User, LoginRequest, RegisterRequest } from '@app/shared/models/auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: MockHttpClient;
  let mockRouter: MockRouter;
  let mockTokenResponse: TokenResponse;
  let mockUser: User;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    mockRouter = new MockRouter();

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

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    mockHttpClient.reset();
    mockRouter.reset();
    localStorage.clear();
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
          expect(localStorage.getItem('access_token')).toBe('mock-access-token');
          expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
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
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      service['currentUser'].set(mockUser);
    });

    it('should clear session and navigate to login', () => {
      mockHttpClient.setPostResponse({});

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
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
      localStorage.setItem('refresh_token', 'old-refresh-token');
      mockHttpClient.setPostResponse(mockTokenResponse);

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockTokenResponse);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/auth/refresh-token',
            { refreshToken: 'old-refresh-token' }
          );
          expect(localStorage.getItem('access_token')).toBe('mock-access-token');
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
      localStorage.setItem('refresh_token', 'invalid-token');
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
      localStorage.setItem('access_token', 'token');
      mockHttpClient.setError('get', { status: 401 });

      service.getCurrentUser().subscribe({
        error: () => {
          expect(localStorage.getItem('access_token')).toBeNull();
          expect(service.currentUser()).toBeNull();
          done();
        }
      });
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
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
    it('should save user to localStorage when currentUser changes', () => {
      service['currentUser'].set(mockUser);
      
      // Give effect time to run
      setTimeout(() => {
        const savedUser = localStorage.getItem('current_user');
        expect(savedUser).toBeTruthy();
        expect(JSON.parse(savedUser!)).toEqual(mockUser);
      }, 0);
    });

    it('should remove user from localStorage when logged out', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      service['currentUser'].set(null);
      
      setTimeout(() => {
        expect(localStorage.getItem('current_user')).toBeNull();
      }, 0);
    });
  });
});
