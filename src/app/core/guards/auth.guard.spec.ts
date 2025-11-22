import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

import { authGuard, adminGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { MockAuthService } from '@testing/mock-auth-service';
import { MockRouter } from '@testing/mock-router';
import { createMockUser } from '@testing/test-data-factories';

describe('authGuard', () => {
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    mockRoute = {
      data: {},
      params: {},
      queryParams: {},
      url: [],
      fragment: null,
      outlet: 'primary',
      component: null,
      routeConfig: null,
      title: undefined,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any
    } as ActivatedRouteSnapshot;

    mockState = {
      url: '/dashboard',
      root: {} as any
    };
  });

  describe('authentication check', () => {
    it('should allow access when user is authenticated', () => {
      mockAuthService.isAuthenticated.set(true);

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      mockAuthService.isAuthenticated.set(false);

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
    });

    it('should pass correct returnUrl in query params', () => {
      mockAuthService.isAuthenticated.set(false);
      mockState.url = '/protected/resource';

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/protected/resource' } }
      );
    });
  });

  describe('role-based access', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.set(true);
    });

    it('should allow access when no role is required', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Viewer' }));
      mockRoute.data = {};

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should allow Viewer access to Viewer-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Viewer' }));
      mockRoute.data = { role: 'Viewer' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should allow Operator access to Viewer-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Operator' }));
      mockRoute.data = { role: 'Viewer' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should allow Manager access to Operator-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Manager' }));
      mockRoute.data = { role: 'Operator' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should allow Admin access to any route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Admin' }));
      mockRoute.data = { role: 'Manager' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should deny Viewer access to Operator-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Viewer' }));
      mockRoute.data = { role: 'Operator' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should deny Operator access to Manager-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Operator' }));
      mockRoute.data = { role: 'Manager' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should deny Manager access to Admin-required route', () => {
      mockAuthService.currentUser.set(createMockUser({ role: 'Manager' }));
      mockRoute.data = { role: 'Admin' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should deny access when user has no role', () => {
      mockAuthService.currentUser.set(createMockUser({ role: '' }));
      mockRoute.data = { role: 'Viewer' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
    });

    it('should deny access when currentUser is null', () => {
      mockAuthService.currentUser.set(null as any);
      mockRoute.data = { role: 'Viewer' };

      const result = TestBed.runInInjectionContext(() => 
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
    });
  });

  describe('role hierarchy', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.set(true);
    });

    it('should respect role hierarchy: Viewer < Operator < Manager < Admin', () => {
      const roles = ['Viewer', 'Operator', 'Manager', 'Admin'];
      
      for (let i = 0; i < roles.length; i++) {
        for (let j = 0; j < roles.length; j++) {
          mockAuthService.currentUser.set(createMockUser({ role: roles[i] }));
          mockRoute.data = { role: roles[j] };

          const result = TestBed.runInInjectionContext(() => 
            authGuard(mockRoute, mockState)
          );

          // User can access if their role level >= required role level
          expect(result).toBe(i >= j);
        }
      }
    });
  });
});

describe('adminGuard', () => {
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    mockRoute = {
      data: {},
      params: {},
      queryParams: {},
      url: [],
      fragment: null,
      outlet: 'primary',
      component: null,
      routeConfig: null,
      title: undefined,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any
    } as ActivatedRouteSnapshot;

    mockState = {
      url: '/admin',
      root: {} as any
    };
  });

  it('should allow access when user is admin', () => {
    mockAuthService.isAdmin.set(true);

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user is not admin', () => {
    mockAuthService.isAdmin.set(false);

    const result = TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home when non-admin tries to access', () => {
    mockAuthService.isAdmin.set(false);

    TestBed.runInInjectionContext(() => 
      adminGuard(mockRoute, mockState)
    );

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
