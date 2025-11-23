import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshTokenRequest,
  User
} from '@app/shared/models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Signals for reactive state management
  currentUser = signal<User | null>(this.loadUserFromStorage());
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  isManagerOrAbove = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });
  isOperatorOrAbove = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Admin' || role === 'Manager' || role === 'Operator';
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Restore auth state on app init
    this.restoreSession();

    // Auto-save user to localStorage when it changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
      }
    });
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  register(request: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Registration failed:', error);
        throw error;
      })
    );
  }

  refreshToken(): Observable<TokenResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<TokenResponse>(`${this.API_URL}/refresh-token`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    const email = this.currentUser()?.email;
    if (email) {
      // Call revoke endpoint (fire and forget)
      this.http.post(`${this.API_URL}/revoke-token`, { email }).subscribe({
        error: () => {
          // Ignore errors - we're logging out anyway
        }
      });
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(error => {
        console.error('Failed to get current user:', error);
        this.clearSession();
        throw error;
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleAuthSuccess(response: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this.currentUser.set(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private restoreSession(): void {
    const token = this.getAccessToken();
    const user = this.currentUser();

    if (token && user) {
      // Session exists, verify it's still valid
      this.getCurrentUser().subscribe({
        error: () => this.clearSession()
      });
    }
  }
}
